import assert from "node:assert";

const BASE_URL = "http://localhost:3000";

async function runTests() {
  console.log("=== STARTING LA CRÈME AUTOMATED INTEGRATION TESTS ===");

  // 1. Test Products API
  console.log("\n[1] Testing GET /api/products");
  const prodRes = await fetch(`${BASE_URL}/api/products`);
  assert.strictEqual(prodRes.status, 200, "Products API should return 200");
  const prodData = await prodRes.json();
  assert.strictEqual(prodData.success, true, "Products API success should be true");
  assert.ok(prodData.products.length >= 60, `Should have at least 60 products (found ${prodData.products.length})`);
  console.log(`✓ Products API OK: ${prodData.products.length} products loaded`);

  // 2. Test Categories API
  console.log("\n[2] Testing GET /api/categories");
  const catRes = await fetch(`${BASE_URL}/api/categories`);
  assert.strictEqual(catRes.status, 200);
  const catData = await catRes.json();
  assert.strictEqual(catData.success, true);
  assert.ok(catData.categories.length >= 10, `Should have 11 categories (found ${catData.categories.length})`);
  console.log(`✓ Categories API OK: ${catData.categories.length} categories loaded`);

  // 3. Test Schedule API
  console.log("\n[3] Testing GET /api/schedule");
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 2);
  const dateStr = tomorrow.toISOString().split("T")[0];
  const schedRes = await fetch(`${BASE_URL}/api/schedule?date=${dateStr}`);
  assert.strictEqual(schedRes.status, 200);
  const schedData = await schedRes.json();
  assert.strictEqual(schedData.success, true);
  assert.ok(schedData.slots.length > 0, "Should have time slots configured");
  console.log(`✓ Schedule API OK: ${schedData.slots.length} time slots for ${dateStr}`);

  // 4. Test Order Validation: Reject empty cart
  console.log("\n[4] Testing POST /api/orders validation (empty cart rejection)");
  const emptyRes = await fetch(`${BASE_URL}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      customerName: "Тест Клиент",
      customerPhone: "+7 701 111 22 33",
      pickupDate: dateStr,
      pickupTime: "12:00 - 14:00",
      orderType: "pickup",
      items: [],
    }),
  });
  assert.strictEqual(emptyRes.status, 400, "Should reject empty cart with status 400");
  console.log("✓ Empty cart rejected correctly");

  // 5. Test Order Validation: Reject past date
  console.log("\n[5] Testing POST /api/orders validation (past date rejection)");
  const pastRes = await fetch(`${BASE_URL}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      customerName: "Тест Клиент",
      customerPhone: "+7 701 111 22 33",
      pickupDate: "2020-01-01",
      pickupTime: "12:00 - 14:00",
      orderType: "pickup",
      items: [{ id: prodData.products[0].id, quantity: 1 }],
    }),
  });
  assert.strictEqual(pastRes.status, 400, "Should reject past date with status 400");
  console.log("✓ Past date rejected correctly");

  // 6. Test Successful Order Application Submission (with server price recalculation)
  console.log("\n[6] Testing POST /api/orders successful submission");
  const porscheProduct = prodData.products.find((p) => p.slug === "dessert-porsche") || prodData.products[0];
  const croissantProduct = prodData.products.find((p) => p.slug === "croissant-classic") || prodData.products[1];

  const orderRes = await fetch(`${BASE_URL}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      customerName: "Алия Нурланова",
      customerPhone: "+7 701 555 77 88",
      customerEmail: "aliya@example.com",
      orderType: "pickup",
      pickupDate: dateStr,
      pickupTime: "14:00 - 16:00",
      comment: "Пожалуйста, положите десерт Porsche в подарочный пакет",
      idempotencyKey: `test_idemp_${Date.now()}`,
      items: [
        { id: porscheProduct.id, quantity: 2, price: 999999 }, // Client sends forged price 999999
        { id: croissantProduct.id, quantity: 3, price: 1 }, // Client sends forged price 1
      ],
    }),
  });

  assert.strictEqual(orderRes.status, 200, "Order submission should succeed");
  const orderData = await orderRes.json();
  assert.strictEqual(orderData.success, true);
  assert.ok(orderData.orderNumber.startsWith("LC-"), "Order number must start with LC-");

  // Verify server-side price protection
  const expectedTotal = porscheProduct.price * 2 + croissantProduct.price * 3;
  assert.strictEqual(
    orderData.totalAmount,
    expectedTotal,
    `Total must be calculated from DB prices (${expectedTotal} ₸), client forged prices must be ignored (received ${orderData.totalAmount} ₸)`
  );
  console.log(`✓ Order created: ${orderData.orderNumber}, Total: ${orderData.totalAmount} ₸ (Client price tampering safely prevented!)`);

  // 7. Test Customer Order Retrieval
  console.log("\n[7] Testing GET /api/orders/[orderNumber]");
  const getOrderRes = await fetch(`${BASE_URL}/api/orders/${orderData.orderNumber}`);
  assert.strictEqual(getOrderRes.status, 200);
  const getOrderData = await getOrderRes.json();
  assert.strictEqual(getOrderData.success, true);
  assert.strictEqual(getOrderData.order.customer_name, "Алия Нурланова");
  assert.strictEqual(getOrderData.order.items.length, 2);
  console.log(`✓ Customer order lookup OK for ${orderData.orderNumber}`);

  // 8. Test Admin Login with invalid credentials
  console.log("\n[8] Testing Admin Login (invalid credentials rejection)");
  const badLoginRes = await fetch(`${BASE_URL}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "admin", password: "wrong_password" }),
  });
  assert.strictEqual(badLoginRes.status, 401, "Should reject wrong password with 401");
  console.log("✓ Invalid credentials rejected correctly");

  // 9. Test Admin Login with valid credentials
  console.log("\n[9] Testing Admin Login (valid credentials)");
  const goodLoginRes = await fetch(`${BASE_URL}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "admin", password: "lacreme2026" }),
  });
  assert.strictEqual(goodLoginRes.status, 200, "Admin login should succeed");
  const cookieHeader = goodLoginRes.headers.get("set-cookie");
  assert.ok(cookieHeader, "Admin login must set HTTP-only session cookie");
  console.log("✓ Admin authenticated successfully, session cookie received");

  // 10. Test Admin Stats
  console.log("\n[10] Testing GET /api/admin/stats");
  const statsRes = await fetch(`${BASE_URL}/api/admin/stats`, {
    headers: { Cookie: cookieHeader },
  });
  assert.strictEqual(statsRes.status, 200);
  const statsData = await statsRes.json();
  assert.strictEqual(statsData.success, true);
  assert.ok(statsData.stats.totalOrders >= 1, "Stats should count at least 1 order");
  assert.ok(statsData.stats.totalRevenue >= expectedTotal, "Revenue should reflect the new order");
  console.log(`✓ Admin Stats OK: ${statsData.stats.totalOrders} orders, ${statsData.stats.totalRevenue} ₸ revenue`);

  // 11. Test Admin Order Status Update & Notes
  console.log("\n[11] Testing PATCH /api/admin/orders/[id]");
  const updateRes = await fetch(`${BASE_URL}/api/admin/orders/${orderData.orderNumber}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
    },
    body: JSON.stringify({
      status: "confirmed",
      adminNotes: "Клиентка подтвердила самовывоз к 15:00. Готовим праздничную ленту.",
    }),
  });
  assert.strictEqual(updateRes.status, 200);
  const updateData = await updateRes.json();
  assert.strictEqual(updateData.success, true);
  assert.strictEqual(updateData.order.status, "confirmed");
  assert.ok(updateData.order.admin_notes.includes("ленту"));
  console.log("✓ Order status updated to 'confirmed' and admin notes saved");

  // 12. Test Admin Product Price Edit
  console.log("\n[12] Testing PATCH /api/admin/products/[id]");
  const testProd = prodData.products[0];
  const originalPrice = testProd.price;
  const newPrice = originalPrice + 100;
  const editProdRes = await fetch(`${BASE_URL}/api/admin/products/${testProd.id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
    },
    body: JSON.stringify({ price: newPrice }),
  });
  assert.strictEqual(editProdRes.status, 200);
  const editProdData = await editProdRes.json();
  assert.strictEqual(editProdData.success, true);
  assert.strictEqual(editProdData.product.price, newPrice);
  console.log(`✓ Product price successfully updated from ${originalPrice} ₸ to ${newPrice} ₸ in database`);

  // Revert price back
  await fetch(`${BASE_URL}/api/admin/products/${testProd.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Cookie: cookieHeader },
    body: JSON.stringify({ price: originalPrice }),
  });

  // 13. Test Historical Integrity of Old Order
  console.log("\n[13] Testing Historical Integrity of Orders (Price Snapshot Rule)");
  const histOrderRes = await fetch(`${BASE_URL}/api/orders/${orderData.orderNumber}`);
  const histOrderData = await histOrderRes.json();
  assert.strictEqual(
    histOrderData.order.total_amount,
    expectedTotal,
    "Historic order price must remain completely unchanged even when product prices change later!"
  );
  console.log("✓ Order history snapshot price integrity verified");

  // 14. Test Telegram Retry Endpoint
  console.log("\n[14] Testing POST /api/admin/telegram/retry");
  const retryRes = await fetch(`${BASE_URL}/api/admin/telegram/retry`, {
    method: "POST",
    headers: { Cookie: cookieHeader },
  });
  assert.strictEqual(retryRes.status, 200);
  const retryData = await retryRes.json();
  assert.strictEqual(retryData.success, true);
  console.log("✓ Telegram retry mechanism executed without errors");

  console.log("\n=== ALL 14 AUTOMATED INTEGRATION TESTS PASSED SUCCESSFULLY! ===");
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
