"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Minus, ShoppingBag, ArrowRight, Check } from "lucide-react";
import { useCart } from "@/context/CartContext";

interface Props {
  product: {
    id: number;
    slug: string;
    name: string;
    price: number;
    weight?: string;
    imageUrl?: string;
    isPreorder?: boolean;
  };
}

export default function ProductDetailInteractive({ product }: Props) {
  const router = useRouter();
  const { addItem, openCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleBuyNow = () => {
    addItem(product, quantity);
    router.push("/checkout");
  };

  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center gap-4">
        {/* Quantity Stepper */}
        <div className="flex items-center border border-cream-300 rounded-xl bg-white p-1">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="p-2 text-noir-600 hover:text-noir-950 hover:bg-cream-100 rounded-lg transition-colors btn-press"
            aria-label="Уменьшить количество"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-12 text-center font-semibold text-sm text-noir-900">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity(Math.min(99, quantity + 1))}
            className="p-2 text-noir-600 hover:text-noir-950 hover:bg-cream-100 rounded-lg transition-colors btn-press"
            aria-label="Увеличить количество"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAdd}
          className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-medium text-xs tracking-wider uppercase transition-all duration-200 btn-press ${
            added
              ? "bg-emerald-600 text-white shadow-md"
              : "bg-noir-900 hover:bg-brand-violet text-cream-50 shadow-md"
          }`}
        >
          {added ? (
            <>
              <Check className="w-4 h-4" />
              <span>Добавлено в заказ</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-4 h-4" />
              <span>Добавить в заказ</span>
            </>
          )}
        </button>
      </div>

      {/* Quick Direct Checkout CTA */}
      <button
        onClick={handleBuyNow}
        className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-cream-200 hover:bg-cream-300 text-noir-950 font-medium text-xs tracking-wider uppercase transition-colors btn-press group"
      >
        <span>Перейти к оформлению заявки</span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
}
