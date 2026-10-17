"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function AdminLogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/admin/me", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      className="p-1.5 text-cream-400 hover:text-red-400 rounded-lg hover:bg-noir-800 transition-colors"
      title="Выйти"
      aria-label="Выйти"
    >
      <LogOut className="w-4 h-4" />
    </button>
  );
}
