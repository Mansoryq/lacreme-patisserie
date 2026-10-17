import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";

export async function POST() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      return NextResponse.json({
        success: false,
        error: "Токен бота (TELEGRAM_BOT_TOKEN) или Chat ID (TELEGRAM_CHAT_ID) не заданы в .env.local",
      });
    }

    const testMessage =
      `🔔 <b>ТЕСТОВОЕ СООБЩЕНИЕ LA CRÈMЕ BOT</b>\n\n` +
      `Интеграция с Telegram успешно настроена и готова к приему реальных заказов.\n` +
      `Время проверки: ${new Date().toLocaleString("ru-RU", { timeZone: "Asia/Almaty" })}`;

    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: testMessage,
        parse_mode: "HTML",
      }),
    });

    const resJson = await res.json();

    if (!res.ok || !resJson.ok) {
      return NextResponse.json({
        success: false,
        error: resJson.description || "Ошибка Telegram API",
      });
    }

    return NextResponse.json({
      success: true,
      message: "Тестовое уведомление успешно отправлено в Telegram-чат!",
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
