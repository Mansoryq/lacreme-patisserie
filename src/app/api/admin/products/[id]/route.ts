import { NextResponse } from "next/server";
import getDb from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const prodId = parseInt(id, 10);
    const body = await request.json();

    const db = getDb();
    const existing = db.prepare(`SELECT * FROM products WHERE id = ?`).get(prodId) as any;
    if (!existing) {
      return NextResponse.json({ success: false, error: "Товар не найден" }, { status: 404 });
    }

    const {
      name,
      description,
      price,
      weight,
      categoryId,
      isGlutenFree,
      isBestseller,
      isPreorder,
      isNew,
      isActive,
      imageUrl,
      displayOrder,
    } = body;

    const updates: string[] = ["updated_at = CURRENT_TIMESTAMP"];
    const values: any[] = [];

    if (name !== undefined) {
      updates.push("name = ?");
      values.push(name.trim());
    }
    if (description !== undefined) {
      updates.push("description = ?");
      values.push(description.trim());
    }
    if (price !== undefined) {
      updates.push("price = ?");
      values.push(parseInt(price, 10));
    }
    if (weight !== undefined) {
      updates.push("weight = ?");
      values.push(weight.trim());
    }
    if (categoryId !== undefined) {
      updates.push("category_id = ?");
      values.push(parseInt(categoryId, 10));
    }
    if (isGlutenFree !== undefined) {
      updates.push("is_gluten_free = ?");
      values.push(isGlutenFree ? 1 : 0);
    }
    if (isBestseller !== undefined) {
      updates.push("is_bestseller = ?");
      values.push(isBestseller ? 1 : 0);
    }
    if (isPreorder !== undefined) {
      updates.push("is_preorder = ?");
      values.push(isPreorder ? 1 : 0);
    }
    if (isNew !== undefined) {
      updates.push("is_new = ?");
      values.push(isNew ? 1 : 0);
    }
    if (isActive !== undefined) {
      updates.push("is_active = ?");
      values.push(isActive ? 1 : 0);
    }
    if (imageUrl !== undefined) {
      updates.push("image_url = ?");
      values.push(imageUrl);
    }
    if (displayOrder !== undefined) {
      updates.push("display_order = ?");
      values.push(parseInt(displayOrder, 10));
    }

    values.push(prodId);

    db.prepare(`UPDATE products SET ${updates.join(", ")} WHERE id = ?`).run(...values);

    const updated = db.prepare(`SELECT * FROM products WHERE id = ?`).get(prodId);

    return NextResponse.json({ success: true, product: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const prodId = parseInt(id, 10);
    const db = getDb();

    // Soft delete by setting is_active = 0
    db.prepare(`UPDATE products SET is_active = 0 WHERE id = ?`).run(prodId);

    return NextResponse.json({ success: true, message: "Товар скрыт из каталога" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
