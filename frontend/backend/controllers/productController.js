const db = require('../db/database');

const VALID_CATEGORIES = [
  "Mobiles", "Laptops", "Headphones & Audio", "Smartwatches",
  "Home Appliances", "Kitchen Appliances", "Home Decor", "Furniture",
  "Beauty & Makeup", "Fragrance", "Personal Care", "Stationery",
  "Books", "Toys & Games"
];

// GET /api/products
exports.getProducts = (req, res, next) => {
  try {
    const { search, category, sort, minPrice, maxPrice, minDiscount } = req.query;

    let sql = `SELECT * FROM products WHERE 1=1`;
    const params = [];

    if (search && search.trim()) {
      const term = `%${search.trim().toLowerCase()}%`;
      sql += ` AND (LOWER(name) LIKE ? OR LOWER(category) LIKE ? OR LOWER(description) LIKE ?)`;
      params.push(term, term, term);
    }

    if (category && category.trim() && category.trim() !== 'all') {
      sql += ` AND category = ?`;
      params.push(category.trim());
    }

    if (minPrice && !isNaN(minPrice)) {
      sql += ` AND price >= ?`;
      params.push(Number(minPrice));
    }

    if (maxPrice && !isNaN(maxPrice)) {
      sql += ` AND price <= ?`;
      params.push(Number(maxPrice));
    }

    if (minDiscount && !isNaN(minDiscount)) {
      sql += ` AND discount_percentage >= ?`;
      params.push(Number(minDiscount));
    }

    // Sorting
    switch (sort) {
      case 'price_asc':
        sql += ` ORDER BY price ASC`;
        break;
      case 'price_desc':
        sql += ` ORDER BY price DESC`;
        break;
      case 'discount':
        sql += ` ORDER BY discount_percentage DESC`;
        break;
      case 'rating':
        sql += ` ORDER BY rating DESC, rating_count DESC`;
        break;
      default:
        sql += ` ORDER BY id DESC`;
        break;
    }

    const products = db.prepare(sql).all(...params);
    return res.status(200).json({ products, count: products.length, categories: VALID_CATEGORIES });
  } catch (err) {
    next(err);
  }
};

// GET /api/products/:id
exports.getProductById = (req, res, next) => {
  try {
    const { id } = req.params;
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Fetch similar products in same category
    const similarProducts = db.prepare(
      'SELECT * FROM products WHERE category = ? AND id != ? LIMIT 6'
    ).all(product.category, product.id);

    return res.status(200).json({ product, similarProducts });
  } catch (err) {
    next(err);
  }
};

// POST /api/products (SELLER ONLY)
exports.createProduct = (req, res, next) => {
  try {
    const { name, category, description, price, original_price, stock, image } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Product name is required.' });
    }

    if (!category || !VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({ message: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}` });
    }

    const sellingPrice = Number(price);
    const origPrice = Number(original_price || price);
    const stockVal = Number(stock);

    if (isNaN(sellingPrice) || sellingPrice <= 0) {
      return res.status(400).json({ message: 'Price must be a positive number.' });
    }

    if (isNaN(origPrice) || origPrice < sellingPrice) {
      return res.status(400).json({ message: 'Original price must be greater than or equal to selling price.' });
    }

    if (isNaN(stockVal) || stockVal < 0 || !Number.isInteger(stockVal)) {
      return res.status(400).json({ message: 'Stock must be a non-negative integer.' });
    }

    const discount = Math.round(((origPrice - sellingPrice) / origPrice) * 100);
    const imgUrl = image && image.trim() ? image.trim() : '/images/placeholders/generic.svg';

    const result = db.prepare(`
      INSERT INTO products (name, category, description, price, original_price, discount_percentage, stock, image)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(name.trim(), category, description || '', sellingPrice, origPrice, discount, stockVal, imgUrl);

    const newProduct = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);
    return res.status(201).json({ message: 'Product created successfully', product: newProduct });
  } catch (err) {
    next(err);
  }
};

// PUT /api/products/:id (SELLER ONLY)
exports.updateProduct = (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(id);

    if (!existing) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const { name, category, description, price, original_price, stock, image } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Product name is required.' });
    }

    if (!category || !VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({ message: 'Invalid category selection.' });
    }

    const sellingPrice = Number(price);
    const origPrice = Number(original_price || price);
    const stockVal = Number(stock);

    if (isNaN(sellingPrice) || sellingPrice <= 0) {
      return res.status(400).json({ message: 'Price must be a positive number.' });
    }

    if (isNaN(origPrice) || origPrice < sellingPrice) {
      return res.status(400).json({ message: 'Original price must be greater than or equal to selling price.' });
    }

    if (isNaN(stockVal) || stockVal < 0 || !Number.isInteger(stockVal)) {
      return res.status(400).json({ message: 'Stock must be a non-negative integer.' });
    }

    const discount = Math.round(((origPrice - sellingPrice) / origPrice) * 100);
    const imgUrl = image && image.trim() ? image.trim() : existing.image;

    db.prepare(`
      UPDATE products
      SET name = ?, category = ?, description = ?, price = ?, original_price = ?, discount_percentage = ?, stock = ?, image = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(name.trim(), category, description || '', sellingPrice, origPrice, discount, stockVal, imgUrl, id);

    const updatedProduct = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    return res.status(200).json({ message: 'Product updated successfully', product: updatedProduct });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/products/:id (SELLER ONLY)
exports.deleteProduct = (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT id FROM products WHERE id = ?').get(id);

    if (!existing) {
      return res.status(404).json({ message: 'Product not found' });
    }

    db.prepare('DELETE FROM products WHERE id = ?').run(id);
    return res.status(200).json({ message: 'Product deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/products/:id/stock (SELLER ONLY)
exports.updateStock = (req, res, next) => {
  try {
    const { id } = req.params;
    const { stock } = req.body;

    const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const stockVal = Number(stock);
    if (isNaN(stockVal) || stockVal < 0 || !Number.isInteger(stockVal)) {
      return res.status(400).json({ message: 'Stock must be a non-negative integer.' });
    }

    db.prepare('UPDATE products SET stock = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(stockVal, id);
    const updated = db.prepare('SELECT * FROM products WHERE id = ?').get(id);

    return res.status(200).json({ message: 'Stock updated successfully', product: updated });
  } catch (err) {
    next(err);
  }
};
