"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Phone,
  User,
  MessageSquare,
  Truck,
  Store,
} from "lucide-react";
import { useCart } from "@/context/CartContext";

interface TimeSlot {
  id: number;
  label: string;
  available: boolean;
  remaining: number;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalAmount, totalCount, clearCart, hasPreorderItems, updateQuantity, removeItem } = useCart();

  // Form states
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("+7 ");
  const [customerEmail, setCustomerEmail] = useState("");
  const [orderType, setOrderType] = useState<"pickup" | "delivery">("pickup");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [comment, setComment] = useState("");

  // Schedule & Slots state
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Min selectable date: today or tomorrow if has preorder
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const minDateStr = hasPreorderItems
    ? tomorrow.toISOString().split("T")[0]
    : today.toISOString().split("T")[0];

  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + 30);
  const maxDateStr = maxDate.toISOString().split("T")[0];

  // Set default date when minDateStr changes
  useEffect(() => {
    if (!pickupDate || pickupDate < minDateStr) {
      setPickupDate(minDateStr);
    }
  }, [minDateStr, pickupDate]);

  // Fetch slots for selected date
  useEffect(() => {
    if (!pickupDate) return;

    let isMounted = true;
    setLoadingSlots(true);
    fetch(`/api/schedule?date=${pickupDate}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.success && Array.isArray(data.slots)) {
          setSlots(data.slots);
          // Auto select first available slot
          const firstAvailable = data.slots.find((s: TimeSlot) => s.available);
          if (firstAvailable && (!pickupTime || !data.slots.some((s: TimeSlot) => s.label === pickupTime && s.available))) {
            setPickupTime(firstAvailable.label);
          }
        }
      })
      .catch((err) => {
        console.error("Error fetching schedule:", err);
      })
      .finally(() => {
        if (isMounted) setLoadingSlots(false);
      });

    return () => {
      isMounted = false;
    };
  }, [pickupDate]);

  // Handle phone format
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (!val.startsWith("+7")) {
      val = "+7 " + val.replace(/[^0-9]/g, "");
    }
    setCustomerPhone(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (items.length === 0) {
      setErrorMessage("Ваша корзина пуста. Пожалуйста, добавьте десерты из каталога.");
      return;
    }

    if (!customerName.trim() || customerName.trim().length < 2) {
      setErrorMessage("Пожалуйста, укажите ваше имя.");
      return;
    }

    const cleanPhone = customerPhone.replace(/[^0-9]/g, "");
    if (cleanPhone.length < 11) {
      setErrorMessage("Пожалуйста, введите полный номер телефона для связи.");
      return;
    }

    if (!pickupDate) {
      setErrorMessage("Пожалуйста, выберите дату получения заказа.");
      return;
    }

    if (!pickupTime) {
      setErrorMessage("Пожалуйста, выберите интервал времени получения.");
      return;
    }

    if (orderType === "delivery" && (!deliveryAddress.trim() || deliveryAddress.trim().length < 5)) {
      setErrorMessage("Пожалуйста, укажите точный адрес доставки в Астане.");
      return;
    }

    setSubmitting(true);

    try {
      // Generate a unique idempotency key
      const idempotencyKey = `idemp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerPhone,
          customerEmail,
          orderType,
          deliveryAddress: orderType === "delivery" ? deliveryAddress : undefined,
          pickupDate,
          pickupTime,
          comment,
          idempotencyKey,
          items: items.map((i) => ({
            id: i.id,
            quantity: i.quantity,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Произошла ошибка при сохранении заявки. Пожалуйста, попробуйте еще раз.");
        setSubmitting(false);
        return;
      }

      // Clear cart & redirect to success confirmation
      clearCart();
      router.push(`/order-success/${data.orderNumber}`);
    } catch (err: any) {
      setErrorMessage("Сетевая ошибка при отправке заявки. Проверьте соединение и повторите.");
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="pt-32 pb-24 max-w-3xl mx-auto px-4 text-center">
        <div className="w-20 h-20 rounded-full bg-cream-200 flex items-center justify-center mx-auto mb-6 text-brand-violet">
          <ShoppingBag className="w-10 h-10 stroke-1" />
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl text-noir-950 font-normal mb-3">
          Ваша корзина пуста
        </h1>
        <p className="text-sm text-noir-600 font-light mb-8 max-w-md mx-auto leading-relaxed">
          В вашей корзине пока нет десертов. Перейдите в каталог La Crème, чтобы выбрать торты, выпечку или авторские наборы.
        </p>
        <Link
          href="/catalog"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-noir-900 hover:bg-brand-violet text-cream-50 text-xs tracking-widest uppercase font-semibold transition-all btn-press"
        >
          <span>Перейти в каталог</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Title */}
      <div className="mb-10 space-y-2">
        <span className="text-xs tracking-[0.25em] uppercase text-brand-violet font-semibold block">
          Оформление заявки
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-noir-950 font-normal">
          Детали заказа и дата получения
        </h1>
        <p className="text-xs text-noir-500 font-light">
          Без онлайн-оплаты. Менеджер свяжется с вами для подтверждения заказа.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-8 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-xs sm:text-sm flex items-start gap-3 animate-fade-in">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <b className="font-semibold block mb-0.5">Внимание</b>
            {errorMessage}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Left Form: Customer info & Date selection */}
          <div className="lg:col-span-7 space-y-8">
            {/* 1. Receiving Method */}
            <div className="p-6 rounded-3xl bg-white border border-cream-200 shadow-sm space-y-4">
              <h2 className="font-serif text-xl font-medium text-noir-900 flex items-center gap-2">
                <Store className="w-5 h-5 text-brand-violet" />
                <span>1. Способ получения</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label
                  onClick={() => setOrderType("pickup")}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                    orderType === "pickup"
                      ? "border-brand-violet bg-brand-violet/5 ring-1 ring-brand-violet"
                      : "border-cream-200 bg-cream-50/50 hover:bg-cream-100/60"
                  }`}
                >
                  <input
                    type="radio"
                    name="orderType"
                    checked={orderType === "pickup"}
                    onChange={() => setOrderType("pickup")}
                    className="mt-1 text-brand-violet focus:ring-brand-violet"
                  />
                  <div>
                    <span className="font-semibold text-sm text-noir-900 block">
                      Самовывоз из бутика
                    </span>
                    <span className="text-xs text-noir-500 font-light block mt-0.5">
                      г. Астана, ул. Достык, 16 (Talan Towers) • Бесплатно
                    </span>
                  </div>
                </label>

                <label
                  onClick={() => setOrderType("delivery")}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                    orderType === "delivery"
                      ? "border-brand-violet bg-brand-violet/5 ring-1 ring-brand-violet"
                      : "border-cream-200 bg-cream-50/50 hover:bg-cream-100/60"
                  }`}
                >
                  <input
                    type="radio"
                    name="orderType"
                    checked={orderType === "delivery"}
                    onChange={() => setOrderType("delivery")}
                    className="mt-1 text-brand-violet focus:ring-brand-violet"
                  />
                  <div>
                    <span className="font-semibold text-sm text-noir-900 block">
                      Доставка курьером
                    </span>
                    <span className="text-xs text-noir-500 font-light block mt-0.5">
                      По г. Астана • расчет тарифа по расстоянию
                    </span>
                  </div>
                </label>
              </div>

              {orderType === "delivery" && (
                <div className="pt-2 animate-fade-in">
                  <label className="block text-xs font-semibold text-noir-700 uppercase tracking-wider mb-2">
                    Адрес доставки в Астане *
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-noir-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Улица, дом, подъезд, квартира/офис..."
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-cream-50 border border-cream-200 text-sm focus:outline-none focus:border-brand-violet"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 2. Date & Time Selection (Real Business Logic) */}
            <div className="p-6 rounded-3xl bg-white border border-cream-200 shadow-sm space-y-6">
              <div>
                <h2 className="font-serif text-xl font-medium text-noir-900 flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-brand-violet" />
                  <span>2. Дата и интервал времени</span>
                </h2>
                <p className="text-xs text-noir-500 font-light mt-1">
                  Укажите предпочтительное время готовности вашего заказа.
                </p>
              </div>

              {hasPreorderItems && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <b>Внимание:</b> В вашем заказе есть торты по предзаказу. Минимальный срок изготовления — 24 часа. Доступны даты начиная со следующего дня.
                  </div>
                </div>
              )}

              {/* Date Input */}
              <div>
                <label className="block text-xs font-semibold text-noir-700 uppercase tracking-wider mb-2">
                  Дата получения *
                </label>
                <input
                  type="date"
                  required
                  min={minDateStr}
                  max={maxDateStr}
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-cream-50 border border-cream-200 text-sm font-medium text-noir-900 focus:outline-none focus:border-brand-violet"
                />
              </div>

              {/* Time Slots */}
              <div>
                <label className="block text-xs font-semibold text-noir-700 uppercase tracking-wider mb-2">
                  Временной интервал *
                </label>

                {loadingSlots ? (
                  <div className="py-4 text-center text-xs text-noir-400">
                    Проверка доступности интервалов...
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {slots.map((s) => (
                      <button
                        type="button"
                        key={s.id}
                        disabled={!s.available}
                        onClick={() => setPickupTime(s.label)}
                        className={`p-3 rounded-xl border text-left transition-all btn-press ${
                          pickupTime === s.label
                            ? "bg-noir-900 text-white border-noir-900 shadow-sm"
                            : s.available
                            ? "bg-cream-50 border-cream-200 hover:bg-cream-100 text-noir-900"
                            : "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed opacity-60"
                        }`}
                      >
                        <span className="font-semibold text-xs block">{s.label}</span>
                        <span className="text-[10px] block mt-0.5 opacity-80">
                          {s.available ? `Осталось мест: ${s.remaining}` : "Занято"}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 3. Customer Information */}
            <div className="p-6 rounded-3xl bg-white border border-cream-200 shadow-sm space-y-4">
              <h2 className="font-serif text-xl font-medium text-noir-900 flex items-center gap-2">
                <User className="w-5 h-5 text-brand-violet" />
                <span>3. Контактные данные</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-noir-700 uppercase tracking-wider mb-2">
                    Ваше имя *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Алия, Марат..."
                    className="w-full px-4 py-3 rounded-xl bg-cream-50 border border-cream-200 text-sm focus:outline-none focus:border-brand-violet"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-noir-700 uppercase tracking-wider mb-2">
                    Телефон для подтверждения *
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={handlePhoneChange}
                    placeholder="+7 701 000 00 00"
                    className="w-full px-4 py-3 rounded-xl bg-cream-50 border border-cream-200 text-sm focus:outline-none focus:border-brand-violet"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-noir-700 uppercase tracking-wider mb-2">
                  Email (по желанию)
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-4 py-3 rounded-xl bg-cream-50 border border-cream-200 text-sm focus:outline-none focus:border-brand-violet"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-noir-700 uppercase tracking-wider mb-2">
                  Комментарий или пожелания к заказу
                </label>
                <textarea
                  rows={2}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Надпись на торте, свечи, аллергии или пожелания по упаковке..."
                  className="w-full px-4 py-3 rounded-xl bg-cream-50 border border-cream-200 text-sm focus:outline-none focus:border-brand-violet"
                />
              </div>
            </div>
          </div>

          {/* Right Summary: Order composition & Submit Button */}
          <div className="lg:col-span-5 sticky top-28 space-y-6">
            <div className="p-6 rounded-3xl bg-white border border-cream-200 shadow-sm space-y-5">
              <h3 className="font-serif text-xl font-medium text-noir-900 border-b border-cream-200 pb-3 flex items-center justify-between">
                <span>Состав заказа</span>
                <span className="text-xs text-noir-500 font-sans font-normal">
                  {totalCount} {totalCount === 1 ? "десерт" : "десерта"}
                </span>
              </h3>

              {/* Items List */}
              <div className="max-h-72 overflow-y-auto space-y-3 pr-1">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3 items-center justify-between text-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-cream-100 flex-shrink-0">
                        <Image
                          src={item.imageUrl || "/images/products/porsche-cake.jpg"}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>
                      <div className="min-w-0">
                        <span className="font-semibold text-noir-900 block truncate">
                          {item.name}
                        </span>
                        <span className="text-[11px] text-noir-500 block">
                          {item.quantity} шт × {item.price.toLocaleString("ru-RU")} ₸
                        </span>
                      </div>
                    </div>

                    <span className="font-semibold text-noir-900 text-sm whitespace-nowrap pl-2">
                      {(item.price * item.quantity).toLocaleString("ru-RU")} ₸
                    </span>
                  </div>
                ))}
              </div>

              {/* Order total */}
              <div className="border-t border-cream-200 pt-4 space-y-2">
                <div className="flex justify-between text-xs text-noir-600">
                  <span>Стоимость изделий:</span>
                  <span>{totalAmount.toLocaleString("ru-RU")} ₸</span>
                </div>
                <div className="flex justify-between text-xs text-noir-600">
                  <span>Получение ({orderType === "delivery" ? "Доставка" : "Самовывоз"}):</span>
                  <span>{orderType === "delivery" ? "По тарифу курьера" : "Бесплатно"}</span>
                </div>
                <div className="flex justify-between items-baseline pt-2 border-t border-cream-100">
                  <span className="font-serif text-base text-noir-900 font-medium">Итого к оплате:</span>
                  <span className="font-serif text-3xl font-bold text-noir-950">
                    {totalAmount.toLocaleString("ru-RU")} ₸
                  </span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-noir-900 hover:bg-brand-violet text-cream-50 font-medium text-xs tracking-widest uppercase transition-all shadow-lg btn-press disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {submitting ? (
                  <span>Сохранение заявки...</span>
                ) : (
                  <>
                    <span>Отправить заявку на заказ</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              <div className="text-[11px] text-noir-500 text-center leading-relaxed font-light">
                Нажимая кнопку, вы подтверждаете согласие на обработку персональных данных для согласования заказа кондитерской La Crème.
              </div>
            </div>

            {/* Quality & Security Guarantee Box */}
            <div className="p-4 rounded-2xl bg-cream-100/70 border border-cream-200 text-xs text-noir-600 space-y-2">
              <div className="flex items-center gap-2 font-medium text-noir-900">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>Гарантия качества La Crème</span>
              </div>
              <p className="font-light leading-relaxed">
                Мы готовим каждый заказ исключительно под указанную дату и время, чтобы вы получили десерты максимальной свежести.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
