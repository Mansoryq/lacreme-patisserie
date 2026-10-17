import { MetadataRoute } from "next";
import getDb from "@/lib/db";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://lacreme.kz";
  const db = getDb();

  const products = db.prepare(`SELECT slug, updated_at FROM products WHERE is_active = 1`).all() as any[];

  const productUrls: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${baseUrl}/catalog/${p.slug}`,
    lastModified: new Date(p.updated_at || Date.now()),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/catalog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  return [...staticUrls, ...productUrls];
}
