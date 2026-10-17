import { NextResponse } from "next/server";
import getDb from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const db = getDb();

    const product = db.prepare(`
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      JOIN categories c ON c.id = p.category_id
      WHERE p.slug = ? AND p.is_active = 1
    `).get(slug);

    if (!product) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    // Related products in the same category
    const related = db.prepare(`
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      JOIN categories c ON c.id = p.category_id
      WHERE p.category_id = (SELECT category_id FROM products WHERE slug = ?)
        AND p.slug != ? AND p.is_active = 1
      ORDER BY p.display_order ASC
      LIMIT 4
    `).all(slug, slug);

    return NextResponse.json({ success: true, product, related });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
