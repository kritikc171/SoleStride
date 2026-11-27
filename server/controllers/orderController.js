import Cart from '../models/Cart.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import logActivity from '../utils/logActivity.js';

export async function placeOrder(req, res, next) {
  const decremented = [];
  let orderCreated = false;
  try {
    const { fullName, address, city, phone } = req.body;
    if (![fullName, address, city, phone].every((value) => typeof value === 'string' && value.trim())) {
      return res.status(400).json({ success: false, message: 'Complete all shipping details' });
    }
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    if (!cart?.items.length) return res.status(400).json({ success: false, message: 'Your bag is empty' });
    const items = [];
    let totalAmount = 0;
    for (const line of cart.items) {
      const product = line.product && await Product.findById(line.product._id);
      if (!product || product.stock < line.quantity) {
        return res.status(400).json({ success: false, message: `${line.product?.name || 'A product'} is no longer available in that quantity` });
      }
      items.push({ product: product._id, name: product.name, image: product.image, size: line.size, color: line.color || 'Black', price: product.price, quantity: line.quantity });
      totalAmount += product.price * line.quantity;
    }
    for (const item of items) {
      const product = await Product.findOneAndUpdate(
        { _id: item.product, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { new: true }
      );
      if (!product) {
        const error = new Error(`${item.name} is no longer available in that quantity`);
        error.status = 400;
        throw error;
      }
      decremented.push(item);
    }
    const [order] = await Order.create([{
      user: req.user.id,
      items,
      shippingAddress: { fullName: fullName.trim(), address: address.trim(), city: city.trim(), phone: phone.trim() },
      totalAmount
    }]);
    orderCreated = true;
    await Cart.updateOne({ _id: cart._id, user: req.user.id }, { $set: { items: [] } });
    await logActivity({ actor: req.user, action: 'ORDER_PLACED', details: `Placed an order (${order.totalAmount})`, entityId: order.id });
    res.status(201).json({ success: true, data: order, message: 'Order placed' });
  } catch (error) {
    if (!orderCreated) {
      try {
        for (const item of decremented) {
          await Product.updateOne({ _id: item.product }, { $inc: { stock: item.quantity } });
        }
      } catch (rollbackError) {
        rollbackError.message = `Order failed (${error.message}) and stock rollback failed (${rollbackError.message})`;
        return next(rollbackError);
      }
    }
    next(error);
  }
}

export async function myOrders(req, res, next) {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, data: orders, message: 'Orders loaded' });
  } catch (error) { next(error); }
}

export async function allOrders(_req, res, next) {
  try {
    const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.json({ success: true, data: orders, message: 'Orders loaded' });
  } catch (error) { next(error); }
}

export async function updateOrderStatus(req, res, next) {
  try {
    const allowed = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!allowed.includes(req.body.status)) return res.status(400).json({ success: false, message: 'Invalid order status' });
    const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    await logActivity({ actor: req.user, action: 'ORDER_STATUS_UPDATED', details: `Changed order status to ${order.status}`, entityId: order.id });
    res.json({ success: true, data: order, message: 'Order status updated' });
  } catch (error) { next(error); }
}
