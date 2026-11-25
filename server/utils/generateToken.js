import jwt from 'jsonwebtoken';

export default function generateToken(user) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is required');
  return jwt.sign({ id: user._id.toString(), role: user.role }, secret, { expiresIn: '7d' });
}
