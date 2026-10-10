// AUTO-GENERATED. Single source of truth for product image resolution.
export function slugify(input) {
  const value = typeof input === 'string' ? input : '';
  return value
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/^-+|-+$/g, '') || 'product';
}

const DEAD_HOST = /(picsum\.photos|loremflickr\.com|via\.placeholder\.com|placehold\.it|placeimg\.com|unsplash\.com)/i;

const PRODUCT_SLUGS = new Set(['nova-x5-5g-8gb-128gb', 'zenix-lite-4g-4gb-64gb', 'pixelo-pro-ultra-5g-12gb-256gb', 'aurea-smart-v2-5g-6gb-128gb', 'nova-mini-5g-6gb-64gb', 'pixelo-book-14-ryzen-5-16gb-512gb-ssd', 'zenix-studio-pro-15-core-i7-32gb-1tb-ssd', 'nova-student-air-15-core-i3-8gb-256gb-ssd', 'aurea-gaming-x-ryzen-7-16gb-1tb-ssd', 'lumo-convertible-360-touch-12gb-512gb-ssd', 'aurea-bass-pro-wireless-headphones', 'lumo-mini-bluetooth-speaker-10w', 'zenix-pods-true-wireless-earbuds', 'pixelo-soundbar-120w-with-subwoofer', 'nova-neckband-pro-magnetic', 'nova-fit-band-3', 'zenix-watch-s2-amoled', 'aurea-tough-rugged-outdoor-watch', 'pixelo-elegance-smartwatch', 'lumo-active-kids-smart-tracker', 'breeze-3-speed-ceiling-fan', 'coolmax-room-heater-2000w', 'aqua-pure-water-purifier-ro-uv', 'pureair-hepa-air-purifier', 'streamiron-1500w-steam-iron', 'whirl-750w-mixer-grinder-3-jars', 'crispair-air-fryer-4l-digital', 'steamy-rice-cooker-1-8l', 'toastmaster-2-slice-pop-up-toaster', 'kaveri-electric-kettle-1-5l', 'lumo-led-table-lamp-dimmable', 'aurea-wall-clock-silent-sweep', 'ceramic-flower-vase-set-of-3', 'boho-cotton-macrame-wall-hanging', 'abstract-canvas-wall-art-frame-3-piece', 'ergofit-office-chair-ergonomic-mesh', 'kaveri-wooden-study-table-desk', 'compact-3-shelf-wooden-bookrack', 'foldable-metal-laptop-stand-bed-desk', 'comfy-bean-bag-chair-xxxl-with-beans', 'matte-velvet-lipstick-set-of-4', 'smudge-proof-intense-waterproof-kajal', 'hydrating-compact-face-powder-spf-20', 'full-coverage-liquid-foundation-30ml', 'professional-12-piece-makeup-brush-set', 'aurea-eau-de-parfum-gold-50ml', 'zenix-ocean-sport-body-spray-150ml', 'lumo-midnight-deodorant-stick-75g', 'nova-wood-and-spice-cologne-100ml', 'blossom-fresh-pocket-perfume-spray-20ml', 'trimmer-pro-2000-precision-beard-trimmer', 'ionic-hair-dryer-1800w-quick-dry', 'sonic-electric-toothbrush-smart-timer', 'keratin-hair-straightener-brush', 'rechargeable-body-groomer-waterproof', 'a4-ruled-notebook-200-pages-pack-of-5', 'gel-pen-smooth-write-0-5mm-set-of-10', 'metal-zipper-pencil-box-organizer-set', 'permanent-marker-chisel-tip-set-of-4', 'sticky-notes-colorful-pad-400-sheets', 'beginner-s-guide-to-python-programming', 'data-structures-made-easy-2nd-edition', 'the-mindful-leader-strategies-for-growth', 'modern-web-design-principles-2026', 'chronicles-of-the-starlight-realm', 'building-blocks-creative-set-200-pcs', 'remote-control-stunt-car-360-rotation', 'magnetic-chess-board-wooden-folding-set', 'plush-soft-teddy-bear-40cm', 'strategy-board-game-empire-builders']);
const CATEGORY_SLUGS = new Set(['mobiles', 'laptops', 'headphones-and-audio', 'smartwatches', 'home-appliances', 'kitchen-appliances', 'home-decor', 'furniture', 'beauty-and-makeup', 'fragrance', 'personal-care', 'stationery', 'books', 'toys-and-games']);

export function productImageUrl(product) {
  if (!product) return '/images/placeholders/generic.svg';
  const raw = product.image || product.imageUrl;
  const value = typeof raw === 'string' ? raw.trim() : '';
  if (value.startsWith('/images/')) return value;
  if (/^https?:\/\//i.test(value) && !DEAD_HOST.test(value)) return value;
  const slug = slugify(product.name);
  if (PRODUCT_SLUGS.has(slug)) return '/images/products/' + slug + '.svg';
  return categoryImage(product.category);
}

export function categoryImage(category) {
  const slug = slugify(category);
  if (CATEGORY_SLUGS.has(slug)) return '/images/placeholders/' + slug + '.svg';
  return '/images/placeholders/generic.svg';
}

export default productImageUrl;