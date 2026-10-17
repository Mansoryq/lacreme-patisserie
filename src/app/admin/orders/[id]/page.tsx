import React from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Phone, MessageCircle, Calendar, Clock, MapPin, User, Send, CheckCircle2, AlertCircle } from "lucide-react";
import { getCurrentAdmin } from "@/lib/auth";
import getDb from "@/lib/db";
import AdminOrderDetailInteractive from "./AdminOrderDetailInteractive";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderDetailPage({ params }: Props) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/admin/login");
  }

  const { id } = await params;
  const db = getDb();

  let order: any;
  if (/^\d+$/.test(id)) {
    order = db.prepare(`SELECT * FROM orders WHERE id = ?`).get(parseInt(id, 10));
  } else {
    order = db.prepare(`SELECT * FROM orders WHERE order_number = ?`).get(id);
  }

  if (!order) {
    notFound();
  }

  const items = db.prepare(`
    SELECT oi.*, p.slug as product_slug, p.image_url
    FROM order_items oi
    LEFT JOIN products p ON p.id = oi.product_id
    WHERE oi.order_id = ?
  `).all(order.id) as any[];

  const logs = db.prepare(`
    SELECT * FROM notification_logs WHERE order_id = ? ORDER BY id DESC
  `).all(order.id) as any[];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Back Button */}
      <div className="flex items-center justify-between pb-4 border-b border-cream-200">
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-noir-500 hover:text-brand-violet transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Назад к списку заказов</span>
        </Link>

        <span className="text-xs font-mono font-semibold text-brand-violet px-3 py-1 rounded-full bg-cream-200">
          {order.order_number}
        </span>
      </div>

      {/* Main Order Details + Interactive Actions */}
      <AdminOrderDetailInteractive order={order} items={items} logs={logs} />
    </div>
  );
}
