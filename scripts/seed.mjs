import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import crypto from "crypto";

const dbDirectory = path.join(process.cwd(), "data");
if (!fs.existsSync(dbDirectory)) {
  fs.mkdirSync(dbDirectory, { recursive: true });
}
const dbPath = path.join(dbDirectory, "lacreme.db");
const db = new Database(dbPath);

console.log("Seeding database...");

// Ensure tables exist
db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    name_fr TEXT,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    category_id INTEGER NOT NULL REFERENCES categories(id),
    name TEXT NOT NULL,
    description TEXT,
    price INTEGER NOT NULL,
    weight TEXT,
    is_gluten_free INTEGER DEFAULT 0,
    is_bestseller INTEGER DEFAULT 0,
    is_preorder INTEGER DEFAULT 0,
    is_new INTEGER DEFAULT 0,
    image_url TEXT,
    display_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_number TEXT UNIQUE NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    order_type TEXT NOT NULL,
    delivery_address TEXT,
    pickup_date TEXT NOT NULL,
    pickup_time TEXT NOT NULL,
    total_amount INTEGER NOT NULL,
    comment TEXT,
    status TEXT NOT NULL DEFAULT 'new',
    idempotency_key TEXT UNIQUE,
    admin_notes TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id),
    product_name TEXT NOT NULL,
    price INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    total INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS time_slots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slot_label TEXT NOT NULL,
    max_orders INTEGER DEFAULT 6,
    is_active INTEGER DEFAULT 1,
    display_order INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS schedule_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS notification_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    channel TEXT NOT NULL DEFAULT 'telegram',
    status TEXT NOT NULL,
    payload TEXT,
    error_message TEXT,
    attempts INTEGER DEFAULT 1,
    last_attempt_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS site_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL
  );
`);

// Clear existing tables
db.exec("DELETE FROM order_items;");
db.exec("DELETE FROM orders;");
db.exec("DELETE FROM products;");
db.exec("DELETE FROM categories;");
db.exec("DELETE FROM time_slots;");
db.exec("DELETE FROM schedule_settings;");
db.exec("DELETE FROM admin_users;");
db.exec("DELETE FROM site_settings;");

const categories = [
  { slug: "cakes-whole", name: "Торты на заказ", name_fr: "Grands Gâteaux", description: "Изысканные фирменные торты ручной работы от шеф-кондитеров La Crème для особенных событий", order: 1 },
  { slug: "mini-cakes", name: "Мини-торты", name_fr: "Petits Gâteaux", description: "Камерные бенто-торты и мини-десерты по предварительному заказу", order: 2 },
  { slug: "individual-desserts", name: "Порционные десерты", name_fr: "Pâtisserie Individuelle", description: "Знаменитые десерты La Crème: Porsche, авторские рулеты, макаронс и тарталетки", order: 3 },
  { slug: "eclairs", name: "Французские эклеры", name_fr: "Éclairs Signatures", description: "Воздушное заварное тесто с деликатными кремами, ганашами и ягодами", order: 4 },
  { slug: "croissants", name: "Круассаны", name_fr: "Croissants d'Auteur", description: "Традиционная французская слоеная выпечка на отборном сливочном масле", order: 5 },
  { slug: "pastries", name: "Слойки и выпечка", name_fr: "Viennoiseries", description: "Хрустящие слойки со свежими ягодами, фруктами, сырами и нежными кремами", order: 6 },
  { slug: "cheesecakes", name: "Испанские чизкейки", name_fr: "Gâteaux au Fromage", description: "Знаменитые баскские чизкейки с карамельной корочкой и нежнейшим сливочным центром", order: 7 },
  { slug: "pastry-sets", name: "Подарочные наборы", name_fr: "Coffrets Cadeaux", description: "Праздничные коробки мини-круассанов, слоек и коллекционных десертов", order: 8 },
  { slug: "national-luxury", name: "Национальная коллекция", name_fr: "Collection Héritage", description: "Уникальное слияние французских кондитерских техник и традиционных казахских вкусов (балқаймақ, тары, саумал, ірімшік)", order: 9 },
  { slug: "vegan-je-vie", name: "Линейка Je Vie (Vegan)", name_fr: "Je Vie Gourmandise Pure", description: "Сладости ручной работы без сахара, глютена, усилителей вкуса, лактозы и консервантов", order: 10 },
  { slug: "signature-bar", name: "Кофе и барные напитки", name_fr: "Boissons & Bar", description: "Авторские напитки Даны Канапиной, селекционный кофе V60, органическая матча", order: 11 }
];

const insertCat = db.prepare(`
  INSERT INTO categories (slug, name, name_fr, description, display_order)
  VALUES (@slug, @name, @name_fr, @description, @order)
