import Product from '../models/Product.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import ActivityLog from '../models/ActivityLog.js';

export async function stats(_req, res, next) {
  try {
    const [products, orders, users, activities] = await Promise.all([
      Product.countDocuments(), Order.countDocuments(), User.countDocuments(), ActivityLog.countDocuments()
    ]);
    res.json({ success: true, data: { products, orders, users, activities }, message: 'Dashboard stats loaded' });
  } catch (error) { next(error); }
}

export async function users(_req, res, next) {
  try {
    const result = await User.find().select('name email role createdAt').sort({ createdAt: -1 });
    res.json({ success: true, data: result, message: 'Users loaded' });
  } catch (error) { next(error); }
}

export async function activities(req, res, next) {
  try {
    const filter = {};
    if (req.query.action) filter.action = req.query.action;
    if (req.query.search) filter.$or = [
      { actorName: { $regex: req.query.search, $options: 'i' } },
      { actorEmail: { $regex: req.query.search, $options: 'i' } }
    ];
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = 30;
    const [data, total] = await Promise.all([
      ActivityLog.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      ActivityLog.countDocuments(filter)
    ]);
    res.json({ success: true, data: { items: data, page, pages: Math.ceil(total / limit), total }, message: 'Activities loaded' });
  } catch (error) { next(error); }
}
