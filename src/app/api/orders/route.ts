import { NextResponse } from "next/server";
import getDb from "@/lib/db";
import { sendTelegramOrderNotification, TelegramOrderPayload } from "@/lib/telegram";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerPhone,
      customerEmail,
      orderType,
      deliveryAddress,
      pickupDate,
      pickupTime,
      comment,
      idempotencyKey,
      items,
    } = body;

    // 1. Validation of required customer fields
    if (!customerName || typeof customerName !== "string" || customerName.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: "Пожалуйста, укажите ваше имя (минимум 2 символа)" },
        { status: 400 }
      );
    }

    if (!customerPhone || typeof customerPhone !== "string" || customerPhone.trim().length < 7) {
      return NextResponse.json(
        { success: false, error: "Пожалуйста, укажите корректный номер телефона для подтверждения заказа" },
        { status: 400 }
      );
    }

    if (!pickupDate || !/^\d{4}-\d{2}-\d{2}$/.test(pickupDate)) {
      return NextResponse.json(
        { success: false, error: "Пожалуйста, выберите корректную дату получения" },
        { status: 400 }
      );
    }

    if (!pickupTime || typeof pickupTime !== "string") {
      return NextResponse.json(
        { success: false, error: "Пожалуйста, выберите интервал времени" },
        { status: 400 }
      );
    }

    const validOrderType = orderType === "delivery" ? "delivery" : "pickup";
    if (validOrderType === "delivery" && (!deliveryAddress || deliveryAddress.trim().length < 5)) {
      return NextResponse.json(
        { success: false, error: "Пожалуйста, укажите адрес доставки" },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Корзина пуста. Выберите десерты из каталога" },
        { status: 400 }
      );
    }

    // 2. Date validation: no past dates
    const todayStr = new Date().toISOString().split("T")[0];
    if (pickupDate < todayStr) {
      return NextResponse.json(
        { success: false, error: "Нельзя оформить заявку на прошедшую дату" },
        { status: 400 }
      );
    }

    const db = getDb();

    // 3. Idempotency Check: if idempotencyKey supplied and already exists, return existing order
    if (idempotencyKey && typeof idempotencyKey === "string") {
      const existing = db.prepare(`SELECT * FROM orders WHERE idempotency_key = ?`).get(idempotencyKey) as any;
      if (existing) {
        return NextResponse.json({
          success: true,
          orderNumber: existing.order_number,
          totalAmount: existing.total_amount,
          status: existing.status,
          message: "Заявка уже успешно оформлена",
        });
      }
    }

    // 4. Server-Side Price Verification from Database (NEVER TRUST CLIENT PRICES)
    let calculatedTotal = 0;
    const validatedItems: Array<{
      productId: number;
      name: string;
      price: number;
      quantity: number;
      total: number;
      isPreorder: boolean;
    }> = [];

    const getProductStmt = db.prepare(`
      SELECT id, name, price, is_active, is_preorder
      FROM products
      WHERE id = ?
    `);

    for (const item of items) {
      const prodId = parseInt(item.id || item.productId, 10);
      const qty = parseInt(item.quantity, 10);

      if (isNaN(prodId) || isNaN(qty) || qty <= 0) {
        return NextResponse.json(
          { success: false, error: "Некорректное количество товара в корзине" },
          { status: 400 }
        );
      }

      const dbProduct = getProductStmt.get(prodId) as any;
      if (!dbProduct || dbProduct.is_active !== 1) {
        return NextResponse.json(
          { success: false, error: `Товар "${item.name || prodId}" временно недоступен для заказа` },
          { status: 400 }
        );
      }

      const itemTotal = dbProduct.price * qty;
      calculatedTotal += itemTotal;

      validatedItems.push({
        productId: dbProduct.id,
        name: dbProduct.name,
        price: dbProduct.price,
        quantity: qty,
        total: itemTotal,
        isPreorder: dbProduct.is_preorder === 1,
      });
    }

    if (calculatedTotal <= 0) {
      return NextResponse.json(
        { success: false, error: "Итоговая сумма заказа некорректна" },
        { status: 400 }
      );
    }

    // 5. Preorder lead time check
    const hasPreorder = validatedItems.some((i) => i.isPreorder);
    if (hasPreorder && pickupDate === todayStr) {
      return NextResponse.json(
        {
          success: false,
          error: "В заказе есть торты по предзаказу. Минимальный срок изготовления — от 24 часов (выберите дату со следующего дня)",
        },
        { status: 400 }
      );
    }

    // 6. Check slot capacity
    const slotConfig = db.prepare(`SELECT max_orders FROM time_slots WHERE slot_label = ? AND is_active = 1`).get(pickupTime) as any;
    if (slotConfig) {
      const currentBookings = db.prepare(`
        SELECT COUNT(id) as count
        FROM orders
        WHERE pickup_date = ? AND pickup_time = ? AND status != 'cancelled'
      `).get(pickupDate, pickupTime) as any;

      if (currentBookings && currentBookings.count >= slotConfig.max_orders) {
        return NextResponse.json(
          {
            success: false,
            error: `Интервал ${pickupTime} на дату ${pickupDate} уже полностью заполнен. Пожалуйста, выберите другое время.`,
          },
          { status: 409 }
        );
      }
    }

    // 7. Generate Unique Public Order Number LC-XXXXXX (6 digits)
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const orderNumber = `LC-${randomSuffix}`;

    // 8. Transactional insert
    const insertTransaction = db.transaction(() => {
      const insertOrderStmt = db.prepare(`
        INSERT INTO orders (
          order_number, customer_name, customer_phone, customer_email,
          order_type, delivery_address, pickup_date, pickup_time,
          total_amount, comment, status, idempotency_key
        ) VALUES (
          ?, ?, ?, ?,
          ?, ?, ?, ?,
          ?, ?, 'new', ?
        )
      `);

      const orderResult = insertOrderStmt.run(
        orderNumber,
        customerName.trim(),
        customerPhone.trim(),
        customerEmail?.trim() || null,
        validOrderType,
        deliveryAddress?.trim() || null,
        pickupDate,
        pickupTime,
        calculatedTotal,
        comment?.trim() || null,
        idempotencyKey || null
      );

      const orderId = orderResult.lastInsertRowid as number;

      const insertItemStmt = db.prepare(`
        INSERT INTO order_items (order_id, product_id, product_name, price, quantity, total)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      for (const vItem of validatedItems) {
        insertItemStmt.run(
          orderId,
          vItem.productId,
          vItem.name,
          vItem.price,
          vItem.quantity,
          vItem.total
        );
      }

      return orderId;
    });

    const newOrderId = insertTransaction();

    // 9. Trigger Telegram notification asynchronously / server-side
    const createdAtStr = new Date().toLocaleString("ru-RU", { timeZone: "Asia/Almaty" });
    const telegramPayload: TelegramOrderPayload = {
      orderNumber,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      orderType: validOrderType,
      deliveryAddress: deliveryAddress?.trim(),
      pickupDate,
      pickupTime,
      totalAmount: calculatedTotal,
      comment: comment?.trim(),
      status: "Новая заявка",
      createdAt: createdAtStr,
      items: validatedItems.map((vi) => ({
        name: vi.name,
        quantity: vi.quantity,
        price: vi.price,
        total: vi.total,
      })),
    };

    // Non-blocking trigger so client never waits or fails if TG is slow
    sendTelegramOrderNotification(newOrderId, telegramPayload).catch((err) => {
      console.error("Async Telegram notification error:", err);
    });

    return NextResponse.json({
      success: true,
      orderNumber,
      totalAmount: calculatedTotal,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      pickupDate,
      pickupTime,
      orderType: validOrderType,
      message: "Заявка успешно принята и отправлена в кондитерскую",
    });
  } catch (err: any) {
    console.error("Order creation error:", err);
    return NextResponse.json(
      { success: false, error: "Произошла ошибка при сохранении заявки. Пожалуйста, попробуйте снова." },
      { status: 500 }
    );
  }
}
