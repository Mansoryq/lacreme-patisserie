"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Check } from "lucide-react";

export default function AdminTelegramRetryButton({ failedCount }: { failedCount: number }) {
  const router = useRouter();
  const [retrying, setRetrying] = useState(false);
  const [doneMsg, setDoneMsg] = useState("");

  const handleRetry = async () => {
    setRetrying(true);
    setDoneMsg("");
    try {
      const res = await fetch("/api/admin/telegram/retry", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setDoneMsg(data.message);
        router.refresh();
      } else {
        alert(data.error || "Ошибка при повторной отправке");
      }
    } catch {
      alert("Сетевая ошибка");
    } finally {
      setRetrying(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleRetry}
        disabled={retrying || failedCount === 0}
        className="px-4 py-2 bg-brand-violet hover:bg-brand-violet-dark text-white rounded-xl text-xs font-semibold tracking-wider uppercase transition-colors btn-press flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${retrying ? "animate-spin" : ""}`} />
        <span>{retrying ? "Отправка..." : `Отправить повторно (${failedCount})`}</span>
      </button>
      {doneMsg && <span className="text-xs text-emerald-600 font-medium">{doneMsg}</span>}
    </div>
  );
}
