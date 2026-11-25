import mongoose from 'mongoose';

const actions = ['USER_REGISTERED', 'USER_LOGIN', 'CART_UPDATED', 'ORDER_PLACED', 'ORDER_STATUS_UPDATED', 'PRODUCT_CREATED', 'PRODUCT_UPDATED', 'PRODUCT_DELETED'];
const activitySchema = new mongoose.Schema({
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  actorName: { type: String, required: true },
  actorEmail: { type: String, required: true },
  actorRole: { type: String, enum: ['user', 'admin'], required: true },
  action: { type: String, enum: actions, required: true },
  details: { type: String, required: true },
  entityId: String
}, { timestamps: true });
activitySchema.index({ createdAt: -1 });

export default mongoose.model('ActivityLog', activitySchema);
