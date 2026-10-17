import { NextResponse } from "next/server";
import getDb from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date"); // YYYY-MM-DD

    const db = getDb();

    // Fetch schedule settings
    const settingsRows = db.prepare(`SELECT key, value FROM schedule_settings`).all() as { key: string; value: string }[];
    const settings: Record<string, string> = {};
    for (const r of settingsRows) {
      settings[r.key] = r.value;
    }

    // Fetch time slots
    const slots = db.prepare(`
      SELECT id, slot_label, max_orders, is_active
      FROM time_slots
      WHERE is_active = 1
      ORDER BY display_order ASC
    `).all() as any[];

    // If specific date requested, calculate slot occupancies
    let slotsAvailability = slots.map((s) => ({
      id: s.id,
      label: s.slot_label,
      available: true,
      remaining: s.max_orders,
    }));

    if (date) {
      const ordersPerSlot = db.prepare(`
        SELECT pickup_time, COUNT(id) as count
        FROM orders
        WHERE pickup_date = ? AND status != 'cancelled'
        GROUP BY pickup_time
      `).all(date) as { pickup_time: string; count: number }[];

      const countMap: Record<string, number> = {};
      for (const row of ordersPerSlot) {
        countMap[row.pickup_time] = row.count;
      }

      slotsAvailability = slots.map((s) => {
        const booked = countMap[s.slot_label] || 0;
        const remaining = Math.max(0, s.max_orders - booked);
        return {
          id: s.id,
          label: s.slot_label,
          available: remaining > 0,
          remaining: remaining,
        };
      });
    }

    return NextResponse.json({
      success: true,
      settings: {
        minLeadTimeHours: parseInt(settings.min_lead_time_hours || "3", 10),
        preorderLeadTimeDays: parseInt(settings.preorder_lead_time_days || "1", 10),
        maxHorizonDays: parseInt(settings.max_booking_horizon_days || "30", 10),
        ordersEnabled: settings.is_orders_enabled !== "false",
        closedDays: JSON.parse(settings.closed_days || "[]"),
        businessHoursStart: settings.business_hours_start || "09:00",
        businessHoursEnd: settings.business_hours_end || "22:00",
      },
      slots: slotsAvailability,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
