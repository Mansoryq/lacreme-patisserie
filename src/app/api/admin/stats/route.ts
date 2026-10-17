import { NextResponse } from "next/server";
import getDb from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();
    const todayStr = new Date().toISOString().split("T")[0];

    // Status counts
    const statusCounts = db.prepare(`
      SELECT status, COUNT(id) as count
      FROM orders
      GROUP BY status
    `).all() as { status: string; count: number }[];

    const statusMap: Record<string, number> = {
      new: 0,
      pending: 0,
      confirmed: 0,
      in_progress: 0,
      ready: 0,
      completed: 0,
      cancelled: 0,
    };
    for (const sc of statusCounts) {
      statusMap[sc.status] = sc.count;
    }

    // Revenue
    const revenueRow = db.prepare(`
      SELECT COALESCE(SUM(total_amount), 0) as total_revenue
      FROM orders
      WHERE status != 'cancelled'
    `).get() as any;

    // Today's orders
    const todayOrdersCount = db.prepare(`
      SELECT COUNT(id) as count
      FROM orders
      WHERE DATE(created_at) = ?
    `).get(todayStr) as any;

    // Today's pickups
    const todayPickupsCount = db.prepare(`
      SELECT COUNT(id) as count
      FROM orders
      WHERE pickup_date = ? AND status != 'cancelled'
    `).get(todayStr) as any;

    // Recent 5 orders
    const recentOrders = db.prepare(`
      SELECT id, order_number, customer_name, customer_phone, total_amount, status, pickup_date, pickup_time, created_at
      FROM orders
      ORDER BY id DESC
      LIMIT 6
    `).all();

    // Telegram notifications health
    const tgLogs = db.prepare(`
      SELECT status, COUNT(id) as count
      FROM notification_logs
      GROUP BY status
    `).all() as { status: string; count: number }[];

    const tgHealth: Record<string, number> = { sent: 0, failed: 0, pending: 0 };
    for (const t of tgLogs) {
      tgHealth[t.status] = t.count;
    }

    return NextResponse.json({
      success: true,
      stats: {
        totalOrders: Object.values(statusMap).reduce((a, b) => a + b, 0),
        totalRevenue: revenueRow?.total_revenue || 0,
        todayOrders: todayOrdersCount?.count || 0,
        todayPickups: todayPickupsCount?.count || 0,
        byStatus: statusMap,
        recentOrders,
        telegramHealth: tgHealth,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
