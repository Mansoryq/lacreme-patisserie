import { NextResponse } from "next/server";
import getDb from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const isBestseller = searchParams.get("bestseller");
    const isNew = searchParams.get("new");
    const isGlutenFree = searchParams.get("gluten_free");

    const db = getDb();

    let query = `
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      JOIN categories c ON c.id = p.category_id
      WHERE p.is_active = 1 AND c.is_active = 1
    `;
    const params: any[] = [];

    if (category) {
      query += ` AND c.slug = ?`;
      params.push(category);
    }

    if (search && search.trim() !== "") {
      query += ` AND (p.name LIKE ? OR p.description LIKE ?)`;
      const term = `%${search.trim()}%`;
      params.push(term, term);
    }

    if (isBestseller === "1") {
      query += ` AND p.is_bestseller = 1`;
    }

    if (isNew === "1") {
      query += ` AND p.is_new = 1`;
    }

    if (isGlutenFree === "1") {
      query += ` AND p.is_gluten_free = 1`;
    }

    query += ` ORDER BY p.display_order ASC, p.id ASC`;

    const products = db.prepare(query).all(...params);

    return NextResponse.json({ success: true, products });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
