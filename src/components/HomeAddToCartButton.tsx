"use client";

import React, { useState } from "react";
import { Plus, Check } from "lucide-react";
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

export default function HomeAddToCartButton({ product }: Props) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs tracking-wider uppercase font-semibold transition-all duration-200 btn-press ${
        added
          ? "bg-emerald-600 text-white"
          : "bg-noir-900 hover:bg-brand-violet text-cream-50"
      }`}
      aria-label={`Добавить ${product.name} в заказ`}
    >
      {added ? (
        <>
          <Check className="w-3.5 h-3.5" />
          <span>Добавлено</span>
        </>
      ) : (
        <>
          <Plus className="w-3.5 h-3.5" />
          <span>В заказ</span>
        </>
      )}
    </button>
  );
}
