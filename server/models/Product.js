import mongoose from 'mongoose';

const categories = ['Men', 'Women', 'Kids', 'Running', 'Lifestyle'];
const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { type: String, enum: categories, required: true },
  price: { type: Number, min: 0, required: true },
  description: { type: String, required: true },
  sizes: [{ type: String }],
  stock: { type: Number, min: 0, default: 0 },
  image: { type: String, required: true },
  isFeatured: { type: Boolean, default: false }
}, { timestamps: true });

export { categories };
export default mongoose.model('Product', productSchema);
