import { NextResponse } from "next/server";
import getDb from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const { orderNumber } = await params;
    const db = getDb();

    const order = db.prepare(`
      SELECT id, order_number, customer_name, customer_phone, order_type,
             delivery_address, pickup_date, pickup_time, total_amount,
             comment, status, created_at
      FROM orders
      WHERE order_number = ?
    `).get(orderNumber) as any;

    if (!order) {
      return NextResponse.json({ success: false, error: "Заявка не найдена" }, { status: 404 });
    }

    const items = db.prepare(`
      SELECT product_name, price, quantity, total
      FROM order_items
      WHERE order_id = ?
    `).all(order.id);

    return NextResponse.json({
      success: true,
      order: {
        ...order,
        items,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
