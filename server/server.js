import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { errorMiddleware } from './middleware/errorMiddleware.js';

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.get('/api/health', (_req, res) => res.json({ success: true, data: { status: 'ok' }, message: 'SoleStride API is running' }));
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use((req, res) => res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.path}` }));
app.use(errorMiddleware);

const port = Number(process.env.PORT) || 5001;
connectDB().then(async () => {
  await fs.mkdir(path.join(__dirname, 'uploads'), { recursive: true });
  app.listen(port, () => console.log(`SoleStride API listening on ${port}`));
}).catch((error) => {
  console.error('Unable to start server:', error.message);
  process.exitCode = 1;
});