`);

const catMap = {};
for (const cat of categories) {
  const result = insertCat.run(cat);
  catMap[cat.slug] = result.lastInsertRowid;
}

const products = [
  // 1. Cakes Whole
  {
    name: "Профитролевый вишня-шоколад",
    slug: "cake-profitrole-cherry",
    category_slug: "cakes-whole",
    description: "Профитроли с вишневым муссом, шоколадный и сливочный крем-мусс, нежнейший шоколадный бисквит.",
    price: 19000,
    weight: "1,5 кг",
    is_gluten_free: 0,
    is_bestseller: 1,
    is_preorder: 1,
    is_new: 0,
    image_url: "/images/products/cake-profitrole-cherry.jpg",
    order: 1
  },
  {
    name: "Профитролевый смородина",
    slug: "cake-profitrole-currant",
    category_slug: "cakes-whole",
    description: "Сливочный мусс, профитроли с крем-муссом смородина, бархатистый ванильный бисквит.",
    price: 19000,
    weight: "1,5 кг",
    is_gluten_free: 0,
    is_bestseller: 0,
    is_preorder: 1,
    is_new: 0,
    image_url: "/images/products/cake-profitrole-currant.jpg",
    order: 2
  },
  {
    name: "Молочный ломтик",
    slug: "cake-milk-slice",
    category_slug: "cakes-whole",
    description: "Шоколадный бисквит, мусс на молочном шоколаде, фирменный сливочный крем пломбир.",
    price: 18000,
    weight: "1,5 кг",
    is_gluten_free: 0,
    is_bestseller: 1,
    is_preorder: 1,
    is_new: 0,
    image_url: "/images/products/cake-milk-slice.jpg",
    order: 3
  },
  {
    name: "Фисташка-малина",
    slug: "cake-pistachio-raspberry",
    category_slug: "cakes-whole",
    description: "Фисташковый мусс на маскарпоне, сливках и белом шоколаде, с малиновой прослойкой, хрустящим слоем с фисташковым роялтином, белым шоколадом и сублимированной малиной, на бисквите Джоконда из миндальной, фисташковой и пшеничной муки, с декором из свежих ягод.",
    price: 20000,
    weight: "1,3 кг",
    is_gluten_free: 0,
    is_bestseller: 1,
    is_preorder: 1,
    is_new: 0,
    image_url: "/images/products/cake-pistachio-raspberry.jpg",
    order: 4
  },
  {
    name: "Чизкейк классический La Crème",
    slug: "cake-big-cheesecake",
    category_slug: "cakes-whole",
    description: "Нежная кремовая текстура с насыщенным сливочным вкусом и аппетитной карамелизированной корочкой.",
    price: 15000,
    weight: "1,4 кг",
    is_gluten_free: 0,
    is_bestseller: 1,
    is_preorder: 1,
    is_new: 0,
    image_url: "/images/products/cake-big-cheesecake.jpg",
    order: 5
  },
  {
    name: "Фисташковый рулет с малиной",
    slug: "cake-big-pistachio-roll",
    category_slug: "cakes-whole",
    description: "Хрустящая меренга, сырный крем со свежей малиной. Декорирован сезонными свежими ягодами.",
    price: 15000,
    weight: "850 г",
    is_gluten_free: 1,
    is_bestseller: 1,
    is_preorder: 1,
    is_new: 0,
    image_url: "/images/products/cake-big-pistachio-roll.jpg",
    order: 6
  },
  {
    name: "Frederic",
    slug: "cake-frederic",
    category_slug: "cakes-whole",
    description: "Сырный мусс, шоколадно-фундучный бисквит, хрустящий слой с французской вафлей.",
    price: 12000,
    weight: "500 г",
    is_gluten_free: 0,
    is_bestseller: 0,
    is_preorder: 1,
    is_new: 0,
    image_url: "/images/products/cake-frederic.jpg",
    order: 7
  },
  {
    name: "Наполеон",
    slug: "cake-big-napoleon",
    category_slug: "cakes-whole",
    description: "Хрустящие тончайшие слоеные коржи и шелковистый сливочно-заварной крем.",
    price: 15000,
    weight: "1,1 кг",
    is_gluten_free: 0,
    is_bestseller: 1,
    is_preorder: 1,
    is_new: 0,
    image_url: "/images/products/cake-big-napoleon.jpg",
    order: 8
  },
  {
    name: "Медовик",
    slug: "cake-big-medovik",
    category_slug: "cakes-whole",
    description: "Тонкие карамельно-медовые коржи, нежный сливочно-сметанный крем по авторскому рецепту.",
    price: 16000,
    weight: "1,3 кг",
    is_gluten_free: 0,
    is_bestseller: 1,
    is_preorder: 1,
    is_new: 0,
    image_url: "/images/products/cake-big-medovik.jpg",
    order: 9
  },
  {
    name: "Моне",
    slug: "cake-big-monet",
    category_slug: "cakes-whole",
    description: "Бисквит на основе фисташковой муки, свежая отборная малина, крем на натуральных взбитых сливках.",
    price: 17000,
    weight: "1,1 кг",
    is_gluten_free: 0,
    is_bestseller: 1,
    is_preorder: 1,
    is_new: 0,
    image_url: "/images/products/cake-big-monet.jpg",
    order: 10
  },
  {
    name: "Сникерс",
    slug: "cake-big-snickers",
    category_slug: "cakes-whole",
    description: "Мусс шоколадный и рикотта, домашняя карамель с фундуком, насыщенный шоколадный бисквит, украшен шоколадной глазурью.",
    price: 13000,
    weight: "1,0 кг",
    is_gluten_free: 0,
    is_bestseller: 0,
    is_preorder: 1,
    is_new: 0,
    image_url: "/images/products/cake-big-snickers.jpg",
    order: 11
  },

  // 2. Mini Cakes (По предзаказу)
  {
    name: "Мини-торт Caviar",
    slug: "minicake-caviar",
    category_slug: "mini-cakes",
    description: "Бисквит из миндальной муки с добавлением пшеничной, с клубникой и кремом из белого шоколада, маскарпоне и сливок.",
    price: 9500,
    weight: "500 г",
    is_gluten_free: 0,
    is_bestseller: 1,
    is_preorder: 1,
    is_new: 0,
    image_url: "/images/products/minicake-caviar.jpg",
    order: 1
  },
  {
    name: "Мини-торт Тирамису",
    slug: "minicake-tiramisu",
    category_slug: "mini-cakes",
    description: "Кофейно-шоколадная основа, сырный слой с маскарпоне, какао экстра-класса.",
    price: 13000,
    weight: "950 г",
    is_gluten_free: 0,
    is_bestseller: 0,
    is_preorder: 1,
    is_new: 0,
    image_url: "/images/products/minicake-tiramisu.jpg",
    order: 2
  },
  {
    name: "Мини-торт Миндаль-клубника",
    slug: "minicake-almond-strawberry",
    category_slug: "mini-cakes",
    description: "Бисквит из миндальной муки с клубникой и кремом из белого шоколада, маскарпоне и сливок.",
    price: 13000,
    weight: "850 г",
    is_gluten_free: 0,
    is_bestseller: 1,
    is_preorder: 1,
    is_new: 0,
    image_url: "/images/products/minicake-almond-strawberry.jpg",
    order: 3
  },
  {
    name: "Мини-торт Rabbit",
    slug: "minicake-rabbit",
    category_slug: "mini-cakes",
    description: "Профитролевый сливочный мусс, профитроли с крем-муссом смородина, ванильный бисквит.",
    price: 12000,
    weight: "800 г",
    is_gluten_free: 0,
    is_bestseller: 1,
    is_preorder: 1,
    is_new: 0,
    image_url: "/images/products/minicake-rabbit.jpg",
    order: 4
  },
  {
    name: "Мини-торт Единорог",
    slug: "minicake-unicorn",
    category_slug: "mini-cakes",
    description: "Пломбир, корж ванильный, крем сливочный со сгущенкой и сыром.",
    price: 12000,
    weight: "800 г",
    is_gluten_free: 0,
    is_bestseller: 0,
    is_preorder: 1,
    is_new: 0,
    image_url: "/images/products/minicake-unicorn.jpg",
    order: 5
  },
  {
    name: "Мини-торт Оленёнок",
    slug: "minicake-fawn",
    category_slug: "mini-cakes",
    description: "Шоколадные коржи, ванильный крем пломбир, праздничный декор.",
    price: 12000,
    weight: "800 г",
    is_gluten_free: 0,
    is_bestseller: 0,
    is_preorder: 1,
    is_new: 0,
    image_url: "/images/products/minicake-fawn.jpg",
    order: 6
  },
  {
    name: "Мини-торт Cheesecake",
    slug: "minicake-cheesecake",
    category_slug: "mini-cakes",
    description: "Мусс на творожном сыре и маскарпоне, конфи манго-маракуйя, бисквит из рисовой и кокосовой муки.",
    price: 9500,
    weight: "400 г",
    is_gluten_free: 1,
    is_bestseller: 1,
    is_preorder: 1,
    is_new: 0,
    image_url: "/images/products/minicake-cheesecake.jpg",
    order: 7
  },

  // 3. Individual Desserts
  {
    name: "PORSCHE",
    slug: "dessert-porsche",
    category_slug: "individual-desserts",
    description: "Бисквит брауни, ганаш на тёмном и молочном шоколаде, ванильный крем, нежный фисташковый мусс и малиновое конфи в форме спорткара.",
    price: 3700,
    weight: "1 шт",
    is_gluten_free: 0,
    is_bestseller: 1,
    is_preorder: 0,
    is_new: 0,
    image_url: "/images/products/porsche-cake.jpg",
    order: 1
  },
  {
    name: "La Crème Boutique car",
    slug: "dessert-la-creme-car",
    category_slug: "individual-desserts",
    description: "Мусс на молочном шоколаде, фундучное пралине, начинка из манго и маракуйя, шоколадный бисквит с хрустящим слоем.",
    price: 4100,
    weight: "1 шт",
    is_gluten_free: 0,
    is_bestseller: 1,
    is_preorder: 0,
    is_new: 0,
    image_url: "/images/products/dessert-la-creme-car.jpg",
    order: 2
  },
  {
    name: "Манго корпусный десерт",
    slug: "dessert-mango-fruit",
    category_slug: "individual-desserts",
    description: "Тропическая начинка из манго и маракуйи в ганаше на белом шоколаде с пюре манго и кокосовым молоком, корпус из белого шоколада.",
    price: 3700,
    weight: "1 шт",
    is_gluten_free: 1,
    is_bestseller: 1,
    is_preorder: 0,
    is_new: 1,
    image_url: "/images/products/dessert-mango-fruit.jpg",
    order: 3
  },
  {
    name: "Малина корпусный десерт",
    slug: "dessert-raspberry-fruit",
    category_slug: "individual-desserts",
    description: "Сливочный ганаш на ванильной пасте и белом шоколаде, в центре малиновое пюре, корпус из белого шоколада в виде спелой ягоды.",
    price: 3500,
    weight: "1 шт",
    is_gluten_free: 1,
    is_bestseller: 1,
    is_preorder: 0,
    is_new: 1,
    image_url: "/images/products/dessert-raspberry-fruit.jpg",
    order: 4
  },
  {
    name: "Rabbit",
    slug: "dessert-rabbit",
    category_slug: "individual-desserts",
    description: "Мусс ванильный и карамельный на молочном шоколаде, карамельный бисквит на миндальной муке.",
    price: 3500,
    weight: "1 шт",
    is_gluten_free: 0,
    is_bestseller: 1,
    is_preorder: 0,
    is_new: 0,
    image_url: "/images/products/dessert-rabbit.jpg",
    order: 5
  },
  {
    name: "Фисташковый рулет (порция)",
    slug: "dessert-pistachio-roll",
    category_slug: "individual-desserts",
    description: "Хрустящая меренга, сырный крем со свежей малиной, нежные фисташки.",
    price: 3700,
    weight: "1 порция",
    is_gluten_free: 1,
    is_bestseller: 1,
    is_preorder: 0,
    is_new: 0,
    image_url: "/images/products/dessert-pistachio-roll.jpg",
    order: 6
  },
  {
    name: "Hazel Dream by Hans Ovando",
    slug: "dessert-hazel-dream",
    category_slug: "individual-desserts",
    description: "Фундучное финансье с малиновым джемом, сливочно-ванильной карамелью, намелака с пастой фундука и сливками, сливочно-кофейный ганаш на белом шоколаде.",
    price: 4500,
    weight: "1 шт",
    is_gluten_free: 0,
    is_bestseller: 1,
    is_preorder: 0,
    is_new: 0,
    image_url: "/images/products/dessert-hazel-dream.jpg",
    order: 7
  },
  {
    name: "Трио мини-тарталеток",
    slug: "tartlet-trio",
    category_slug: "individual-desserts",
    description: "Набор из 3 мини-тарталеток: 1. Шоколадный (сабле, ганаш, крем и бисквит шоколадные); 2. Клубничный (фисташковый крем, ванильная намелака, конфи клубника); 3. Манго-маракуйя (сабле, франжипан, начинка манго-маракуйя, шантилье).",
    price: 4500,
    weight: "3 шт",
    is_gluten_free: 0,
    is_bestseller: 1,
    is_preorder: 0,
    is_new: 0,
    image_url: "/images/products/tartlet-trio.jpg",
    order: 8
  },
  {
    name: "Наполеон порционный",
    slug: "cake-portion-napoleon",
    category_slug: "individual-desserts",
    description: "Хрустящие слоеные коржи, сливочно-заварной крем, декор из свежих ягод.",
    price: 3200,
    weight: "1 порция",
    is_gluten_free: 0,
    is_bestseller: 1,
    is_preorder: 0,
    is_new: 0,
    image_url: "/images/products/cake-portion-napoleon.jpg",
    order: 9
  },
  {
    name: "Медовое",
    slug: "cake-portion-medovik",
    category_slug: "individual-desserts",
    description: "Тонкие карамельно-медовые коржи, сливочно-сметанный крем.",
    price: 3200,
    weight: "1 порция",
    is_gluten_free: 0,
    is_bestseller: 0,
    is_preorder: 0,
    is_new: 0,
    image_url: "/images/products/cake-portion-medovik.jpg",
    order: 10
  },
  {
    name: "Моне порционный",
    slug: "cake-portion-monet",
    category_slug: "individual-desserts",
    description: "Фисташковый бисквит, свежая малина, нежный крем на взбитых сливках.",
    price: 3200,
    weight: "1 порция",
    is_gluten_free: 0,
    is_bestseller: 0,
    is_preorder: 0,
    is_new: 0,
    image_url: "/images/products/cake-portion-monet.jpg",
    order: 11
  },
  {
    name: "Макаронс (набор 5 шт)",
    slug: "macaron-set-5",
    category_slug: "individual-desserts",
    description: "Французские макаронс с нежными ганашами. Без глютена. В наборе 5 вкусов.",
    price: 4900,
    weight: "5 шт",
    is_gluten_free: 1,
    is_bestseller: 1,
    is_preorder: 0,
    is_new: 0,
    image_url: "/images/products/macaron-set.jpg",
    order: 12
  },

  // 4. Eclairs
  {
    name: "Эклер манго-маракуйя",
    slug: "eclair-mango-passion",
    category_slug: "eclairs",
    description: "Крем манго-маракуйя покрыт сливочным ганашем с глазурью из натурального пюре манго и маракуйи.",
    price: 2700,
    weight: "1 шт",
    is_gluten_free: 0,
    is_bestseller: 1,
    is_preorder: 0,
    is_new: 1,
    image_url: "/images/products/eclair-mango-passion.jpg",
    order: 1
  },
  {
    name: "Эклер карамельный",
    slug: "eclair-caramel",
    category_slug: "eclairs",
    description: "Заварной сливочно-карамельный крем, покрыт соленой карамелью и хрустящим штрейзелем.",
    price: 2500,
    weight: "1 шт",
    is_gluten_free: 0,
    is_bestseller: 1,
    is_preorder: 0,
    is_new: 1,
    image_url: "/images/products/eclair-caramel.jpg",
    order: 2
  },
  {
    name: "Эклер Эрл Грей",
    slug: "eclair-earl-grey",
    category_slug: "eclairs",
    description: "Заварной крем с добавлением чая Эрл Грей и карамельного шоколада.",
    price: 2500,
    weight: "1 шт",
    is_gluten_free: 0,
    is_bestseller: 0,
    is_preorder: 0,
    is_new: 1,
    image_url: "/images/products/eclair-earl-grey.jpg",
    order: 3
  },
  {
    name: "Эклер шоколадный мишка",
    slug: "eclair-chocolate-bear",
    category_slug: "eclairs",
    description: "Заварной крем с темным шоколадом, украшен фирменным мишкой из сливочного ганаша на темном шоколаде.",
    price: 2700,
    weight: "1 шт",
    is_gluten_free: 0,
    is_bestseller: 1,
    is_preorder: 0,
    is_new: 1,
    image_url: "/images/products/eclair-chocolate-bear.jpg",
    order: 4
  },
  {
    name: "Эклер малиновый",
    slug: "eclair-raspberry",
    category_slug: "eclairs",
    description: "Сырно-сливочный крем с малиновым джемом, украшен ванильным ганашем и ягодами. Тесто из рисовой муки (Gluten Free).",
    price: 2800,
    weight: "1 шт",
    is_gluten_free: 1,
    is_bestseller: 1,
    is_preorder: 0,
    is_new: 1,
    image_url: "/images/products/eclair-raspberry.jpg",
    order: 5
  },
  {
    name: "Эклер черничный",
    slug: "eclair-blueberry",
    category_slug: "eclairs",
    description: "Сливочно-сырный крем, конфи черника, украшен кремом шантильи с маскарпоне и черникой. Тесто из рисовой муки (Gluten Free).",
    price: 2800,
    weight: "1 шт",
    is_gluten_free: 1,
    is_bestseller: 0,
    is_preorder: 0,
    is_new: 0,
    image_url: "/images/products/eclair-blueberry.jpg",
    order: 6
  },

  // 5. Croissants
  {
    name: "Круассан классический",
    slug: "croissant-classic",
    category_slug: "croissants",
    description: "Аутентичный французский слоеный круассан на фермерском сливочном масле. Воздушная слоистость и хрустящая корочка.",
    price: 1200,
    weight: "1 шт",
    is_gluten_free: 0,
    is_bestseller: 1,
    is_preorder: 0,
    is_new: 0,
    image_url: "/images/products/croissant-classic.jpg",
    order: 1
  },
  {
    name: "Дубайский круассан",
    slug: "croissant-dubai",
    category_slug: "croissants",
    description: "Хит кондитерской: круассан с начинкой из фисташкового крема, хрустящего теста катаифи и премиального молочного шоколада.",
    price: 4900,
    weight: "1 шт",
    is_gluten_free: 0,
    is_bestseller: 1,
    is_preorder: 0,
    is_new: 1,
    image_url: "/images/products/croissant-dubai.jpg",
    order: 2
  },
  {
    name: "Круассан LOTUS",
    slug: "croissant-lotus",
    category_slug: "croissants",
    description: "Фирменный круассан с кремом на основе карамельного печенья Lotus Biscoff и цельным печеньем.",
    price: 4900,
    weight: "1 шт",
    is_gluten_free: 0,
    is_bestseller: 1,
    is_preorder: 0,
    is_new: 1,
    image_url: "/images/products/croissant-lotus.jpg",
    order: 3
  },
  {
    name: "Круассан фисташковый",
    slug: "croissant-pistachio",
    category_slug: "croissants",
    description: "Насыщенный фисташковый заварной крем и фисташковая посыпка.",
    price: 2300,
    weight: "1 шт",
    is_gluten_free: 0,
    is_bestseller: 1,
    is_preorder: 0,
    is_new: 0,
    image_url: "/images/products/croissant-pistachio.jpg",
    order: 4
  },
  {
    name: "Круассан с шоколадным кремом",
    slug: "croissant-chocolate",
    category_slug: "croissants",
    description: "Шоколадный крем на бельгийском шоколаде и шоколадный медальон La Crème.",
    price: 2200,
    weight: "1 шт",
    is_gluten_free: 0,
    is_bestseller: 0,
    is_preorder: 0,
    is_new: 0,
    image_url: "/images/products/croissant-chocolate.jpg",
    order: 5
  },
  {
    name: "Круассан миндальный",
    slug: "croissant-almond",
    category_slug: "croissants",
    description: "Пропитанный ромово-сахарным сиропом, наполненный миндальным кремом франжипан и посыпанный миндальными лепестками.",
    price: 2100,
    weight: "1 шт",
    is_gluten_free: 0,
    is_bestseller: 1,
    is_preorder: 0,
    is_new: 0,
    image_url: "/images/products/croissant-almond.jpg",
    order: 6
  },
  {
    name: "Круассан орео",
    slug: "croissant-oreo",
    category_slug: "croissants",
    description: "Белая сливочная глазурь с хрустящей крошкой печенья Орео.",
    price: 2300,
    weight: "1 шт",
    is_gluten_free: 0,
    is_bestseller: 0,
    is_preorder: 0,
    is_new: 0,
    image_url: "/images/products/croissant-oreo.jpg",
    order: 7
  },
  {
    name: "Круассан ванильно-малиновый",
    slug: "croissant-vanilla-raspberry",
    category_slug: "croissants",
    description: "Гармоничное сочетание мадагаскарской ванили и яркой ягодной малины.",
    price: 2300,
    weight: "1 шт",
    is_gluten_free: 0,
    is_bestseller: 0,
    is_preorder: 0,
    is_new: 0,
    image_url: "/images/products/croissant-vanilla-raspberry.jpg",
    order: 8
  },

  // 6. Pastries
  {
    name: "Слойка Ягодный микс",
    slug: "puff-berry-mix",
    category_slug: "pastries",
    description: "Слоеный кармашек с заварным ванильным кремом, свежей малиной, ежевикой и голубикой.",
    price: 4000,
    weight: "1 шт",
    is_gluten_free: 0,
    is_bestseller: 1,
    is_preorder: 0,
    is_new: 0,
    image_url: "/images/products/puff-berry-mix.jpg",
    order: 1
  },
  {
    name: "Крем-корзинка с голубикой",
    slug: "cream-basket-blueberry",
    category_slug: "pastries",
    description: "Хрустящая слоеная корзинка, сливочный заварной крем и щедрая шапка отборной голубики.",
    price: 3500,
    weight: "1 шт",
    is_gluten_free: 0,
    is_bestseller: 1,
    is_preorder: 0,
    is_new: 0,
    image_url: "/images/products/cream-basket-blueberry.jpg",
    order: 2
  },
  {
    name: "Слойка клубника-ваниль",
    slug: "puff-strawberry-vanilla",
    category_slug: "pastries",
    description: "Свежая спелая клубника на подушке из ванильного крема в слоеном тесте.",
    price: 2800,
    weight: "1 шт",
    is_gluten_free: 0,
    is_bestseller: 0,
    is_preorder: 0,
    is_new: 0,
    image_url: "/images/products/puff-strawberry-vanilla.jpg",
    order: 3
  },
  {
    name: "Слойка с яблоком",
    slug: "puff-apple",
    category_slug: "pastries",
    description: "Карамелизированные сочные яблоки с корицей и миндальными лепестками.",
    price: 2500,
    weight: "1 шт",
    is_gluten_free: 0,
    is_bestseller: 0,
    is_preorder: 0,
    is_new: 0,
    image_url: "/images/products/puff-apple.jpg",
    order: 4
  },
  {
    name: "Слойка с моцареллой",
    slug: "puff-mozzarella",
    category_slug: "pastries",
    description: "Несладкая выпечка: сыр моцарелла, томаты черри, соус песто на слоеном тесте.",
    price: 2400,
    weight: "1 шт",
    is_gluten_free: 0,
    is_bestseller: 0,
    is_preorder: 0,
    is_new: 0,
    image_url: "/images/products/puff-mozzarella.jpg",
    order: 5
  },
  {
    name: "Слойка банан-миндаль",
    slug: "puff-banana-almond",
    category_slug: "pastries",
    description: "Хрустящий твист с начинкой из банана и миндального крема.",
    price: 1900,
    weight: "1 шт",
    is_gluten_free: 0,
    is_bestseller: 0,
    is_preorder: 0,
    is_new: 0,
    image_url: "/images/products/puff-banana-almond.jpg",
    order: 6
  },

  // 7. Cheesecakes
  {
    name: "Испанский шоколадный чизкейк",
    slug: "cheesecake-spanish-chocolate",
    category_slug: "cheesecakes",
    description: "Сыр, сливки, темный бельгийский шоколад, тающая текстура. Без глютена (Gluten Free).",
    price: 3700,
    weight: "1 порция",
    is_gluten_free: 1,
    is_bestseller: 1,
    is_preorder: 0,
    is_new: 0,
    image_url: "/images/products/cheesecake-spanish-chocolate.jpg",
    order: 1
  },
  {
    name: "Испанский классический чизкейк",
    slug: "cheesecake-spanish-classic",
    category_slug: "cheesecakes",
    description: "Сыр, сливки, аппетитная запеченная корочка, нежный сливочный центр.",
    price: 3800,
    weight: "1 порция",
    is_gluten_free: 0,
    is_bestseller: 1,
    is_preorder: 0,
    is_new: 0,
    image_url: "/images/products/cheesecake-spanish-classic.jpg",
    order: 2
  },
  {
    name: "Испанский фисташковый чизкейк",
    slug: "cheesecake-spanish-pistachio",
    category_slug: "cheesecakes",
    description: "Сыр, сливки, натуральное фисташковое пралине. Без глютена (Gluten Free).",
    price: 3900,
    weight: "1 порция",
    is_gluten_free: 1,
    is_bestseller: 1,
    is_preorder: 0,
    is_new: 0,
    image_url: "/images/products/cheesecake-spanish-pistachio.jpg",
    order: 3
  },
  {
    name: "Чизкейк тирамису",
    slug: "cheesecake-tiramisu",
    category_slug: "cheesecakes",
    description: "Кофейно-шоколадная основа, сырный слой с маскарпоне и какао.",
    price: 3900,
    weight: "1 порция",
    is_gluten_free: 0,
    is_bestseller: 0,
    is_preorder: 0,
    is_new: 0,
    image_url: "/images/products/cheesecake-tiramisu.jpg",
    order: 4
  },

  // 8. Pastry Sets
  {
    name: "Набор мини-выпечки",
    slug: "set-mini-pastry",
    category_slug: "pastry-sets",
    description: "5 видов мини-слоек (малина, клубника, корица, банан, миндаль, персик) и 3 вида мини-круассанов (2 классических и 1 шоколадный).",
    price: 7500,
    weight: "Подарочный бокс",
    is_gluten_free: 0,
    is_bestseller: 1,
    is_preorder: 1,
    is_new: 0,
    image_url: "/images/products/set-mini-pastry.jpg",
    order: 1
  },
  {
    name: "Набор мини-круассанов",
    slug: "set-mini-croissants",
    category_slug: "pastry-sets",
    description: "4 мини-классических круассана, 2 мини-круассана малина, 2 мини-круассана карамель.",
    price: 7000,
    weight: "8 шт",
    is_gluten_free: 0,
    is_bestseller: 1,
    is_preorder: 1,
    is_new: 0,
    image_url: "/images/products/set-mini-croissants.jpg",
    order: 2
  },

  // 9. National & Luxury Heritage
  {
    name: "Десерт Асық",
    slug: "dessert-asyk",
    category_slug: "national-luxury",
    description: "Мусс на основе балқаймақ и топлёного молока, конфи из вяленого чернослива, крамбл с карамелизированным тары и сары ірімшік, бисквит на основе талқан и миндальной муки.",
    price: 4200,
    weight: "1 шт",
    is_gluten_free: 0,
    is_bestseller: 1,
    is_preorder: 0,
    is_new: 0,
    image_url: "/images/products/dessert-asyk.jpg",
    order: 1
  },
  {
    name: "Набор трюфелей «Дара»",
    slug: "truffles-dara",
    category_slug: "national-luxury",
    description: "Темный шоколад с куртом и кунжутом; Карамелизированный тары в шоколаде руби; Чернослив в молочном шоколаде; Карамелизированный шоколад с вяленым ірімшік и клюквой.",
    price: 5500,
    weight: "4 шт",
    is_gluten_free: 0,
    is_bestseller: 1,
    is_preorder: 0,
    is_new: 0,
    image_url: "/images/products/truffles-dara.jpg",
    order: 2
  },
  {
    name: "Набор корпусных конфет «Тұмар»",
    slug: "sweets-tumar",
    category_slug: "national-luxury",
    description: "Темный шоколад с орехами и сублимированным жидек и тары; Шоколад с карамелью на основе саумал со степными травами; Жент в шоколаде.",
    price: 8000,
    weight: "Подарочный бокс",
    is_gluten_free: 0,
    is_bestseller: 1,
    is_preorder: 0,
    is_new: 0,
    image_url: "/images/products/sweets-tumar.jpg",
    order: 3
  },
  {
    name: "Набор корпусных десертов «Фрукты»",
    slug: "set-fruit-desserts",
    category_slug: "national-luxury",
    description: "5 шт: Черника (йогуртовый ганаш, черничная начинка), Яблоко (сливочный ганаш, яблоко с корицей), Клубника (сливочный ганаш, клубничная начинка), Банан (банановый ганаш, банановая карамель), Манго (ганаш манго-кокос).",
    price: 6500,
    weight: "5 шт",
    is_gluten_free: 0,
    is_bestseller: 1,
    is_preorder: 0,
    is_new: 0,
    image_url: "/images/products/set-fruit-desserts.jpg",
    order: 4
  },
  {
    name: "Набор корпусных десертов «Орехи»",
    slug: "set-nut-desserts",
    category_slug: "national-luxury",
    description: "10 шт: Фисташка (фисташковый ганаш, хрустящий слой), Миндаль (миндальный ганаш, карамель с миндалём), Кешью (ганаш и начинка), Арахис (арахисовый ганаш), Фундук (взбитый ганаш с пастой фундука).",
    price: 7000,
    weight: "10 шт",
    is_gluten_free: 0,
    is_bestseller: 1,
    is_preorder: 0,
    is_new: 0,
    image_url: "/images/products/set-nut-desserts.jpg",
    order: 5
  },

  // 10. Vegan line (Je Vie)
  {
    name: "Je Vie Truffles",
    slug: "jevie-truffles",
    category_slug: "vegan-je-vie",
    description: "Веган трюфели ручной работы: малиновое пралине, брауни, кокос, crunch. Без сахара, глютена, усилителей вкуса, лактозы.",
    price: 5000,
    weight: "1 набор",
    is_gluten_free: 1,
    is_bestseller: 0,
    is_preorder: 0,
    is_new: 0,
    image_url: "/images/products/jevie-truffles.jpg",
    order: 1
  },
  {
    name: "Je Vie Choco Bombs",
    slug: "jevie-choco-bombs",
    category_slug: "vegan-je-vie",
    description: "Карамель и орехи, фундук, арахис в темном шоколаде без рафинированного сахара.",
    price: 6500,
    weight: "1 набор",
    is_gluten_free: 1,
    is_bestseller: 0,
    is_preorder: 0,
    is_new: 0,
    image_url: "/images/products/jevie-choco-bombs.jpg",
    order: 2
  },
  {
    name: "Безглютеновое печенье Je Vie",
    slug: "jevie-cookies",
    category_slug: "vegan-je-vie",
    description: "Овсяное с арахисом и шоколадом. Нежнейшая текстура, натуральные ингредиенты.",
    price: 1400,
    weight: "1 шт",
    is_gluten_free: 1,
    is_bestseller: 0,
    is_preorder: 0,
    is_new: 0,
    image_url: "/images/products/jevie-cookies.jpg",
    order: 3
  },
  {
    name: "Гранола классика Je Vie",
    slug: "jevie-granola-classic",
    category_slug: "vegan-je-vie",
    description: "Овсяные хлопья, орехи, горный мед и сушеные ягоды.",
    price: 4500,
    weight: "350 г",
    is_gluten_free: 1,
    is_bestseller: 0,
    is_preorder: 0,
    is_new: 0,
    image_url: "/images/products/jevie-granola-classic.jpg",
    order: 4
  },
  {
    name: "Шоколадная гранола Je Vie",
    slug: "jevie-granola-choco",
    category_slug: "vegan-je-vie",
    description: "Овсяные хлопья, орехи, натуральный мед и сырое какао.",
    price: 4600,
    weight: "350 г",
    is_gluten_free: 1,
    is_bestseller: 0,
    is_preorder: 0,
    is_new: 0,
    image_url: "/images/products/jevie-granola-choco.jpg",
    order: 5
  },
  {
    name: "Набор: Truffles + Protein Bars",
    slug: "jevie-truffles-protein",
    category_slug: "vegan-je-vie",
    description: "Орехи, чистый шоколад, гороховый протеин и пророщенная зеленая гречка.",
    price: 8500,
    weight: "Подарочный бокс",
    is_gluten_free: 1,
    is_bestseller: 1,
    is_preorder: 0,
    is_new: 0,
    image_url: "/images/products/jevie-choco-box.jpg",
    order: 6
  },

  // 11. Signature Bar
  {
    name: "Merci, D.",
    slug: "drink-merci-d",
    category_slug: "signature-bar",
    description: "Особый напиток, посвященный основательнице кондитерской Дане Канапиной. Воздушное пюре малины и юдзу, лимонный кордиал, чай анчан, кунжут.",
    price: 2600,
    weight: "400 мл",
    is_gluten_free: 1,
    is_bestseller: 1,
    is_preorder: 0,
    is_new: 0,
    image_url: "/images/products/merci-d-drink.jpg",
    order: 1
  },
  {
    name: "Круассан-сэндвич La Crème",
    slug: "food-croissant-sandwich",
    category_slug: "signature-bar",
    description: "Свежевыпеченный круассан, слабосоленая форель, сливочный крем-мусс, свежий шпинат, яйцо пашот, томаты и огурцы.",
    price: 4700,
    weight: "320 г",
    is_gluten_free: 0,
    is_bestseller: 1,
    is_preorder: 0,
    is_new: 0,
    image_url: "/images/products/croissant-sandwich-hero.jpg",
    order: 2
  }
];

const insertProd = db.prepare(`
  INSERT INTO products (
    slug, category_id, name, description, price, weight,
    is_gluten_free, is_bestseller, is_preorder, is_new, image_url, display_order
  ) VALUES (
    @slug, @category_id, @name, @description, @price, @weight,
    @is_gluten_free, @is_bestseller, @is_preorder, @is_new, @image_url, @order
  )
