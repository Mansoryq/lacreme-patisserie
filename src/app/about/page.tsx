import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles, Heart, Award, Check } from "lucide-react";

export const metadata = {
  title: "О кондитерской La Crème — История Даны Канапиной",
  description:
    "История создания бутика La Crème. С 2016 года — 10 лет гастрономической культуры, вдохновения и бескомпромиссного качества в Астане.",
};

export default function AboutPage() {
  return (
    <div className="pt-28 pb-24">
      {/* 1. Header Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cream-100 border border-cream-200 text-xs tracking-widest uppercase text-brand-violet font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>10 лет LC Family Group • 2016–2026</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-noir-950 font-normal leading-[1.12]">
            «Запоминаются не дни — <br />
            <span className="italic font-light text-brand-violet">запоминаются моменты».</span>
          </h1>

          <p className="text-base sm:text-lg text-noir-600 font-light leading-relaxed">
            Те, в которых все совпадает: выбор, вкус, подача и пространство складываются в одно ощущение. Такие моменты не возникают случайно.
          </p>
        </div>
      </section>

      {/* 2. Visual Story with Real Photography */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 relative">
            <div className="relative aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
              <Image
                src="/images/story/dana-kanapina.jpg"
                alt="Дана Канапина — основательница La Crème"
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 45vw"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 p-4 rounded-2xl bg-white border border-cream-200 shadow-xl max-w-xs">
              <span className="font-serif text-lg font-medium text-noir-900 block">
                Дана Канапина
              </span>
              <span className="text-xs text-noir-500 font-light block">
                Шеф-кондитер и создатель бренда
              </span>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6 lg:pl-8">
            <h2 className="font-serif text-3xl sm:text-4xl text-noir-900 font-medium">
              От вдохновения Парижем — к собственной гастрономической культуре
            </h2>

            <p className="text-sm sm:text-base text-noir-600 font-light leading-relaxed">
              Страсть Даны к кондитерскому искусству и вдохновение французской культурой привели к созданию первого бутика La Crème в 2016 году. Желание радовать своих детей красивыми тортами со временем переросло в большую идею — создавать гастрономическую культуру, передавать знания и вдохновлять людей.
            </p>

            <blockquote className="p-6 rounded-2xl bg-cream-100/70 border-l-4 border-brand-violet text-noir-800 italic font-serif text-lg leading-relaxed">
              “Ведь каждый из этих проектов был задуман для радости и удовольствия. Для теплых встреч и свиданий с собой...”
            </blockquote>

            <p className="text-sm sm:text-base text-noir-600 font-light leading-relaxed">
              Дана всегда следовала своим принципам: никаких компромиссов в качестве, только лучшие ингредиенты и техники, стремление к совершенству во всём и не соглашаться на меньшее.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <div className="p-4 rounded-xl bg-white border border-cream-200 shadow-sm flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span className="text-xs text-noir-700 font-medium">
                  Фермерское масло и французские техники слоения
                </span>
              </div>
              <div className="p-4 rounded-xl bg-white border border-cream-200 shadow-sm flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span className="text-xs text-noir-700 font-medium">
                  Натуральные ягоды и бельгийский шоколад
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. 10 Years Collage Section */}
      <section className="py-20 bg-cream-100/60 border-y border-cream-200/80 my-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-4">
              <span className="text-xs tracking-widest uppercase text-brand-gold font-semibold block">
                Юбилей кондитерской
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-noir-900 font-medium">
                В этом году LC Family Group исполняется 10 лет
              </h2>
              <p className="text-sm text-noir-600 font-light leading-relaxed">
                Со временем La Crème стала не просто кондитерской, а частью повседневных и важных событий астанчан — привычкой выбирать лучшее для себя и близких. За эти 10 лет мы стали частью ваших моментов.
              </p>
              <div className="pt-2">
                <Link
                  href="/catalog"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-noir-900 hover:bg-brand-violet text-cream-50 text-xs tracking-widest uppercase font-semibold transition-all btn-press"
                >
                  <span>Выбрать десерты к празднику</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="relative aspect-[16/10] rounded-3xl overflow-hidden shadow-xl border-4 border-white bg-cream-200">
                <Image
                  src="/images/story/anniversary-moments.jpg"
                  alt="10 лет LC Family Group моменты"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
