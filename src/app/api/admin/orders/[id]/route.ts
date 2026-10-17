import { NextResponse } from "next/server";
import getDb from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const db = getDb();

    // Check by id or order_number
    let order: any;
    if (/^\d+$/.test(id)) {
      order = db.prepare(`SELECT * FROM orders WHERE id = ?`).get(parseInt(id, 10));
    } else {
      order = db.prepare(`SELECT * FROM orders WHERE order_number = ?`).get(id);
    }

    if (!order) {
      return NextResponse.json({ success: false, error: "Заказ не найден" }, { status: 404 });
    }

    const items = db.prepare(`
      SELECT oi.*, p.slug as product_slug, p.image_url
      FROM order_items oi
      LEFT JOIN products p ON p.id = oi.product_id
      WHERE oi.order_id = ?
    `).all(order.id);

    const logs = db.prepare(`
      SELECT * FROM notification_logs WHERE order_id = ? ORDER BY id DESC
    `).all(order.id);

    return NextResponse.json({ success: true, order: { ...order, items, logs } });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, adminNotes } = body;

    const db = getDb();

    const allowedStatuses = [
      "new",
      "pending",
      "confirmed",
      "in_progress",
      "ready",
      "completed",
      "cancelled",
    ];

    let orderId: number;
    if (/^\d+$/.test(id)) {
      orderId = parseInt(id, 10);
    } else {
      const found = db.prepare(`SELECT id FROM orders WHERE order_number = ?`).get(id) as any;
      if (!found) {
        return NextResponse.json({ success: false, error: "Заказ не найден" }, { status: 404 });
      }
      orderId = found.id;
    }

    if (status && !allowedStatuses.includes(status)) {
      return NextResponse.json({ success: false, error: "Недопустимый статус" }, { status: 400 });
    }

    const updates: string[] = ["updated_at = CURRENT_TIMESTAMP"];
    const values: any[] = [];

    if (status) {
      updates.push("status = ?");
      values.push(status);
    }

    if (adminNotes !== undefined) {
      updates.push("admin_notes = ?");
      values.push(adminNotes);
    }

    values.push(orderId);

    db.prepare(`UPDATE orders SET ${updates.join(", ")} WHERE id = ?`).run(...values);

    const updated = db.prepare(`SELECT * FROM orders WHERE id = ?`).get(orderId);

    return NextResponse.json({ success: true, order: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