`);

for (const prod of products) {
  const catId = catMap[prod.category_slug];
  if (!catId) {
    console.error(`Unknown category ${prod.category_slug} for product ${prod.name}`);
    continue;
  }
  insertProd.run({
    ...prod,
    category_id: catId
  });
}

// Time Slots
const slots = [
  { label: "10:00 - 12:00", max: 5, order: 1 },
  { label: "12:00 - 14:00", max: 6, order: 2 },
  { label: "14:00 - 16:00", max: 6, order: 3 },
  { label: "16:00 - 18:00", max: 6, order: 4 },
  { label: "18:00 - 20:00", max: 6, order: 5 },
  { label: "20:00 - 21:30", max: 4, order: 6 }
];

const insertSlot = db.prepare(`
  INSERT INTO time_slots (slot_label, max_orders, is_active, display_order)
  VALUES (@label, @max, 1, @order)
`);

for (const s of slots) {
  insertSlot.run(s);
}

// Schedule Settings
const insertSched = db.prepare(`
  INSERT INTO schedule_settings (key, value) VALUES (?, ?)
`);
insertSched.run("min_lead_time_hours", "3");
insertSched.run("preorder_lead_time_days", "1");
insertSched.run("max_booking_horizon_days", "30");
insertSched.run("is_orders_enabled", "true");
insertSched.run("closed_days", "[]"); // JSON array of dates YYYY-MM-DD
insertSched.run("business_hours_start", "09:00");
insertSched.run("business_hours_end", "22:00");

// Site Settings
const insertSetting = db.prepare(`
  INSERT INTO site_settings (key, value) VALUES (?, ?)
