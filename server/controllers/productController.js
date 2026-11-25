import Product from '../models/Product.js';
import logActivity from '../utils/logActivity.js';

export async function listProducts(req, res, next) {
  try {
    const filter = {};
    if (req.query.category && req.query.category !== 'All') filter.category = req.query.category;
    if (req.query.featured === 'true') filter.isFeatured = true;
    if (req.query.search) filter.name = { $regex: req.query.search, $options: 'i' };
    const sort = req.query.sort === 'price-asc' ? { price: 1 } : req.query.sort === 'price-desc' ? { price: -1 } : { createdAt: -1 };
    const products = await Product.find(filter).sort(sort);
    res.json({ success: true, data: products, message: 'Products loaded' });
  } catch (error) { next(error); }
}

export async function getProduct(req, res, next) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product, message: 'Product loaded' });
  } catch (error) { next(error); }
}

function productFields(body, image) {
  return {
    name: body.name?.trim(),
    category: body.category,
    price: Number(body.price),
    description: body.description?.trim(),
    sizes: Array.isArray(body.sizes) ? body.sizes : String(body.sizes || '').split(',').map((size) => size.trim()).filter(Boolean),
    stock: Number(body.stock),
    isFeatured: body.isFeatured === true || body.isFeatured === 'true',
    ...(image ? { image: `/uploads/${image.filename}` } : {})
  };
}

export async function createProduct(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'A local product image is required' });
    const product = await Product.create(productFields(req.body, req.file));
    await logActivity({ actor: req.user, action: 'PRODUCT_CREATED', details: `Created ${product.name}`, entityId: product.id });
    res.status(201).json({ success: true, data: product, message: 'Product created' });
  } catch (error) { next(error); }
}

export async function updateProduct(req, res, next) {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, productFields(req.body, req.file), { new: true, runValidators: true });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    await logActivity({ actor: req.user, action: 'PRODUCT_UPDATED', details: `Updated ${product.name}`, entityId: product.id });
    res.json({ success: true, data: product, message: 'Product updated' });
  } catch (error) { next(error); }
}

export async function deleteProduct(req, res, next) {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    await logActivity({ actor: req.user, action: 'PRODUCT_DELETED', details: `Deleted ${product.name}`, entityId: product.id });
    res.json({ success: true, data: { id: product.id }, message: 'Product deleted' });
  } catch (error) { next(error); }
}
