import os
from PIL import Image

OUT_DIR = "public/images/products"
os.makedirs(OUT_DIR, exist_ok=True)
CAT = "extracted_assets/catalog"

def crop_and_save(page_num, box, filename):
    page_path = f"{CAT}/page_{page_num}.png"
    if not os.path.exists(page_path):
        print(f"Missing {page_path}")
        return
    img = Image.open(page_path)
    # box is (left, top, right, bottom)
    cropped = img.crop(box)
    target_path = os.path.join(OUT_DIR, filename)
    cropped.convert("RGB").save(target_path, "JPEG", quality=92)
    print(f"Saved {target_path} {cropped.size}")

# Page 1: Porsche
crop_and_save(1, (150, 100, 1550, 1150), "porsche-cake.jpg")

# Page 2: Croissants
crop_and_save(2, (10, 50, 390, 560), "croissant-classic.jpg")
crop_and_save(2, (380, 50, 770, 560), "croissant-chocolate.jpg")
crop_and_save(2, (760, 50, 1150, 560), "croissant-almond.jpg")
crop_and_save(2, (1120, 50, 1580, 560), "croissant-dubai.jpg")

crop_and_save(2, (10, 520, 420, 1000), "croissant-pistachio.jpg")
crop_and_save(2, (410, 520, 780, 1000), "croissant-oreo.jpg")
crop_and_save(2, (770, 520, 1140, 1000), "croissant-vanilla-raspberry.jpg")
crop_and_save(2, (1130, 520, 1580, 1000), "croissant-lotus.jpg")

# Page 3: Pastry & Tarts
crop_and_save(3, (20, 40, 580, 560), "puff-berry-mix.jpg")
crop_and_save(3, (580, 40, 1050, 560), "cream-basket-blueberry.jpg")
crop_and_save(3, (1050, 40, 1580, 560), "puff-banana-almond.jpg")
crop_and_save(3, (80, 540, 560, 1050), "puff-mozzarella.jpg")
crop_and_save(3, (560, 540, 1040, 1050), "puff-strawberry-vanilla.jpg")
crop_and_save(3, (1020, 540, 1550, 1050), "puff-apple.jpg")

# Page 4: Sets
crop_and_save(4, (30, 80, 850, 950), "set-mini-pastry.jpg")
crop_and_save(4, (830, 80, 1580, 1150), "set-mini-croissants.jpg")

# Page 5: Cheesecakes
crop_and_save(5, (40, 240, 440, 760), "cheesecake-spanish-chocolate.jpg")
crop_and_save(5, (440, 240, 840, 760), "cheesecake-spanish-classic.jpg")
crop_and_save(5, (830, 240, 1220, 760), "cheesecake-spanish-pistachio.jpg")
crop_and_save(5, (1200, 240, 1580, 760), "cheesecake-tiramisu.jpg")

# Page 6: Individual Desserts
crop_and_save(6, (60, 60, 540, 540), "dessert-rabbit.jpg")
crop_and_save(6, (540, 60, 980, 540), "dessert-pistachio-roll.jpg")
crop_and_save(6, (980, 60, 1560, 540), "dessert-la-creme-car.jpg")
crop_and_save(6, (80, 540, 750, 1050), "dessert-mango-fruit.jpg")
crop_and_save(6, (850, 540, 1550, 1050), "dessert-raspberry-fruit.jpg")

# Page 7: Boxed sets
crop_and_save(7, (40, 280, 860, 1120), "set-fruit-desserts.jpg")
crop_and_save(7, (840, 40, 1580, 840), "set-nut-desserts.jpg")

# Page 8: Tartlets & Classics
crop_and_save(8, (50, 80, 550, 560), "macaron-set.jpg")
crop_and_save(8, (580, 80, 1040, 560), "cake-portion-medovik.jpg")
crop_and_save(8, (1040, 80, 1560, 560), "dessert-hazel-dream.jpg")
crop_and_save(8, (50, 540, 620, 1050), "tartlet-trio.jpg")
crop_and_save(8, (630, 540, 1090, 1050), "cake-portion-napoleon.jpg")
crop_and_save(8, (1090, 540, 1560, 1050), "cake-portion-monet.jpg")

# Page 9: National & Luxury Chocolate
crop_and_save(9, (50, 240, 560, 860), "truffles-dara.jpg")
crop_and_save(9, (560, 240, 1060, 860), "sweets-tumar.jpg")
crop_and_save(9, (1050, 240, 1560, 860), "dessert-asyk.jpg")

# Page 10: Eclairs
crop_and_save(10, (40, 100, 550, 550), "eclair-mango-passion.jpg")
crop_and_save(10, (540, 100, 1040, 550), "eclair-caramel.jpg")
crop_and_save(10, (1030, 100, 1560, 550), "eclair-earl-grey.jpg")
crop_and_save(10, (40, 510, 550, 980), "eclair-chocolate-bear.jpg")
crop_and_save(10, (540, 510, 1040, 980), "eclair-raspberry.jpg")
crop_and_save(10, (1030, 510, 1560, 980), "eclair-blueberry.jpg")

# Page 11: Whole Standard Cakes
crop_and_save(11, (160, 120, 560, 620), "cake-profitrole-cherry.jpg")
crop_and_save(11, (540, 120, 920, 620), "cake-profitrole-currant.jpg")
crop_and_save(11, (880, 120, 1260, 620), "cake-milk-slice.jpg")
crop_and_save(11, (1230, 120, 1580, 620), "cake-pistachio-raspberry.jpg")

# Page 12: Big Cakes & Rolls
crop_and_save(12, (200, 140, 680, 650), "cake-big-cheesecake.jpg")
crop_and_save(12, (660, 140, 1100, 650), "cake-big-pistachio-roll.jpg")
crop_and_save(12, (1080, 140, 1550, 650), "cake-frederic.jpg")

# Page 13: Classic Big Cakes
crop_and_save(13, (180, 160, 580, 640), "cake-big-napoleon.jpg")
crop_and_save(13, (560, 160, 940, 640), "cake-big-medovik.jpg")
crop_and_save(13, (920, 160, 1280, 640), "cake-big-monet.jpg")
crop_and_save(13, (1260, 160, 1580, 640), "cake-big-snickers.jpg")

# Page 14: Mini Cakes
crop_and_save(14, (60, 60, 440, 550), "minicake-tiramisu.jpg")
crop_and_save(14, (430, 60, 810, 550), "minicake-caviar.jpg")
crop_and_save(14, (800, 60, 1190, 550), "minicake-almond-strawberry.jpg")
crop_and_save(14, (1170, 60, 1580, 550), "minicake-rabbit.jpg")
crop_and_save(14, (180, 540, 580, 980), "minicake-unicorn.jpg")
crop_and_save(14, (570, 540, 970, 980), "minicake-fawn.jpg")
crop_and_save(14, (960, 540, 1380, 980), "minicake-cheesecake.jpg")

# Page 15: Je Vie Vegan line
crop_and_save(15, (40, 180, 350, 480), "jevie-truffles.jpg")
crop_and_save(15, (360, 180, 660, 480), "jevie-choco-bombs.jpg")
crop_and_save(15, (680, 180, 1580, 780), "jevie-cookies.jpg")
crop_and_save(15, (40, 390, 350, 680), "jevie-choco-box.jpg")
crop_and_save(15, (360, 390, 660, 680), "jevie-fruits-chocolate.jpg")
crop_and_save(15, (40, 580, 350, 880), "jevie-granola-classic.jpg")
crop_and_save(15, (360, 580, 660, 880), "jevie-granola-choco.jpg")

print("All catalog products cropped successfully!")
