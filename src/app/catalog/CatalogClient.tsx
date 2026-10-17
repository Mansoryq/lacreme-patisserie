"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search, X, SlidersHorizontal, Plus, Check, Clock, Sparkles } from "lucide-react";
import { useCart } from "@/context/CartContext";

interface Category {
  id: number;
  slug: string;
  name: string;
  name_fr?: string;
  product_count: number;
}

interface Product {
  id: number;
  slug: string;
  category_id: number;
  category_name: string;
  category_slug: string;
  name: string;
  description: string;
  price: number;
  weight?: string;
  is_gluten_free: number;
  is_bestseller: number;
  is_preorder: number;
  is_new: number;
  image_url: string;
}

interface Props {
  initialCategories: Category[];
  initialProducts: Product[];
}

export default function CatalogClient({ initialCategories, initialProducts }: Props) {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");

  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam || "all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"default" | "price-asc" | "price-desc">("default");
  const [filterGlutenFree, setFilterGlutenFree] = useState(false);
  const [filterPreorder, setFilterPreorder] = useState(false);
  const [filterNew, setFilterNew] = useState(false);

  const { addItem } = useCart();
  const [addedIds, setAddedIds] = useState<Record<number, boolean>>({});

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      weight: product.weight,
      imageUrl: product.image_url,
      isPreorder: product.is_preorder === 1,
    }, 1);

    setAddedIds((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [product.id]: false }));
    }, 1500);
  };

  // Filter & sort logic
  const filteredProducts = useMemo(() => {
    return initialProducts
      .filter((p) => {
        if (selectedCategory !== "all" && p.category_slug !== selectedCategory) {
          return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchesName = p.name.toLowerCase().includes(q);
          const matchesDesc = p.description?.toLowerCase().includes(q);
          if (!matchesName && !matchesDesc) return false;
        }
        if (filterGlutenFree && p.is_gluten_free !== 1) {
          return false;
        }
        if (filterPreorder && p.is_preorder !== 1) {
          return false;
        }
        if (filterNew && p.is_new !== 1) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.price - b.price;
        if (sortBy === "price-desc") return b.price - a.price;
        return 0; // default order
      });
  }, [
    initialProducts,
    selectedCategory,
    searchQuery,
    sortBy,
    filterGlutenFree,
    filterPreorder,
    filterNew,
  ]);

  return (
    <div className="space-y-8">
      {/* 1. Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 pt-1 scrollbar-none border-b border-cream-200/80">
        <button
          onClick={() => setSelectedCategory("all")}
          aria-pressed={selectedCategory === "all"}
          className={`min-h-11 px-4 py-2 rounded-full text-xs tracking-wider uppercase font-medium whitespace-nowrap transition-all btn-press ${
            selectedCategory === "all"
              ? "bg-noir-900 text-cream-50 shadow-sm"
              : "bg-white text-noir-700 hover:bg-cream-100 border border-cream-200"
          }`}
        >
          Все позиции ({initialProducts.length})
        </button>
        {initialCategories.map((cat) => {
          const isSelected = selectedCategory === cat.slug;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              aria-pressed={isSelected}
              className={`min-h-11 px-4 py-2 rounded-full text-xs tracking-wider uppercase font-medium whitespace-nowrap transition-all btn-press ${
                isSelected
                  ? "bg-noir-900 text-cream-50 shadow-sm"
                  : "bg-white text-noir-700 hover:bg-cream-100 border border-cream-200"
              }`}
            >
              {cat.name} ({cat.product_count})
            </button>
          );
        })}
      </div>

      {/* 2. Search, Toggles, and Sorting Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-y border-noir-900/15 py-5">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <label htmlFor="catalog-search" className="sr-only">Поиск десертов</label>
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-noir-400" />
          <input
            type="text"
            id="catalog-search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по названию или ингредиентам..."
            className="w-full border-b border-noir-900/25 bg-transparent py-2.5 pl-10 pr-9 text-xs text-noir-900 placeholder:text-noir-400 focus:border-brand-violet focus:outline-none transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              aria-label="Очистить поиск"
              className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center text-noir-400 hover:text-noir-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Feature Filter Badges */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setFilterGlutenFree(!filterGlutenFree)}
            aria-pressed={filterGlutenFree}
            className={`min-h-11 px-3 py-1.5 rounded-full text-xs font-medium border transition-all btn-press whitespace-nowrap ${
              filterGlutenFree
                ? "bg-emerald-700 text-white border-emerald-700"
                : "bg-cream-50 text-noir-700 border-cream-200 hover:bg-cream-100"
            }`}
          >
            Gluten Free
          </button>
          <button
            onClick={() => setFilterPreorder(!filterPreorder)}
            aria-pressed={filterPreorder}
            className={`min-h-11 px-3 py-1.5 rounded-full text-xs font-medium border transition-all btn-press whitespace-nowrap ${
              filterPreorder
                ? "bg-amber-700 text-white border-amber-700"
                : "bg-cream-50 text-noir-700 border-cream-200 hover:bg-cream-100"
            }`}
          >
            Торты предзаказ (24ч)
          </button>
          <button
            onClick={() => setFilterNew(!filterNew)}
            aria-pressed={filterNew}
            className={`min-h-11 px-3 py-1.5 rounded-full text-xs font-medium border transition-all btn-press whitespace-nowrap ${
              filterNew
                ? "bg-brand-violet text-white border-brand-violet"
                : "bg-cream-50 text-noir-700 border-cream-200 hover:bg-cream-100"
            }`}
          >
            Новинки
          </button>
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-3.5 h-3.5 text-noir-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            aria-label="Сортировка каталога"
            className="min-h-11 border border-noir-900/20 bg-transparent px-3 py-2 text-xs text-noir-800 focus:border-brand-violet focus:outline-none"
          >
            <option value="default">По умолчанию</option>
            <option value="price-asc">Сначала недорогие</option>
            <option value="price-desc">Сначала премиальные</option>
          </select>
        </div>
      </div>

      {/* 3. Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="py-24 text-center bg-white rounded-3xl border border-cream-200 p-8">
          <p className="font-serif text-2xl text-noir-800 mb-2">Ничего не найдено</p>
          <p className="text-xs text-noir-500 mb-6 max-w-sm mx-auto">
            По вашему запросу нет десертов. Попробуйте сбросить фильтры или изменить поисковый запрос.
          </p>
          <button
            onClick={() => {
              setSelectedCategory("all");
              setSearchQuery("");
              setFilterGlutenFree(false);
              setFilterPreorder(false);
              setFilterNew(false);
            }}
            className="px-6 py-2.5 bg-noir-900 text-cream-50 rounded-full text-xs tracking-wider uppercase font-semibold btn-press"
          >
            Сбросить фильтры
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((p) => {
            const isAdded = addedIds[p.id];
            return (
              <div
                key={p.id}
                className="group flex flex-col justify-between"
              >
                <div>
                  {/* Photo Container */}
                  <Link
                    href={`/catalog/${p.slug}`}
                    className="photo-stage relative block aspect-[4/5]"
                  >
                    <Image
                      src={p.image_url || "/images/products/porsche-cake.jpg"}
                      alt={p.name}
                      fill
                      className="product-photo"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />

                    {/* Feature badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                      {p.is_gluten_free === 1 && (
                        <span className="badge-luxury bg-emerald-700/90 text-white backdrop-blur-md">
                          Gluten Free
                        </span>
                      )}
                      {p.is_new === 1 && (
                        <span className="badge-luxury bg-brand-violet text-white">
                          New
                        </span>
                      )}
                      {p.is_preorder === 1 && (
                        <span className="badge-luxury bg-amber-700 text-white">
                          Предзаказ 24ч
                        </span>
                      )}
                      {p.is_bestseller === 1 && (
                        <span className="badge-luxury bg-noir-900/90 text-cream-50 backdrop-blur-md">
                          Хит
                        </span>
                      )}
                    </div>
                  </Link>

                  {/* Body Content */}
                  <div className="space-y-2 py-4">
                    <span className="text-[10px] text-noir-400 uppercase tracking-widest font-medium block">
                      {p.category_name}
                    </span>

                    <Link href={`/catalog/${p.slug}`}>
                      <h3 className="font-serif text-lg font-medium text-noir-950 group-hover:text-brand-violet transition-colors leading-snug">
                        {p.name}
                      </h3>
                    </Link>

                    <p className="text-xs text-noir-500 font-light line-clamp-2 leading-relaxed">
                      {p.description}
                    </p>
                  </div>
                </div>

                {/* Bottom Card Controls */}
                <div>
                  <div className="flex items-center justify-between border-t border-noir-900/20 pt-3">
                    <div>
                      {p.weight && (
                        <span className="text-[11px] text-noir-400 block font-light">
                          {p.weight}
                        </span>
                      )}
                      <span className="font-serif text-lg font-bold text-noir-950">
                        {p.price.toLocaleString("ru-RU")} ₸
                      </span>
                    </div>

                    <button
                      onClick={(e) => handleAddToCart(e, p)}
                      className={`p-2.5 rounded-full transition-all duration-200 btn-press flex items-center justify-center ${
                        isAdded
                          ? "bg-emerald-600 text-white scale-105"
                          : "border border-noir-900/20 hover:border-brand-violet hover:bg-brand-violet text-noir-900 hover:text-white"
                      }`}
                      title="Добавить в заказ"
                      aria-label={`Добавить ${p.name}`}
                    >
                      {isAdded ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
