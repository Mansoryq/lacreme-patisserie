import os
from PIL import Image

OUT_DIR = "public/images/story"
os.makedirs(OUT_DIR, exist_ok=True)

# 1. Dana Kanapina Founder Portrait
kitchen_p1 = Image.open("extracted_assets/kitchen/page_1.png")
# The photo in center of page 1: (380, 280, 810, 770)
dana_photo = kitchen_p1.crop((370, 270, 820, 780))
dana_photo.convert("RGB").save(f"{OUT_DIR}/dana-kanapina.jpg", "JPEG", quality=95)
print("Saved dana-kanapina.jpg")

# 2. 10 Years Anniversary Collage
bar_p1 = Image.open("extracted_assets/bar/page_1.png")
# Boutiques and moments collage at bottom
bar_collage = bar_p1.crop((150, 560, 950, 1200))
bar_collage.convert("RGB").save(f"{OUT_DIR}/anniversary-moments.jpg", "JPEG", quality=95)
print("Saved anniversary-moments.jpg")

# 3. Signature drink Merci D
bar_p2 = Image.open("extracted_assets/bar/page_2.png")
merci_drink = bar_p2.crop((320, 400, 780, 900))
merci_drink.convert("RGB").save("public/images/products/merci-d-drink.jpg", "JPEG", quality=95)
print("Saved merci-d-drink.jpg")

# 4. Croissant Sandwich La Creme hero
kitchen_p18 = Image.open("extracted_assets/kitchen/page_18.png")
croissant_sandwich = kitchen_p18.crop((50, 50, 1180, 800))
croissant_sandwich.convert("RGB").save("public/images/products/croissant-sandwich-hero.jpg", "JPEG", quality=95)
print("Saved croissant-sandwich-hero.jpg")

# 5. Grand Breakfast table
kitchen_p8 = Image.open("extracted_assets/kitchen/page_8.png")
breakfast_hero = kitchen_p8.crop((20, 20, 680, 420))
breakfast_hero.convert("RGB").save(f"{OUT_DIR}/breakfast-table.jpg", "JPEG", quality=95)
print("Saved breakfast-table.jpg")

print("Story and editorial images cropped successfully!")
