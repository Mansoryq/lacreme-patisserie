import { NextResponse } from "next/server";
import getDb from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const date = searchParams.get("date");

    const db = getDb();
    let query = `
      SELECT o.*,
             COUNT(oi.id) as items_count,
             COALESCE(nl.status, 'none') as telegram_status
      FROM orders o
      LEFT JOIN order_items oi ON oi.order_id = o.id
      LEFT JOIN notification_logs nl ON nl.order_id = o.id
    `;

    const whereClauses: string[] = [];
    const params: any[] = [];

    if (status && status !== "all") {
      whereClauses.push("o.status = ?");
      params.push(status);
    }

    if (date) {
      whereClauses.push("o.pickup_date = ?");
      params.push(date);
    }

    if (search && search.trim() !== "") {
      whereClauses.push("(o.order_number LIKE ? OR o.customer_name LIKE ? OR o.customer_phone LIKE ?)");
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    if (whereClauses.length > 0) {
      query += ` WHERE ` + whereClauses.join(" AND ");
    }

    query += ` GROUP BY o.id ORDER BY o.id DESC LIMIT 100`;

    const orders = db.prepare(query).all(...params);

    return NextResponse.json({ success: true, orders });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
