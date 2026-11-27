import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import logActivity from '../utils/logActivity.js';

export async function getCart(req, res, next) {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    res.json({ success: true, data: cart || { items: [] }, message: 'Cart loaded' });
  } catch (error) { next(error); }
}

export async function addToCart(req, res, next) {
  try {
    const { productId, size, color, quantity = 1 } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    const count = Number(quantity);
    if (!size || !product.sizes.includes(size) || !color || !product.colors.includes(color) || !Number.isInteger(count) || count < 1) return res.status(400).json({ success: false, message: 'Select a valid size, color, and quantity' });
    const cart = await Cart.findOneAndUpdate({ user: req.user.id }, { $setOnInsert: { user: req.user.id } }, { new: true, upsert: true });
    const line = cart.items.find((item) => item.product.toString() === productId && item.size === size && item.color === color);
    const productCount = cart.items
      .filter((item) => item.product.toString() === productId)
      .reduce((total, item) => total + item.quantity, 0);
    if (product.stock < count + productCount) return res.status(400).json({ success: false, message: 'Not enough stock available' });
    if (line) line.quantity += count;
    else cart.items.push({ product: productId, size, color, quantity: count });
    await cart.save();
    await logActivity({ actor: req.user, action: 'CART_UPDATED', details: `Added ${product.name} to the bag`, entityId: product.id });
    await cart.populate('items.product');
    res.json({ success: true, data: cart, message: 'Added to bag' });
  } catch (error) { next(error); }
}

export async function updateCartItem(req, res, next) {
  try {
    const quantity = Number(req.body.quantity);
    if (!Number.isInteger(quantity) || quantity < 1) return res.status(400).json({ success: false, message: 'Quantity must be a positive whole number' });
    const cart = await Cart.findOne({ user: req.user.id });
    const item = cart?.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ success: false, message: 'Bag item not found' });
    const product = await Product.findById(item.product);
    const otherProductQuantity = cart.items
      .filter((cartItem) => cartItem.id !== item.id && cartItem.product.toString() === item.product.toString())
      .reduce((total, cartItem) => total + cartItem.quantity, 0);
    if (!product || product.stock < otherProductQuantity + quantity) return res.status(400).json({ success: false, message: 'Not enough stock available' });
    item.quantity = quantity;
    await cart.save();
    await logActivity({ actor: req.user, action: 'CART_UPDATED', details: `Updated a bag item quantity to ${quantity}`, entityId: item.product.toString() });
    await cart.populate('items.product');
    res.json({ success: true, data: cart, message: 'Bag updated' });
  } catch (error) { next(error); }
}

export async function removeCartItem(req, res, next) {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    const item = cart?.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ success: false, message: 'Bag item not found' });
    const productId = item.product.toString();
    cart.items.pull(req.params.itemId);
    await cart.save();
    await logActivity({ actor: req.user, action: 'CART_UPDATED', details: 'Removed an item from the bag', entityId: productId });
    await cart.populate('items.product');
    res.json({ success: true, data: cart, message: 'Item removed' });
  } catch (error) { next(error); }
}
