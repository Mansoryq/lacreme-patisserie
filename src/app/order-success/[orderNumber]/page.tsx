import React from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CheckCircle2, Calendar, Clock, MapPin, Phone, ArrowRight, MessageCircle } from "lucide-react";
import getDb from "@/lib/db";

interface Props {
  params: Promise<{ orderNumber: string }>;
}

export default async function OrderSuccessPage({ params }: Props) {
  const { orderNumber } = await params;
  const db = getDb();

  const order = db.prepare(`
    SELECT * FROM orders WHERE order_number = ?
  `).get(orderNumber) as any;

  if (!order) {
    notFound();
  }

  const items = db.prepare(`
    SELECT oi.*, p.image_url
    FROM order_items oi
    LEFT JOIN products p ON p.id = oi.product_id
    WHERE oi.order_id = ?
  `).all(order.id) as any[];

  return (
    <div className="pt-28 pb-24 max-w-3xl mx-auto px-4 sm:px-6">
      <div className="bg-white rounded-3xl border border-cream-200/80 shadow-xl overflow-hidden p-6 sm:p-10 space-y-8">
        {/* Success Header */}
        <div className="text-center space-y-3 pb-6 border-b border-cream-200">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto mb-2">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <span className="text-xs uppercase tracking-widest text-brand-violet font-semibold block">
            Заявка успешно оформлена
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-noir-950 font-normal">
            Спасибо за ваш заказ!
          </h1>
          <p className="text-sm text-noir-600 font-light max-w-md mx-auto leading-relaxed">
            Мы уже получили вашу заявку и передали ее в кондитерский цех La Crème.
          </p>

          <div className="inline-block px-5 py-2 rounded-full bg-cream-100 border border-cream-300 text-sm font-semibold text-noir-900 mt-2">
            Номер заказа: <span className="font-mono text-brand-violet">{order.order_number}</span>
          </div>
        </div>

        {/* Next Steps Notification */}
        <div className="p-5 rounded-2xl bg-cream-100/70 border border-cream-200 text-xs sm:text-sm text-noir-800 space-y-2">
          <b className="font-semibold text-noir-950 block">Что происходит дальше?</b>
          <p className="leading-relaxed font-light text-noir-600">
            Менеджер кондитерской свяжется с вами по указанному телефону (<b>{order.customer_phone}</b>) в течение 15 минут для подтверждения времени, деталей оформления и готовности.
          </p>
        </div>

        {/* Schedule & Pickup Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200 flex items-start gap-3">
            <Calendar className="w-5 h-5 text-brand-violet flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-[11px] text-noir-500 uppercase tracking-wider block">
                Дата получения
              </span>
              <span className="font-medium text-sm text-noir-900 block mt-0.5">
                {order.pickup_date}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200 flex items-start gap-3">
            <Clock className="w-5 h-5 text-brand-violet flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-[11px] text-noir-500 uppercase tracking-wider block">
                Время получения
              </span>
              <span className="font-medium text-sm text-noir-900 block mt-0.5">
                {order.pickup_time}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200 flex items-start gap-3 sm:col-span-2">
            <MapPin className="w-5 h-5 text-brand-violet flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-[11px] text-noir-500 uppercase tracking-wider block">
                {order.order_type === "delivery" ? "Адрес доставки" : "Пункт самовывоза"}
              </span>
              <span className="font-medium text-sm text-noir-900 block mt-0.5">
                {order.order_type === "delivery"
                  ? order.delivery_address || "Адрес уточняется менеджером"
                  : "г. Астана, ул. Достык, 16 (Talan Towers, бутик La Crème)"}
              </span>
            </div>
          </div>
        </div>

        {/* Items Breakdown */}
        <div className="space-y-4 pt-2">
          <h3 className="font-serif text-lg font-medium text-noir-900 border-b border-cream-200 pb-2">
            Состав заказа:
          </h3>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-cream-100 flex-shrink-0">
                    <Image
                      src={item.image_url || "/images/products/porsche-cake.jpg"}
                      alt={item.product_name}
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  </div>
                  <div>
                    <span className="font-medium text-noir-900 block">{item.product_name}</span>
                    <span className="text-[11px] text-noir-500 block">
                      {item.quantity} шт × {item.price.toLocaleString("ru-RU")} ₸
                    </span>
                  </div>
                </div>
                <span className="font-semibold text-noir-900">
                  {item.total.toLocaleString("ru-RU")} ₸
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-cream-200 pt-4 flex items-baseline justify-between">
            <span className="font-serif text-base text-noir-900 font-medium">Итого к оплате при получении:</span>
            <span className="font-serif text-2xl font-bold text-noir-950">
              {order.total_amount.toLocaleString("ru-RU")} ₸
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
          <Link
            href="/catalog"
            className="w-full sm:flex-1 py-3.5 px-6 rounded-xl bg-noir-900 hover:bg-brand-violet text-cream-50 text-center font-medium text-xs tracking-wider uppercase transition-colors btn-press"
          >
            Вернуться в каталог
          </Link>
          <a
            href="https://wa.me/77010002016"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs tracking-wider uppercase transition-colors btn-press"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Написать в WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}
