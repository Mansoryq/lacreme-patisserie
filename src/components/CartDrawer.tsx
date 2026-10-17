"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Plus, Minus, Trash2, ArrowRight, ShoppingBag, Clock } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function CartDrawer() {
  const { items, isCartOpen, closeCart, updateQuantity, removeItem, totalAmount, totalCount, hasPreorderItems } = useCart();

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isCartOpen, closeCart]);

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-noir-950/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-cream-50 shadow-2xl flex flex-col transform transition-transform duration-300 ease-out">
          {/* Header */}
          <div className="px-6 py-5 border-b border-cream-200/80 flex items-center justify-between bg-cream-100">
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-5 h-5 text-brand-violet" />
              <h2 className="font-serif text-xl text-noir-900 tracking-tight font-medium">
                Ваш заказ ({totalCount})
              </h2>
            </div>
            <button
              onClick={closeCart}
              className="p-2 rounded-full text-noir-600 hover:text-noir-950 hover:bg-cream-200/70 transition-colors btn-press"
              aria-label="Закрыть корзину"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4">
                <div className="w-16 h-16 rounded-full bg-cream-200 flex items-center justify-center text-noir-500 mb-4">
                  <ShoppingBag className="w-8 h-8 stroke-1 text-brand-violet" />
                </div>
                <h3 className="font-serif text-xl text-noir-900 mb-2">Корзина пуста</h3>
                <p className="text-sm text-noir-600 mb-6 max-w-xs leading-relaxed">
                  Выберите десерты, торты или выпечку из нашего фирменного каталога
                </p>
                <Link
                  href="/catalog"
                  onClick={closeCart}
                  className="px-6 py-2.5 bg-noir-900 text-cream-50 rounded-full text-xs tracking-wider uppercase font-semibold hover:bg-brand-violet transition-colors btn-press"
                >
                  Перейти в каталог
                </Link>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-3 rounded-xl bg-white border border-cream-200/60 shadow-sm"
                >
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-cream-100 flex-shrink-0">
                    <Image
                      src={item.imageUrl || "/images/products/porsche-cake.jpg"}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-serif text-base text-noir-900 font-medium truncate">
                          {item.name}
                        </h4>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-noir-400 hover:text-red-600 p-1 transition-colors"
                          title="Удалить"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      {item.weight && (
                        <p className="text-xs text-noir-500 mt-0.5">{item.weight}</p>
                      )}
                      {item.isPreorder && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full mt-1">
                          <Clock className="w-3 h-3" /> По предзаказу
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-cream-100">
                      <div className="flex items-center border border-cream-300 rounded-lg overflow-hidden bg-cream-50">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:bg-cream-200 text-noir-700 transition-colors btn-press"
                          aria-label="Уменьшить"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2.5 text-xs font-semibold text-noir-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:bg-cream-200 text-noir-700 transition-colors btn-press"
                          aria-label="Увеличить"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-semibold text-noir-900">
                          {(item.price * item.quantity).toLocaleString("ru-RU")} ₸
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer with Checkout CTA */}
          {items.length > 0 && (
            <div className="p-6 border-t border-cream-200 bg-white">
              {hasPreorderItems && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200/60 rounded-xl text-xs text-amber-900 leading-relaxed flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <span>
                    В заказе есть торты по предзаказу. Дата получения должна быть не ранее чем через 24 часа.
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-noir-600">Итоговая стоимость:</span>
                <span className="font-serif text-2xl text-noir-950 font-bold">
                  {totalAmount.toLocaleString("ru-RU")} ₸
                </span>
              </div>

              <div className="space-y-2">
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-noir-900 hover:bg-brand-violet text-cream-50 font-medium tracking-wide transition-all shadow-md btn-press group"
                >
                  <span>Оформить заявку</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <p className="text-[11px] text-center text-noir-500">
                  Оплата при получении после подтверждения менеджером
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
