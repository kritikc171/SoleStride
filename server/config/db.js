import dns from 'node:dns';
import mongoose from 'mongoose';

const LOOPBACK_DNS = new Set(['127.0.0.1', '::1']);

export default async function connectDB() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGO_URI is required');

  // Node's c-ares resolver falls back to 127.0.0.1 on IPv6-only DNS adapters, breaking mongodb+srv lookups.
  if (uri.startsWith('mongodb+srv://') && dns.getServers().every((server) => LOOPBACK_DNS.has(server))) {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  }

  await mongoose.connect(uri);
  console.log(`MongoDB connected: ${mongoose.connection.host}`);
}
