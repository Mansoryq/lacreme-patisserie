import getDb from "./db";

export interface TelegramOrderPayload {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  orderType: "pickup" | "delivery";
  deliveryAddress?: string;
  pickupDate: string;
  pickupTime: string;
  totalAmount: number;
  comment?: string;
  status: string;
  createdAt: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
}

export function formatTelegramMessage(order: TelegramOrderPayload, adminUrl: string): string {
  const itemsText = order.items
    .map(
      (item, idx) =>
        `${idx + 1}. <b>${escapeHtml(item.name)}</b>\n` +
        `   Количество: ${item.quantity}\n` +
        `   Цена за ед.: ${item.price.toLocaleString("ru-RU")} ₸\n` +
        `   Сумма: ${item.total.toLocaleString("ru-RU")} ₸`
    )
    .join("\n\n");

  const typeText =
    order.orderType === "delivery"
      ? `🚗 Доставка\n<b>Адрес:</b> ${escapeHtml(order.deliveryAddress || "Не указан")}`
      : "🛍️ Самовывоз из бутика La Crème";

  return `✨ <b>НОВАЯ ЗАЯВКА НА ЗАКАЗ №${escapeHtml(order.orderNumber)}</b>\n\n` +
    `👤 <b>Клиент:</b> ${escapeHtml(order.customerName)}\n` +
    `📞 <b>Телефон:</b> <code>${escapeHtml(order.customerPhone)}</code>\n\n` +
    `📅 <b>Дата получения:</b> ${escapeHtml(order.pickupDate)}\n` +
    `⏰ <b>Время:</b> ${escapeHtml(order.pickupTime)}\n` +
    `📍 <b>Тип:</b> ${typeText}\n\n` +
    `📋 <b>СОСТАВ ЗАКАЗА:</b>\n${itemsText}\n\n` +
    `💰 <b>ИТОГО: ${order.totalAmount.toLocaleString("ru-RU")} ₸</b>\n\n` +
    `💬 <b>Комментарий:</b> ${escapeHtml(order.comment?.trim() || "Не указан")}\n` +
    `⚡ <b>Статус:</b> Новая заявка\n` +
    `🕐 <b>Создано:</b> ${escapeHtml(order.createdAt)}\n\n` +
    `🔗 <b>В админ-панели:</b> <a href="${adminUrl}">Открыть заказ</a>`;
}

export async function sendTelegramOrderNotification(
  orderId: number,
  order: TelegramOrderPayload
): Promise<{ success: boolean; error?: string }> {
  const db = getDb();
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const adminUrl = `${baseUrl}/admin/orders/${order.orderNumber}`;

  const messageText = formatTelegramMessage(order, adminUrl);

  // If credentials are not configured, log it safely without failing the order
  if (!token || !chatId) {
    const errorMsg = "Telegram bot token or chat ID not configured in environment variables";
    db.prepare(`
      INSERT INTO notification_logs (order_id, channel, status, payload, error_message, attempts)
      VALUES (?, 'telegram', 'pending', ?, ?, 1)
    `).run(orderId, JSON.stringify(order), errorMsg);

    return { success: false, error: errorMsg };
  }

  try {
    const cleanPhone = order.customerPhone.replace(/[^0-9+]/g, "");
    const replyMarkup = {
      inline_keyboard: [
        [
          { text: "👁️ Открыть в админке", url: adminUrl },
          { text: "📞 Позвонить", url: `tel:${cleanPhone}` },
        ],
        [
          { text: "💬 WhatsApp", url: `https://wa.me/${cleanPhone.replace("+", "")}` }
        ]
      ],
    };

    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: messageText,
        parse_mode: "HTML",
        disable_web_page_preview: true,
        reply_markup: replyMarkup,
      }),
    });

    const resJson = await response.json();

    if (!response.ok || !resJson.ok) {
      const errStr = resJson.description || response.statusText || "Telegram API Error";
      db.prepare(`
        INSERT INTO notification_logs (order_id, channel, status, payload, error_message, attempts)
        VALUES (?, 'telegram', 'failed', ?, ?, 1)
      `).run(orderId, JSON.stringify(order), errStr);

      return { success: false, error: errStr };
    }

    db.prepare(`
      INSERT INTO notification_logs (order_id, channel, status, payload, error_message, attempts)
      VALUES (?, 'telegram', 'sent', ?, NULL, 1)
    `).run(orderId, JSON.stringify(order));

    return { success: true };
  } catch (err: any) {
    const errMsg = err?.message || "Network exception contacting Telegram API";
    db.prepare(`
      INSERT INTO notification_logs (order_id, channel, status, payload, error_message, attempts)
      VALUES (?, 'telegram', 'failed', ?, ?, 1)
    `).run(orderId, JSON.stringify(order), errMsg);

    return { success: false, error: errMsg };
  }
}

export async function retryFailedTelegramNotifications(): Promise<number> {
  const db = getDb();
  const failedLogs = db.prepare(`
    SELECT n.*, o.order_number, o.customer_name, o.customer_phone, o.order_type,
           o.delivery_address, o.pickup_date, o.pickup_time, o.total_amount,
           o.comment, o.status as order_status, o.created_at
    FROM notification_logs n
    JOIN orders o ON o.id = n.order_id
    WHERE n.status = 'failed' OR n.status = 'pending'
    ORDER BY n.id ASC
    LIMIT 10
  `).all() as any[];

  let successfulRetries = 0;

  for (const log of failedLogs) {
    const items = db.prepare(`
      SELECT product_name as name, quantity, price, total
      FROM order_items
      WHERE order_id = ?
    `).all(log.order_id) as any[];

    const payload: TelegramOrderPayload = {
      orderNumber: log.order_number,
      customerName: log.customer_name,
      customerPhone: log.customer_phone,
      orderType: log.order_type,
      deliveryAddress: log.delivery_address,
      pickupDate: log.pickup_date,
      pickupTime: log.pickup_time,
      totalAmount: log.total_amount,
      comment: log.comment,
      status: log.order_status,
      createdAt: log.created_at,
      items: items,
    };

    const res = await sendTelegramOrderNotification(log.order_id, payload);
    if (res.success) {
      successfulRetries++;
      db.prepare(`
        UPDATE notification_logs
        SET status = 'sent', error_message = NULL, last_attempt_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(log.id);
    } else {
      db.prepare(`
        UPDATE notification_logs
        SET attempts = attempts + 1, error_message = ?, last_attempt_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(res.error || "Retry failed", log.id);
    }
  }

  return successfulRetries;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
