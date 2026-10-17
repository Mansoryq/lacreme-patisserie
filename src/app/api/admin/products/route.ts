import { NextResponse } from "next/server";
import getDb from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();
    const products = db.prepare(`
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      JOIN categories c ON c.id = p.category_id
      ORDER BY p.category_id ASC, p.display_order ASC
    `).all();

    return NextResponse.json({ success: true, products });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      slug,
      categoryId,
      description,
      price,
      weight,
      isGlutenFree,
      isBestseller,
      isPreorder,
      isNew,
      imageUrl,
    } = body;

    if (!name || !price || !categoryId) {
      return NextResponse.json(
        { success: false, error: "Укажите название, категорию и цену товара" },
        { status: 400 }
      );
    }

    const generatedSlug =
      slug ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9а-яё]/gi, "-")
        .replace(/-+/g, "-") +
        "-" +
        Date.now();

    const db = getDb();
    const result = db.prepare(`
      INSERT INTO products (
        name, slug, category_id, description, price, weight,
        is_gluten_free, is_bestseller, is_preorder, is_new, image_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      name.trim(),
      generatedSlug,
      parseInt(categoryId, 10),
      description?.trim() || "",
      parseInt(price, 10),
      weight?.trim() || "",
      isGlutenFree ? 1 : 0,
      isBestseller ? 1 : 0,
      isPreorder ? 1 : 0,
      isNew ? 1 : 0,
      imageUrl || "/images/products/porsche-cake.jpg"
    );

    const created = db.prepare(`SELECT * FROM products WHERE id = ?`).get(result.lastInsertRowid);

    return NextResponse.json({ success: true, product: created });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
