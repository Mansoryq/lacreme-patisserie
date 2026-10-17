"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { Search, X, Edit, Plus, Check, EyeOff, Eye, Save } from "lucide-react";

interface Product {
  id: number;
  slug: string;
  category_id: number;
  category_name: string;
  name: string;
  description: string;
  price: number;
  weight?: string;
  is_gluten_free: number;
  is_bestseller: number;
  is_preorder: number;
  is_new: number;
  is_active: number;
  image_url: string;
}

interface Category {
  id: number;
  slug: string;
  name: string;
}

interface Props {
  initialProducts: Product[];
  categories: Category[];
}

export default function AdminProductsClient({ initialProducts, categories }: Props) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Edit Modal State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);

  // New Product Modal State
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newProdName, setNewProdName] = useState("");
  const [newProdPrice, setNewProdPrice] = useState("");
  const [newProdCategory, setNewProdCategory] = useState(categories[0]?.id?.toString() || "1");
  const [newProdDesc, setNewProdDesc] = useState("");
  const [newProdWeight, setNewProdWeight] = useState("");

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (categoryFilter !== "all" && p.category_id.toString() !== categoryFilter) {
        return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchName = p.name.toLowerCase().includes(q);
        const matchDesc = p.description?.toLowerCase().includes(q);
        if (!matchName && !matchDesc) return false;
      }
      return true;
    });
  }, [products, categoryFilter, search]);

  const handleToggleActive = async (prod: Product) => {
    const nextState = prod.is_active === 1 ? 0 : 1;
    try {
      const res = await fetch(`/api/admin/products/${prod.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: nextState }),
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) =>
          prev.map((p) => (p.id === prod.id ? { ...p, is_active: nextState } : p))
        );
      }
    } catch {
      alert("Ошибка при сохранении");
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setSaving(true);

    try {
      const res = await fetch(`/api/admin/products/${editingProduct.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editingProduct.name,
          description: editingProduct.description,
          price: editingProduct.price,
          weight: editingProduct.weight,
          categoryId: editingProduct.category_id,
          isGlutenFree: editingProduct.is_gluten_free === 1,
          isBestseller: editingProduct.is_bestseller === 1,
          isPreorder: editingProduct.is_preorder === 1,
          isNew: editingProduct.is_new === 1,
          isActive: editingProduct.is_active === 1,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setProducts((prev) =>
          prev.map((p) => (p.id === editingProduct.id ? { ...editingProduct } : p))
        );
        setEditingProduct(null);
      } else {
        alert(data.error || "Ошибка сохранения");
      }
    } catch {
      alert("Сетевая ошибка");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdPrice) return;
    setSaving(true);

    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newProdName,
          price: parseInt(newProdPrice, 10),
          categoryId: parseInt(newProdCategory, 10),
          description: newProdDesc,
          weight: newProdWeight,
        }),
      });

      const data = await res.json();
      if (data.success) {
        const cat = categories.find((c) => c.id === parseInt(newProdCategory, 10));
        setProducts((prev) => [
          ...prev,
          {
            ...data.product,
            category_name: cat?.name || "",
          },
        ]);
        setIsAddingNew(false);
        setNewProdName("");
        setNewProdPrice("");
        setNewProdDesc("");
        setNewProdWeight("");
      } else {
        alert(data.error || "Ошибка создания товара");
      }
    } catch {
      alert("Сетевая ошибка");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search, Filter & Add Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-cream-200 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-noir-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по товарам..."
            className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-cream-50 border border-cream-200 text-xs text-noir-900 focus:outline-none focus:border-brand-violet"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-noir-400 hover:text-noir-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-cream-50 border border-cream-200 text-noir-800 text-xs rounded-xl px-3 py-2.5 focus:outline-none"
          >
            <option value="all">Все категории ({products.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id.toString()}>
                {c.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => setIsAddingNew(true)}
            className="px-4 py-2.5 bg-noir-900 hover:bg-brand-violet text-cream-50 rounded-xl text-xs font-semibold tracking-wider uppercase transition-colors btn-press flex items-center gap-1.5 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Добавить товар</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white border border-cream-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-cream-50/80 text-noir-500 uppercase tracking-wider text-[10px] border-b border-cream-200">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Фото</th>
                <th className="py-3.5 px-4 font-semibold">Название</th>
                <th className="py-3.5 px-4 font-semibold">Категория</th>
                <th className="py-3.5 px-4 font-semibold">Вес</th>
                <th className="py-3.5 px-4 font-semibold">Цена</th>
                <th className="py-3.5 px-4 font-semibold">Бейджи</th>
                <th className="py-3.5 px-4 font-semibold">Статус</th>
                <th className="py-3.5 px-4 text-right font-semibold">Действие</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-100">
              {filtered.map((prod) => (
                <tr
                  key={prod.id}
                  className={`hover:bg-cream-50/60 transition-colors ${
                    prod.is_active === 0 ? "opacity-50 bg-gray-50/50" : ""
                  }`}
                >
                  <td className="py-3 px-4">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-cream-100 flex-shrink-0">
                      <Image
                        src={prod.image_url || "/images/products/porsche-cake.jpg"}
                        alt={prod.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-noir-950 block">{prod.name}</span>
                    <span className="text-[11px] text-noir-400 font-mono truncate max-w-xs block">
                      {prod.slug}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-noir-700">{prod.category_name}</td>
                  <td className="py-3 px-4 text-noir-500">{prod.weight || "—"}</td>
                  <td className="py-3 px-4 font-serif font-bold text-sm text-noir-950">
                    {prod.price.toLocaleString("ru-RU")} ₸
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {prod.is_bestseller === 1 && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] bg-noir-800 text-white">
                          Хит
                        </span>
                      )}
                      {prod.is_preorder === 1 && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] bg-amber-700 text-white">
                          24ч
                        </span>
                      )}
                      {prod.is_gluten_free === 1 && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-700 text-white">
                          GF
                        </span>
                      )}
                      {prod.is_new === 1 && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] bg-brand-violet text-white">
                          New
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleToggleActive(prod)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold transition-colors ${
                        prod.is_active === 1
                          ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      {prod.is_active === 1 ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      <span>{prod.is_active === 1 ? "Активен" : "Скрыт"}</span>
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setEditingProduct({ ...prod })}
                      className="p-2 rounded-lg bg-cream-100 hover:bg-cream-200 text-noir-800 transition-colors btn-press"
                      title="Редактировать"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-noir-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-cream-200 shadow-2xl w-full max-w-lg p-6 sm:p-8 space-y-5 animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-cream-200 pb-3">
              <h3 className="font-serif text-xl font-medium text-noir-900">
                Редактирование товара
              </h3>
              <button
                onClick={() => setEditingProduct(null)}
                className="p-1 rounded-full text-noir-400 hover:text-noir-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase font-semibold text-noir-700 mb-1">
                  Название
                </label>
                <input
                  type="text"
                  required
                  value={editingProduct.name}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, name: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-cream-50 border border-cream-200 text-xs font-medium focus:outline-none focus:border-brand-violet"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase font-semibold text-noir-700 mb-1">
                    Цена (₸)
                  </label>
                  <input
                    type="number"
                    required
                    value={editingProduct.price}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        price: parseInt(e.target.value, 10) || 0,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-cream-50 border border-cream-200 text-xs font-medium focus:outline-none focus:border-brand-violet"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase font-semibold text-noir-700 mb-1">
                    Вес / Размер
                  </label>
                  <input
                    type="text"
                    value={editingProduct.weight || ""}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, weight: e.target.value })
                    }
                    placeholder="1,5 кг / 1 шт"
                    className="w-full px-3 py-2 rounded-xl bg-cream-50 border border-cream-200 text-xs font-medium focus:outline-none focus:border-brand-violet"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase font-semibold text-noir-700 mb-1">
                  Категория
                </label>
                <select
                  value={editingProduct.category_id}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      category_id: parseInt(e.target.value, 10),
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-cream-50 border border-cream-200 text-xs font-medium focus:outline-none focus:border-brand-violet"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase font-semibold text-noir-700 mb-1">
                  Описание состава
                </label>
                <textarea
                  rows={3}
                  value={editingProduct.description || ""}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, description: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-cream-50 border border-cream-200 text-xs focus:outline-none focus:border-brand-violet"
                />
              </div>

              {/* Flags */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <label className="flex items-center gap-2 text-xs text-noir-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.is_bestseller === 1}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        is_bestseller: e.target.checked ? 1 : 0,
                      })
                    }
                    className="rounded text-brand-violet"
                  />
                  <span>Хит продаж</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-noir-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.is_preorder === 1}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        is_preorder: e.target.checked ? 1 : 0,
                      })
                    }
                    className="rounded text-brand-violet"
                  />
                  <span>Предзаказ 24ч</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-noir-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.is_gluten_free === 1}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        is_gluten_free: e.target.checked ? 1 : 0,
                      })
                    }
                    className="rounded text-brand-violet"
                  />
                  <span>Без глютена (GF)</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-noir-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.is_new === 1}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        is_new: e.target.checked ? 1 : 0,
                      })
                    }
                    className="rounded text-brand-violet"
                  />
                  <span>Новинка</span>
                </label>
              </div>

              <div className="pt-4 border-t border-cream-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2.5 rounded-xl border border-cream-200 text-xs font-semibold text-noir-700 hover:bg-cream-100"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-noir-900 hover:bg-brand-violet text-cream-50 text-xs font-semibold uppercase tracking-wider transition-colors btn-press"
                >
                  {saving ? "Сохранение..." : "Сохранить изменения"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {isAddingNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-noir-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-cream-200 shadow-2xl w-full max-w-lg p-6 sm:p-8 space-y-5 animate-scale-in">
            <div className="flex items-center justify-between border-b border-cream-200 pb-3">
              <h3 className="font-serif text-xl font-medium text-noir-900">
                Создание нового десерта
              </h3>
              <button
                onClick={() => setIsAddingNew(false)}
                className="p-1 rounded-full text-noir-400 hover:text-noir-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div>
                <label className="block text-xs uppercase font-semibold text-noir-700 mb-1">
                  Название десерта *
                </label>
                <input
                  type="text"
                  required
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  placeholder="Торт Малина-Фисташка..."
                  className="w-full px-3 py-2 rounded-xl bg-cream-50 border border-cream-200 text-xs font-medium focus:outline-none focus:border-brand-violet"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase font-semibold text-noir-700 mb-1">
                    Цена в тенге (₸) *
                  </label>
                  <input
                    type="number"
                    required
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                    placeholder="15000"
                    className="w-full px-3 py-2 rounded-xl bg-cream-50 border border-cream-200 text-xs font-medium focus:outline-none focus:border-brand-violet"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase font-semibold text-noir-700 mb-1">
                    Вес / Размер
                  </label>
                  <input
                    type="text"
                    value={newProdWeight}
                    onChange={(e) => setNewProdWeight(e.target.value)}
                    placeholder="1,2 кг"
                    className="w-full px-3 py-2 rounded-xl bg-cream-50 border border-cream-200 text-xs font-medium focus:outline-none focus:border-brand-violet"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase font-semibold text-noir-700 mb-1">
                  Категория
                </label>
                <select
                  value={newProdCategory}
                  onChange={(e) => setNewProdCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-cream-50 border border-cream-200 text-xs font-medium focus:outline-none focus:border-brand-violet"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id.toString()}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase font-semibold text-noir-700 mb-1">
                  Описание состава
                </label>
                <textarea
                  rows={3}
                  value={newProdDesc}
                  onChange={(e) => setNewProdDesc(e.target.value)}
                  placeholder="Бисквит, нежный мусс, свежие ягоды..."
                  className="w-full px-3 py-2 rounded-xl bg-cream-50 border border-cream-200 text-xs focus:outline-none focus:border-brand-violet"
                />
              </div>

              <div className="pt-4 border-t border-cream-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="px-4 py-2.5 rounded-xl border border-cream-200 text-xs font-semibold text-noir-700 hover:bg-cream-100"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-noir-900 hover:bg-brand-violet text-cream-50 text-xs font-semibold uppercase tracking-wider transition-colors btn-press"
                >
                  {saving ? "Создание..." : "Создать товар"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
