const bcrypt = require('bcryptjs');
const db = require('./database');

function seedUsers() {
  const buyerEmail = 'buyer@vivimart.com';
  const sellerEmail = 'seller@vivimart.com';

  const buyerExists = db.prepare('SELECT id FROM users WHERE email = ?').get(buyerEmail);
  if (!buyerExists) {
    const buyerHash = bcrypt.hashSync('buyer123', 10);
    db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run(
      'Demo Buyer',
      buyerEmail,
      buyerHash,
      'BUYER'
    );
    console.log('Seeded demo buyer account: buyer@vivimart.com / buyer123');
  }

  const sellerExists = db.prepare('SELECT id FROM users WHERE email = ?').get(sellerEmail);
  if (!sellerExists) {
    const sellerHash = bcrypt.hashSync('seller123', 10);
    db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run(
      'Demo Seller',
      sellerEmail,
      sellerHash,
      'SELLER'
    );
    console.log('Seeded demo seller account: seller@vivimart.com / seller123');
  }
}

function seedProducts() {
  const count = db.prepare('SELECT COUNT(*) as cnt FROM products').get().cnt;
  if (count > 0) {
    return; // Products already seeded
  }

  const rawProducts = [
    // 1. Mobiles - smartphone/mobiles
    { name: "Nova X5 5G (8GB/128GB)", category: "Mobiles", description: "Flagship performance mobile phone with 120Hz AMOLED Display, 50MP Sony Sensor, and 5000mAh Battery.", price: 18999, original_price: 24999, stock: 45, rating: 4.6, rating_count: 320, image: "/images/products/nova-x5-5g-8gb-128gb.svg" },
    { name: "Zenix Lite 4G (4GB/64GB)", category: "Mobiles", description: "Budget friendly smartphone with long lasting 6000mAh battery and HD+ display.", price: 7499, original_price: 9999, stock: 5, rating: 4.1, rating_count: 150, image: "/images/products/zenix-lite-4g-4gb-64gb.svg" },
    { name: "Pixelo Pro Ultra 5G (12GB/256GB)", category: "Mobiles", description: "Ultimate camera smartphone with 108MP quad camera system and 67W Turbo Flash Charging.", price: 34999, original_price: 42999, stock: 25, rating: 4.8, rating_count: 480, image: "/images/products/pixelo-pro-ultra-5g-12gb-256gb.svg" },
    { name: "Aurea Smart V2 5G (6GB/128GB)", category: "Mobiles", description: "Sleek glass back design smartphone with Octa-core processor and dual stereo speakers.", price: 13999, original_price: 17999, stock: 0, rating: 4.3, rating_count: 95, image: "/images/products/aurea-smart-v2-5g-6gb-128gb.svg" },
    { name: "Nova Mini 5G (6GB/64GB)", category: "Mobiles", description: "Compact power packed smartphone designed for easy single-hand operation.", price: 11999, original_price: 14999, stock: 8, rating: 4.2, rating_count: 110, image: "/images/products/nova-mini-5g-6gb-64gb.svg" },

    // 2. Laptops - laptop
    { name: "Pixelo Book 14 (Ryzen 5, 16GB, 512GB SSD)", category: "Laptops", description: "Ultra-thin aluminum laptop with backlit keyboard, 14-inch Full HD screen, and 12-hour battery life.", price: 42999, original_price: 54999, stock: 30, rating: 4.7, rating_count: 210, image: "/images/products/pixelo-book-14-ryzen-5-16gb-512gb-ssd.svg" },
    { name: "Zenix Studio Pro 15 (Core i7, 32GB, 1TB SSD)", category: "Laptops", description: "High performance creator laptop with 4K OLED display and dedicated graphics acceleration.", price: 84999, original_price: 99999, stock: 12, rating: 4.9, rating_count: 140, image: "/images/products/zenix-studio-pro-15-core-i7-32gb-1tb-ssd.svg" },
    { name: "Nova Student Air 15 (Core i3, 8GB, 256GB SSD)", category: "Laptops", description: "Lightweight study and work laptop with HD webcam and quiet cooling fans.", price: 28999, original_price: 34999, stock: 4, rating: 4.0, rating_count: 75, image: "/images/products/nova-student-air-15-core-i3-8gb-256gb-ssd.svg" },
    { name: "Aurea Gaming X (Ryzen 7, 16GB, 1TB SSD)", category: "Laptops", description: "High refresh rate 165Hz gaming laptop with RGB keyboard and dual-fan cooling system.", price: 68999, original_price: 82999, stock: 0, rating: 4.6, rating_count: 185, image: "/images/products/aurea-gaming-x-ryzen-7-16gb-1tb-ssd.svg" },
    { name: "Lumo Convertible 360 Touch (12GB, 512GB SSD)", category: "Laptops", description: "2-in-1 touchscreen laptop tablet with pressure-sensitive stylus included.", price: 49999, original_price: 61999, stock: 18, rating: 4.4, rating_count: 90, image: "/images/products/lumo-convertible-360-touch-12gb-512gb-ssd.svg" },

    // 3. Headphones & Audio - distinct per product
    { name: "Aurea Bass Pro Wireless Headphones", category: "Headphones & Audio", description: "Active Noise Cancelling over-ear headphones with 40-hour playback and deep bass drivers.", price: 2999, original_price: 5999, stock: 65, rating: 4.5, rating_count: 520, image: "/images/products/aurea-bass-pro-wireless-headphones.svg" },
    { name: "Lumo Mini Bluetooth Speaker 10W", category: "Headphones & Audio", description: "IPX7 waterproof portable Bluetooth speaker with punchy bass and 12-hour playtime.", price: 1299, original_price: 2499, stock: 90, rating: 4.3, rating_count: 310, image: "/images/products/lumo-mini-bluetooth-speaker-10w.svg" },
    { name: "Zenix Pods True Wireless Earbuds", category: "Headphones & Audio", description: "TWS earbuds with low latency gaming mode, quad mic clear calls, and Type-C fast charging.", price: 1499, original_price: 2999, stock: 6, rating: 4.2, rating_count: 280, image: "/images/products/zenix-pods-true-wireless-earbuds.svg" },
    { name: "Pixelo Soundbar 120W with Subwoofer", category: "Headphones & Audio", description: "Cinematic home theater soundbar with 2.1 channel surround sound and HDMI ARC connectivity.", price: 5499, original_price: 9999, stock: 15, rating: 4.6, rating_count: 175, image: "/images/products/pixelo-soundbar-120w-with-subwoofer.svg" },
    { name: "Nova Neckband Pro Magnetic", category: "Headphones & Audio", description: "Flexible silicone neckband with magnetic earbuds and 30-hour continuous audio playback.", price: 899, original_price: 1799, stock: 40, rating: 4.0, rating_count: 140, image: "/images/products/nova-neckband-pro-magnetic.svg" },

    // 4. Smartwatches
    { name: "Nova Fit Band 3", category: "Smartwatches", description: "Fitness tracker with 1.47-inch AMOLED screen, SpO2 monitoring, and 14 days battery life.", price: 1799, original_price: 3499, stock: 50, rating: 4.3, rating_count: 230, image: "/images/products/nova-fit-band-3.svg" },
    { name: "Zenix Watch S2 AMOLED", category: "Smartwatches", description: "Premium bluetooth calling smartwatch with metallic casing, 100+ sports modes, and sleep monitor.", price: 2999, original_price: 5999, stock: 3, rating: 4.5, rating_count: 410, image: "/images/products/zenix-watch-s2-amoled.svg" },
    { name: "Aurea Tough Rugged Outdoor Watch", category: "Smartwatches", description: "Military grade shock resistant GPS smartwatch with compass and altitude sensor.", price: 4499, original_price: 7999, stock: 20, rating: 4.7, rating_count: 160, image: "/images/products/aurea-tough-rugged-outdoor-watch.svg" },
    { name: "Pixelo Elegance Smartwatch", category: "Smartwatches", description: "Rose gold stainless steel smartwatch with customizable watch faces and female health tracking.", price: 3299, original_price: 4999, stock: 12, rating: 4.4, rating_count: 95, image: "/images/products/pixelo-elegance-smartwatch.svg" },
    { name: "Lumo Active Kids Smart Tracker", category: "Smartwatches", description: "Safety smartwatch for children featuring SOS button, step counter, and parent control companion app.", price: 1599, original_price: 2799, stock: 0, rating: 4.1, rating_count: 60, image: "/images/products/lumo-active-kids-smart-tracker.svg" },

    // 5. Home Appliances - specific per product
    { name: "Breeze 3-Speed Ceiling Fan", category: "Home Appliances", description: "Energy efficient BLDC motor ceiling fan with remote control and whisper silent air throw.", price: 2799, original_price: 4299, stock: 35, rating: 4.4, rating_count: 190, image: "/images/products/breeze-3-speed-ceiling-fan.svg" },
    { name: "CoolMax Room Heater 2000W", category: "Home Appliances", description: "PTC ceramic heating technology room heater with overheat protection and tilt cut-off switch.", price: 1899, original_price: 2999, stock: 7, rating: 4.2, rating_count: 110, image: "/images/products/coolmax-room-heater-2000w.svg" },
    { name: "Aqua Pure Water Purifier RO+UV", category: "Home Appliances", description: "7-stage water purification system with mineral booster and 10 liter storage tank.", price: 8499, original_price: 13999, stock: 22, rating: 4.6, rating_count: 340, image: "/images/products/aqua-pure-water-purifier-ro-uv.svg" },
    { name: "PureAir HEPA Air Purifier", category: "Home Appliances", description: "True HEPA filtration system removing 99.97% allergens, dust, and odours in large rooms.", price: 6999, original_price: 10999, stock: 14, rating: 4.5, rating_count: 85, image: "/images/products/pureair-hepa-air-purifier.svg" },
    { name: "StreamIron 1500W Steam Iron", category: "Home Appliances", description: "Non-stick ceramic soleplate steam iron with vertical steam boost and self-cleaning feature.", price: 1199, original_price: 1999, stock: 45, rating: 4.3, rating_count: 220, image: "/images/products/streamiron-1500w-steam-iron.svg" },

    // 6. Kitchen Appliances
    { name: "Whirl 750W Mixer Grinder 3 Jars", category: "Kitchen Appliances", description: "Heavy duty copper motor mixer grinder with food-grade stainless steel leakproof jars.", price: 2499, original_price: 4499, stock: 55, rating: 4.5, rating_count: 480, image: "/images/products/whirl-750w-mixer-grinder-3-jars.svg" },
    { name: "CrispAir Air Fryer 4L Digital", category: "Kitchen Appliances", description: "Oil-free digital air fryer with 8 preset cooking modes and 360-degree rapid air circulation.", price: 3999, original_price: 7499, stock: 9, rating: 4.7, rating_count: 350, image: "/images/products/crispair-air-fryer-4l-digital.svg" },
    { name: "Steamy Rice Cooker 1.8L", category: "Kitchen Appliances", description: "Automatic electric rice cooker with keep-warm function and anodized aluminum inner bowl.", price: 1699, original_price: 2499, stock: 28, rating: 4.3, rating_count: 130, image: "/images/products/steamy-rice-cooker-1-8l.svg" },
    { name: "ToastMaster 2-Slice Pop-Up Toaster", category: "Kitchen Appliances", description: "Stainless steel toaster with 6 browning control settings, defrost, and removable crumb tray.", price: 1199, original_price: 1899, stock: 60, rating: 4.1, rating_count: 90, image: "/images/products/toastmaster-2-slice-pop-up-toaster.svg" },
    { name: "Kaveri Electric Kettle 1.5L", category: "Kitchen Appliances", description: "Fast boiling cordless stainless steel electric kettle with auto shut-off protection.", price: 799, original_price: 1399, stock: 80, rating: 4.4, rating_count: 640, image: "/images/products/kaveri-electric-kettle-1-5l.svg" },

    // 7. Home Decor
    { name: "Lumo LED Table Lamp Dimmable", category: "Home Decor", description: "Modern minimalist desk lamp with 3 color light modes, touch control, and phone stand.", price: 999, original_price: 1799, stock: 40, rating: 4.5, rating_count: 175, image: "/images/products/lumo-led-table-lamp-dimmable.svg" },
    { name: "Aurea Wall Clock Silent Sweep", category: "Home Decor", description: "12-inch premium wooden frame analog wall clock with non-ticking silent quartz movement.", price: 849, original_price: 1499, stock: 30, rating: 4.2, rating_count: 140, image: "/images/products/aurea-wall-clock-silent-sweep.svg" },
    { name: "Ceramic Flower Vase Set of 3", category: "Home Decor", description: "Handcrafted Nordic ceramic vases for living room tabletops and home decoration.", price: 1299, original_price: 2199, stock: 16, rating: 4.6, rating_count: 80, image: "/images/products/ceramic-flower-vase-set-of-3.svg" },
    { name: "Boho Cotton Macrame Wall Hanging", category: "Home Decor", description: "Handwoven natural cotton thread macrame tapestry wall art for bedroom aesthetic.", price: 699, original_price: 1199, stock: 25, rating: 4.3, rating_count: 105, image: "/images/products/boho-cotton-macrame-wall-hanging.svg" },
    { name: "Abstract Canvas Wall Art Frame 3-Piece", category: "Home Decor", description: "Modern abstract printed canvas wall frames with durable wooden stretchers.", price: 1799, original_price: 3299, stock: 5, rating: 4.4, rating_count: 65, image: "/images/products/abstract-canvas-wall-art-frame-3-piece.svg" },

    // 8. Furniture
    { name: "ErgoFit Office Chair Ergonomic Mesh", category: "Furniture", description: "Ergonomic high-back office chair with lumbar support, adjustable headrest, and 360 swivel.", price: 4999, original_price: 8999, stock: 18, rating: 4.6, rating_count: 290, image: "/images/products/ergofit-office-chair-ergonomic-mesh.svg" },
    { name: "Kaveri Wooden Study Table Desk", category: "Furniture", description: "Solid engineered wood writing desk with built-in storage drawer and cable grommet.", price: 3499, original_price: 5999, stock: 10, rating: 4.3, rating_count: 120, image: "/images/products/kaveri-wooden-study-table-desk.svg" },
    { name: "Compact 3-Shelf Wooden Bookrack", category: "Furniture", description: "Multi-utility storage rack unit suitable for books, shoes, and decor accessories.", price: 1599, original_price: 2799, stock: 35, rating: 4.1, rating_count: 95, image: "/images/products/compact-3-shelf-wooden-bookrack.svg" },
    { name: "Foldable Metal Laptop Stand Bed Desk", category: "Furniture", description: "Portable height adjustable bed tray desk with cooling fan slot and cup holder.", price: 899, original_price: 1599, stock: 50, rating: 4.2, rating_count: 210, image: "/images/products/foldable-metal-laptop-stand-bed-desk.svg" },
    { name: "Comfy Bean Bag Chair XXXL with Beans", category: "Furniture", description: "Soft faux leather bean bag sofa with double stitched seams and inner safety zip.", price: 2199, original_price: 3999, stock: 7, rating: 4.5, rating_count: 310, image: "/images/products/comfy-bean-bag-chair-xxxl-with-beans.svg" },

    // 9. Beauty & Makeup - specific per product
    { name: "Matte Velvet Lipstick Set of 4", category: "Beauty & Makeup", description: "Long-wearing non-drying matte liquid lipsticks enriched with Vitamin E and jojoba oil.", price: 699, original_price: 1299, stock: 70, rating: 4.4, rating_count: 420, image: "/images/products/matte-velvet-lipstick-set-of-4.svg" },
    { name: "Smudge-proof Intense Waterproof Kajal", category: "Beauty & Makeup", description: "24-hour deep black kajal eye pencil infused with aloe vera extract.", price: 249, original_price: 399, stock: 120, rating: 4.5, rating_count: 850, image: "/images/products/smudge-proof-intense-waterproof-kajal.svg" },
    { name: "Hydrating Compact Face Powder SPF 20", category: "Beauty & Makeup", description: "Ultra-fine lightweight compact powder for matte oil control coverage all day.", price: 349, original_price: 599, stock: 45, rating: 4.2, rating_count: 180, image: "/images/products/hydrating-compact-face-powder-spf-20.svg" },
    { name: "Full Coverage Liquid Foundation 30ml", category: "Beauty & Makeup", description: "Blendable natural matte liquid foundation available for warm and cool skin undertones.", price: 599, original_price: 999, stock: 3, rating: 4.3, rating_count: 140, image: "/images/products/full-coverage-liquid-foundation-30ml.svg" },
    { name: "Professional 12-Piece Makeup Brush Set", category: "Beauty & Makeup", description: "Ultra-soft synthetic fiber makeup brushes with durable travel case.", price: 799, original_price: 1499, stock: 25, rating: 4.6, rating_count: 220, image: "/images/products/professional-12-piece-makeup-brush-set.svg" },

    // 10. Fragrance - specific
    { name: "Aurea Eau de Parfum Gold 50ml", category: "Fragrance", description: "Luxurious long-lasting floral oriental perfume with notes of amber, jasmine, and vanilla.", price: 1299, original_price: 2499, stock: 35, rating: 4.6, rating_count: 190, image: "/images/products/aurea-eau-de-parfum-gold-50ml.svg" },
    { name: "Zenix Ocean Sport Body Spray 150ml", category: "Fragrance", description: "Invigorating aquatic deodorant body spray engineered for all-day freshness.", price: 299, original_price: 499, stock: 85, rating: 4.3, rating_count: 310, image: "/images/products/zenix-ocean-sport-body-spray-150ml.svg" },
    { name: "Lumo Midnight Deodorant Stick 75g", category: "Fragrance", description: "Alcohol-free skin friendly deodorant stick providing 48-hour odor defense.", price: 399, original_price: 699, stock: 6, rating: 4.1, rating_count: 90, image: "/images/products/lumo-midnight-deodorant-stick-75g.svg" },
    { name: "Nova Wood & Spice Cologne 100ml", category: "Fragrance", description: "Bold masculine eau de cologne featuring notes of cedarwood, bergamot, and black pepper.", price: 1499, original_price: 2799, stock: 20, rating: 4.5, rating_count: 130, image: "/images/products/nova-wood-and-spice-cologne-100ml.svg" },
    { name: "Blossom Fresh Pocket Perfume Spray 20ml", category: "Fragrance", description: "Travel friendly pocket perfume spray yielding up to 250 fine mist sprays.", price: 149, original_price: 249, stock: 150, rating: 4.0, rating_count: 240, image: "/images/products/blossom-fresh-pocket-perfume-spray-20ml.svg" },

    // 11. Personal Care
    { name: "Trimmer Pro 2000 Precision Beard Trimmer", category: "Personal Care", description: "Cordless stainless steel blade trimmer with 20 length settings and fast USB charging.", price: 1299, original_price: 2299, stock: 40, rating: 4.5, rating_count: 670, image: "/images/products/trimmer-pro-2000-precision-beard-trimmer.svg" },
    { name: "Ionic Hair Dryer 1800W Quick Dry", category: "Personal Care", description: "Professional salon-grade hair dryer with dual speed heat settings and cool shot button.", price: 1499, original_price: 2699, stock: 28, rating: 4.4, rating_count: 310, image: "/images/products/ionic-hair-dryer-1800w-quick-dry.svg" },
    { name: "Sonic Electric Toothbrush Smart Timer", category: "Personal Care", description: "Rechargeable electric toothbrush operating at 40,000 vibrations per minute with 4 brush heads.", price: 1699, original_price: 3299, stock: 9, rating: 4.6, rating_count: 180, image: "/images/products/sonic-electric-toothbrush-smart-timer.svg" },
    { name: "Keratin Hair Straightener Brush", category: "Personal Care", description: "Anti-scald ceramic heating straightening comb with digital temperature control screen.", price: 1199, original_price: 1999, stock: 32, rating: 4.2, rating_count: 140, image: "/images/products/keratin-hair-straightener-brush.svg" },
    { name: "Rechargeable Body Groomer Waterproof", category: "Personal Care", description: "Skin-friendly full body shaver trimmer suitable for wet and dry shower use.", price: 1799, original_price: 2999, stock: 0, rating: 4.3, rating_count: 95, image: "/images/products/rechargeable-body-groomer-waterproof.svg" },

    // 12. Stationery - specific per product (FIXED: was showing wrong images)
    { name: "A4 Ruled Notebook 200 Pages (Pack of 5)", category: "Stationery", description: "Premium 70 GSM smooth white paper spiral notebooks for school, college, and office note taking.", price: 399, original_price: 699, stock: 90, rating: 4.6, rating_count: 420, image: "/images/products/a4-ruled-notebook-200-pages-pack-of-5.svg" },
    { name: "Gel Pen Smooth Write 0.5mm Set of 10", category: "Stationery", description: "Quick dry waterproof Japanese gel ink pens for smudge-free clean handwriting.", price: 199, original_price: 349, stock: 140, rating: 4.5, rating_count: 530, image: "/images/products/gel-pen-smooth-write-0-5mm-set-of-10.svg" },
    { name: "Metal Zipper Pencil Box Organizer Set", category: "Stationery", description: "Durable dual-compartment hard pencil pouch with scale, eraser, and compass kit.", price: 299, original_price: 499, stock: 45, rating: 4.2, rating_count: 110, image: "/images/products/metal-zipper-pencil-box-organizer-set.svg" },
    { name: "Permanent Marker Chisel Tip Set of 4", category: "Stationery", description: "Black, blue, red, green refillable waterproof permanent marker pens for all surfaces.", price: 149, original_price: 249, stock: 75, rating: 4.1, rating_count: 85, image: "/images/products/permanent-marker-chisel-tip-set-of-4.svg" },
    { name: "Sticky Notes Colorful Pad 400 Sheets", category: "Stationery", description: "Self-adhesive vibrant neon sticky notes for desktop reminders and study organization.", price: 129, original_price: 219, stock: 110, rating: 4.4, rating_count: 260, image: "/images/products/sticky-notes-colorful-pad-400-sheets.svg" },

    // 13. Books - specific per product (FIXED: was showing unrelated images)
    { name: "Beginner's Guide to Python Programming", category: "Books", description: "A comprehensive step-by-step programming textbook written by Alex Mercer.", price: 449, original_price: 799, stock: 60, rating: 4.8, rating_count: 890, image: "/images/products/beginner-s-guide-to-python-programming.svg" },
    { name: "Data Structures Made Easy 2nd Edition", category: "Books", description: "Master algorithm design and coding interview questions with clear diagrams by Dr. Elena Vance.", price: 549, original_price: 999, stock: 35, rating: 4.7, rating_count: 650, image: "/images/products/data-structures-made-easy-2nd-edition.svg" },
    { name: "The Mindful Leader: Strategies for Growth", category: "Books", description: "Best-selling self-improvement and business management guide by Robert Sterling.", price: 349, original_price: 599, stock: 50, rating: 4.5, rating_count: 310, image: "/images/products/the-mindful-leader-strategies-for-growth.svg" },
    { name: "Modern Web Design Principles 2026", category: "Books", description: "Learn UI/UX, responsive styling, and modern web application development by Maya Lin.", price: 499, original_price: 849, stock: 5, rating: 4.6, rating_count: 140, image: "/images/products/modern-web-design-principles-2026.svg" },
    { name: "Chronicles of the Starlight Realm", category: "Books", description: "An epic sci-fi fantasy adventure novel by Arthur Pendelton.", price: 299, original_price: 499, stock: 40, rating: 4.3, rating_count: 210, image: "/images/products/chronicles-of-the-starlight-realm.svg" },

    // 14. Toys & Games
    { name: "Building Blocks Creative Set 200 pcs", category: "Toys & Games", description: "Non-toxic ABS plastic interlocking building bricks for developing child creativity.", price: 899, original_price: 1599, stock: 45, rating: 4.6, rating_count: 380, image: "/images/products/building-blocks-creative-set-200-pcs.svg" },
    { name: "Remote Control Stunt Car 360 Rotation", category: "Toys & Games", description: "High-speed rechargeable RC stunt vehicle with LED headlights and shockproof tires.", price: 1299, original_price: 2499, stock: 2, rating: 4.5, rating_count: 290, image: "/images/products/remote-control-stunt-car-360-rotation.svg" },
    { name: "Magnetic Chess Board Wooden Folding Set", category: "Toys & Games", description: "12-inch handcrafted wooden magnetic chessboard with felted game piece bottoms.", price: 799, original_price: 1399, stock: 30, rating: 4.7, rating_count: 175, image: "/images/products/magnetic-chess-board-wooden-folding-set.svg" },
    { name: "Plush Soft Teddy Bear 40cm", category: "Toys & Games", description: "Hypoallergenic washable fluffy teddy bear toy ideal for birthday gifting.", price: 499, original_price: 899, stock: 65, rating: 4.4, rating_count: 190, image: "/images/products/plush-soft-teddy-bear-40cm.svg" },
    { name: "Strategy Board Game Empire Builders", category: "Toys & Games", description: "Engaging 2-6 player strategy tabletop board game for family game nights.", price: 1199, original_price: 1999, stock: 15, rating: 4.8, rating_count: 130, image: "/images/products/strategy-board-game-empire-builders.svg" }
  ];

  const insertStmt = db.prepare(`
    INSERT INTO products (name, category, description, price, original_price, discount_percentage, stock, image, rating, rating_count)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const item of rawProducts) {
    const discount = Math.round(((item.original_price - item.price) / item.original_price) * 100);
    insertStmt.run(
      item.name,
      item.category,
      item.description,
      item.price,
      item.original_price,
      discount,
      item.stock,
      item.image,
      item.rating,
      item.rating_count
    );
  }

  console.log(`Seeded ${rawProducts.length} original ViviMart products across 14 categories with CORRECTED category-relevant images.`);
}

module.exports = { seedUsers, seedProducts };
