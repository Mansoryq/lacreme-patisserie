"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Lock, User, ArrowRight, AlertCircle } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Неверный логин или пароль");
        setLoading(false);
        return;
      }

      router.push("/admin");
    } catch {
      setError("Ошибка соединения с сервером");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-noir-950 px-4 py-12">
      <div className="w-full max-w-md space-y-8 bg-noir-900 border border-noir-800 p-8 sm:p-10 rounded-3xl shadow-2xl">
        <div className="text-center space-y-3">
          <div className="relative w-16 h-16 rounded-full overflow-hidden mx-auto shadow-md border-2 border-noir-700">
            <Image
              src="/images/brand/logo.jpg"
              alt="La Crème Boutique"
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h1 className="font-serif text-2xl text-cream-50 font-semibold tracking-wider">
              LA CRÈME
            </h1>
            <span className="text-[10px] tracking-[0.25em] text-cream-400 uppercase block mt-0.5">
              Внутренняя панель управления
            </span>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-950/70 border border-red-800 text-red-200 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-cream-300 font-medium mb-1.5">
              Логин сотрудника
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-cream-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-noir-850 border border-noir-700 text-sm text-cream-50 placeholder:text-noir-500 focus:outline-none focus:border-brand-violet transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-cream-300 font-medium mb-1.5">
              Пароль
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-cream-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-noir-850 border border-noir-700 text-sm text-cream-50 placeholder:text-noir-500 focus:outline-none focus:border-brand-violet transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-brand-violet hover:bg-brand-violet-dark text-white font-medium text-xs tracking-wider uppercase transition-all shadow-lg btn-press disabled:opacity-50"
          >
            {loading ? "Авторизация..." : "Войти в систему"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-noir-800 text-center">
          <p className="text-[11px] text-cream-500">
            Доступ только для уполномоченных сотрудников кондитерской La Crème
          </p>
        </div>
      </div>
    </div>
  );
}
