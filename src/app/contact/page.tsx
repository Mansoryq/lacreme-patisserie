import React from "react";
import Link from "next/link";
import { MapPin, Clock, Phone, Instagram, MessageCircle, ArrowRight, Sparkles } from "lucide-react";

export const metadata = {
  title: "Бутик и контакты — La Crème Boutique Pâtisserie",
  description:
    "Бутик кондитерской La Crème в Астане. Адрес: ул. Достык, 16 (Talan Towers). Телефон: +7 (701) 000-20-16. Ежедневно с 09:00 до 22:00.",
};

export default function ContactPage() {
  return (
    <div className="pt-28 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-2xl mb-12 space-y-3">
        <span className="text-xs tracking-[0.25em] uppercase text-brand-violet font-semibold block">
          Бутик в Астане
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl text-noir-950 font-normal">
          Контакты и расположение
        </h1>
        <p className="text-sm text-noir-600 font-light leading-relaxed">
          Будем рады видеть вас в нашем бутике. Здесь вы можете продегустировать свежую выпечку, авторский кофе и забрать предварительно оформленный заказ.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Contact Cards */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-cream-200/80 shadow-sm space-y-6">
            {/* Address */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-cream-100 flex items-center justify-center text-brand-violet flex-shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="text-xs uppercase tracking-widest text-noir-400 font-semibold block">
                  Адрес бутика
                </span>
                <span className="font-medium text-base text-noir-900 block leading-snug">
                  г. Астана, ул. Достык, 16
                </span>
                <span className="text-xs text-noir-500 font-light block">
                  Talan Towers, 1 этаж
                </span>
              </div>
            </div>

            {/* Operating Hours */}
            <div className="flex items-start gap-4 pt-4 border-t border-cream-100">
              <div className="w-12 h-12 rounded-2xl bg-cream-100 flex items-center justify-center text-brand-violet flex-shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="text-xs uppercase tracking-widest text-noir-400 font-semibold block">
                  Часы работы
                </span>
                <span className="font-medium text-base text-noir-900 block leading-snug">
                  Ежедневно с 09:00 до 22:00
                </span>
                <span className="text-xs text-noir-500 font-light block">
                  Выдача онлайн-заказов по выбранным интервалам
                </span>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start gap-4 pt-4 border-t border-cream-100">
              <div className="w-12 h-12 rounded-2xl bg-cream-100 flex items-center justify-center text-brand-violet flex-shrink-0">
                <Phone className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="text-xs uppercase tracking-widest text-noir-400 font-semibold block">
                  Телефон
                </span>
                <a
                  href="tel:+77010002016"
                  className="font-medium text-base text-noir-900 hover:text-brand-violet transition-colors block"
                >
                  +7 (701) 000-20-16
                </a>
                <span className="text-xs text-noir-500 font-light block">
                  Звонки и консультации кондитеров
                </span>
              </div>
            </div>

            {/* Socials & Messenger */}
            <div className="pt-4 border-t border-cream-100 flex flex-col sm:flex-row gap-3">
              <a
                href="https://www.instagram.com/la_creme_astana/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-cream-100 hover:bg-cream-200 text-noir-900 text-xs font-semibold tracking-wider uppercase transition-colors btn-press"
              >
                <Instagram className="w-4 h-4 text-brand-violet" />
                <span>Instagram</span>
              </a>
              <a
                href="https://wa.me/77010002016"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold tracking-wider uppercase transition-colors btn-press"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-noir-900 text-cream-50 space-y-3">
            <h3 className="font-serif text-xl font-medium">Желаете оформить индивидуальный заказ?</h3>
            <p className="text-xs text-cream-300 font-light leading-relaxed">
              Для многоярусных свадебных или корпоративных тортов рекомендуем оформить заявку заранее (за 3–5 дней).
            </p>
            <div className="pt-2">
              <Link
                href="/catalog"
                className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-semibold text-brand-gold hover:underline"
              >
                <span>Перейти к выбору в каталоге</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Map / Boutique Visual Atmosphere */}
        <div className="lg:col-span-7">
          <div className="rounded-3xl overflow-hidden border border-cream-200/80 shadow-md bg-white p-6 space-y-6">
            <div>
              <span className="text-xs uppercase tracking-widest text-brand-violet font-semibold block mb-1">
                Локация
              </span>
              <h3 className="font-serif text-2xl font-medium text-noir-900">
                Talan Towers • Сердце столицы
              </h3>
              <p className="text-xs text-noir-500 font-light mt-1">
                Удобный подъезд с ул. Достык, охраняемый паркинг и комфортная зона ожидания.
              </p>
            </div>

            {/* Stylized Map View */}
            <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-cream-200 border border-cream-300 flex items-center justify-center p-8 text-center">
              <div className="space-y-4 max-w-md">
                <div className="w-16 h-16 rounded-full bg-brand-violet text-white flex items-center justify-center mx-auto shadow-lg animate-bounce">
                  <MapPin className="w-8 h-8" />
                </div>
                <h4 className="font-serif text-xl font-medium text-noir-900">
                  La Crème Boutique Pâtisserie
                </h4>
                <p className="text-xs text-noir-600 leading-relaxed font-light">
                  г. Астана, ул. Достык, 16, Talan Towers, 1-й этаж
                </p>
                <div className="pt-2">
                  <a
                    href="https://2gis.kz/astana"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-noir-900 hover:bg-brand-violet text-cream-50 text-xs font-semibold tracking-wider uppercase transition-colors btn-press"
                  >
                    <span>Открыть в 2ГИС / Картах</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
