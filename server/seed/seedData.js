import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import User from '../models/User.js';
import Product from '../models/Product.js';

const root = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.resolve(root, '../uploads');
const products = [
  ['Air Form One', 'Men', 14500, 'A clean everyday silhouette built for comfort and effortless style.', 36, true, '#d6d3cd'],
  ['Velocity Runner', 'Running', 18900, 'Responsive cushioning meets a lightweight, breathable upper.', 24, true, '#d8e2de', 'velocity-runner.jpg'],
  ['Studio Low', 'Women', 13200, 'A versatile low-profile essential with soft all-day support.', 28, true, '#e6d9d4'],
  ['Court Classic', 'Lifestyle', 12500, 'An iconic court-inspired shape, refreshed for daily rotation.', 32, true, '#d9dce2'],
  ['Junior Dash', 'Kids', 8900, 'Easy-on comfort and durable traction for every little adventure.', 20, false, '#d8e0ee'],
  ['Trail Motion', 'Running', 17200, 'Confident grip and stable support, from city paths to trails.', 18, false, '#d9ded0'],
  ['Air Form One SE', 'Women', 15800, 'Premium textures bring a fresh look to a familiar favorite.', 14, false, '#e2d7c8'],
  ['Everyday Flex', 'Men', 11900, 'Flexible comfort and simple style made for repeat wear.', 26, false, '#d9d9d5']
];

function shoeArtwork(name, color, index) {
  const safeName = name.replace(/&/g, '&amp;');
  const shift = index % 2 ? -14 : 14;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 720"><rect width="720" height="720" fill="#f5f5f5"/><ellipse cx="361" cy="522" rx="211" ry="31" fill="#d9d9d9" opacity=".52"/><g transform="translate(${shift} 0) rotate(-9 360 360)"><path d="M142 417c45-13 100-38 133-82l65-93c16-22 39-35 65-32l27 4c18 3 35 14 44 31l55 103c18 33 47 56 85 67l42 12c21 6 35 21 35 42 0 16-13 29-31 31l-495 16c-50 2-82-17-82-48 0-23 20-42 57-51z" fill="${color}"/><path d="M140 467c74 15 199 21 341 7 82-8 156-8 212 4 25 6 38 18 38 35 0 20-16 31-42 33l-489 11c-74 2-122-13-122-44 0-23 22-40 62-46z" fill="#fff"/><path d="M253 382l88-115m-35 124 98-125m-44 133 102-117" stroke="#111" stroke-width="12" stroke-linecap="round" opacity=".82"/><path d="M146 469c114 18 294 12 432-4" fill="none" stroke="#bbb" stroke-width="5"/></g><text x="360" y="630" font-family="Arial,sans-serif" font-size="24" font-weight="700" text-anchor="middle" fill="#777">${safeName}</text></svg>`;
}

try {
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is required');
  await mongoose.connect(process.env.MONGO_URI);
  await fs.mkdir(uploadDir, { recursive: true });
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const userPassword = await bcrypt.hash('User@123', 10);
  await User.findOneAndUpdate({ email: 'admin@solestride.com' }, { name: 'SoleStride Admin', email: 'admin@solestride.com', password: adminPassword, role: 'admin' }, { upsert: true, new: true, runValidators: true });
  await User.findOneAndUpdate({ email: 'user@solestride.com' }, { name: 'Demo Shopper', email: 'user@solestride.com', password: userPassword, role: 'user' }, { upsert: true, new: true, runValidators: true });
  const records = [];
  for (let index = 0; index < products.length; index += 1) {
    const [name, category, price, description, stock, isFeatured, color, photoFilename] = products[index];
    const filename = photoFilename || `shoe-${index + 1}.svg`;
    if (!photoFilename) await fs.writeFile(path.join(uploadDir, filename), shoeArtwork(name, color, index), 'utf8');
    records.push({ name, category, price, description, stock, isFeatured, sizes: ['EU 38', 'EU 39', 'EU 40', 'EU 41', 'EU 42', 'EU 43'], image: `/uploads/${filename}` });
  }
  await Product.deleteMany({});
  await Product.insertMany(records);
  console.log('Seed complete: admin@solestride.com / Admin@123, user@solestride.com / User@123, 8 products');
} catch (error) {
  console.error('Seed failed:', error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