`);
insertSetting.run("site_name", "La Crème Boutique Patisserie");
insertSetting.run("city", "Астана, Казахстан");
insertSetting.run("address", "г. Астана, ул. Достык, 16 (Talan Towers)");
insertSetting.run("phone", "+7 (701) 000-20-16");
insertSetting.run("phone_clean", "+77010002016");
insertSetting.run("instagram", "https://www.instagram.com/la_creme_astana/");
insertSetting.run("work_hours", "Ежедневно с 09:00 до 22:00");
insertSetting.run("currency", "₸");
insertSetting.run("telegram_bot_token", process.env.TELEGRAM_BOT_TOKEN || "");
insertSetting.run("telegram_chat_id", process.env.TELEGRAM_CHAT_ID || "");

// Admin User (Default: admin / lacreme2026)
// Using sha256 with salt for security
const salt = "lacreme_astana_salt";
const defaultHash = crypto.createHash("sha256").update("lacreme2026" + salt).digest("hex");

const insertAdmin = db.prepare(`
  INSERT INTO admin_users (username, password_hash, name, role)
  VALUES (?, ?, ?, ?)
`);
insertAdmin.run("admin", defaultHash, "Главный Администратор La Crème", "owner");
insertAdmin.run("patissier", defaultHash, "Шеф-кондитер", "staff");

console.log(`Seeding complete: ${categories.length} categories, ${products.length} authentic products seeded!`);
