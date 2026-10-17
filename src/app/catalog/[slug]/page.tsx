import React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, ShieldCheck, Sparkles, ShoppingBag, ArrowRight } from "lucide-react";
import getDb from "@/lib/db";
import ProductDetailInteractive from "./ProductDetailInteractive";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const db = getDb();
  const product = db.prepare(`SELECT name, description FROM products WHERE slug = ?`).get(slug) as any;
  if (!product) return { title: "Десерт не найден — La Crème" };

  return {
    title: `${product.name} — La Crème Boutique Pâtisserie`,
    description: product.description || "Премиальные десерты ручной работы от La Crème в Астане.",
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const db = getDb();

  const product = db.prepare(`
    SELECT p.*, c.name as category_name, c.slug as category_slug
    FROM products p
    JOIN categories c ON c.id = p.category_id
    WHERE p.slug = ? AND p.is_active = 1
  `).get(slug) as any;

  if (!product) {
    notFound();
  }

  // Related products
  const related = db.prepare(`
    SELECT p.*, c.name as category_name, c.slug as category_slug
    FROM products p
    JOIN categories c ON c.id = p.category_id
    WHERE p.category_id = ? AND p.slug != ? AND p.is_active = 1
    ORDER BY p.display_order ASC
    LIMIT 3
  `).all(product.category_id, product.slug) as any[];

  return (
    <div className="site-shell pt-28 pb-24">
      {/* Breadcrumb */}
      <div className="mb-8">
        <Link
          href="/catalog"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-noir-500 hover:text-brand-violet transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Назад в каталог</span>
        </Link>
      </div>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        {/* Product Imagery */}
        <div className="lg:col-span-6 relative">
          <div className="photo-stage relative aspect-square sm:aspect-[4/3] lg:aspect-square">
            <Image
              src={product.image_url || "/images/products/porsche-cake.jpg"}
              alt={product.name}
              fill
              priority
              className="product-photo"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.is_gluten_free === 1 && (
                <span className="badge-luxury bg-emerald-700 text-white backdrop-blur-md">
                  Gluten Free
                </span>
              )}
              {product.is_new === 1 && (
                <span className="badge-luxury bg-brand-violet text-white">
                  New
                </span>
              )}
              {product.is_preorder === 1 && (
                <span className="badge-luxury bg-amber-700 text-white">
                  Предзаказ 24ч
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Product Details & Purchase Scenario */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <Link href={`/catalog?category=${product.category_slug}`} className="text-xs uppercase tracking-widest text-brand-violet font-semibold hover:underline block mb-3">{product.category_name}</Link>
            <h1 className="display-type text-5xl leading-[.9] text-noir-950 sm:text-6xl lg:text-7xl">
              {product.name}
            </h1>
            {product.weight && (
              <span className="text-xs text-noir-500 block mt-1">
                Вес / объем: <b>{product.weight}</b>
              </span>
            )}
          </div>

          <div className="flex items-baseline gap-3 pt-2">
            <span className="font-serif text-3xl sm:text-4xl font-bold text-noir-950">
              {product.price.toLocaleString("ru-RU")} ₸
            </span>
          </div>

          <div className="prose prose-sm text-noir-600 font-light leading-relaxed border-t border-b border-cream-200/80 py-5">
            <p className="text-sm sm:text-base leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Interactive Add to Cart & Checkout */}
          <ProductDetailInteractive
            product={{
              id: product.id,
              slug: product.slug,
              name: product.name,
              price: product.price,
              weight: product.weight,
              imageUrl: product.image_url,
              isPreorder: product.is_preorder === 1,
            }}
          />

          {/* Notice & Brand Assurance */}
          <div className="space-y-3 pt-4 text-xs text-noir-500 font-light">
            {product.is_preorder === 1 ? (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-900 flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <b className="font-semibold block mb-0.5">Торт по предварительному заказу</b>
                  Минимальный срок изготовления — от 24 часов. Выберите дату получения при оформлении заявки.
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-cream-100/70 border border-cream-200 text-noir-700 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-brand-violet flex-shrink-0 mt-0.5" />
                <div>
                  <b className="font-semibold block mb-0.5">Оформление по заявке</b>
                  Добавьте позицию в корзину, выберите дату и время — менеджер подтвердит детали заказа.
                </div>
              </div>
            )}

            <div className="p-4 rounded-2xl bg-cream-100/70 border border-cream-200 text-noir-700 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
              <div>
                <b className="font-semibold block mb-0.5">Оплата при получении</b>
                Без онлайн-оплаты на сайте. Наш менеджер подтвердит заказ и согласует детали перед выдачей.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <div className="mt-24 pt-16 border-t border-cream-200/80">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-serif text-2xl sm:text-3xl text-noir-900 font-medium">
              Вам также может понравиться
            </h2>
            <Link
              href={`/catalog?category=${product.category_slug}`}
              className="text-xs uppercase tracking-widest font-semibold text-brand-violet hover:underline flex items-center gap-1"
            >
              Больше в категории →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {related.map((item) => (
              <Link key={item.id} href={`/catalog/${item.slug}`} className="group flex gap-4 border-b border-noir-900/20 py-4 transition-colors hover:text-brand-violet">
                <div className="photo-stage relative h-20 w-20 shrink-0">
                  <Image
                    src={item.image_url}
                    alt={item.name}
                    fill
                    className="product-photo"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-serif text-base font-medium text-noir-900 group-hover:text-brand-violet transition-colors truncate">
                    {item.name}
                  </h4>
                  {item.weight && (
                    <span className="text-[11px] text-noir-500 block">{item.weight}</span>
                  )}
                  <span className="font-serif text-sm font-bold text-noir-950 block mt-1">
                    {item.price.toLocaleString("ru-RU")} ₸
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
