import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { retryFailedTelegramNotifications } from "@/lib/telegram";

export async function POST() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const retriedCount = await retryFailedTelegramNotifications();

    return NextResponse.json({
      success: true,
      message: `Повторная отправка завершена. Успешно отправлено: ${retriedCount}`,
      retriedCount,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
