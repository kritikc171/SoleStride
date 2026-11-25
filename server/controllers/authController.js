import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import logActivity from '../utils/logActivity.js';

const userData = (user) => ({ id: user._id, name: user.name, email: user.email, role: user.role });

export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    if (!name?.trim() || !email?.trim() || !password) return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ success: false, message: 'Enter a valid email address' });
    if (password.length < 8) return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
    if (await User.exists({ email: email.toLowerCase().trim() })) return res.status(409).json({ success: false, message: 'An account with this email already exists' });
    const user = await User.create({ name, email, password: await bcrypt.hash(password, 10) });
    await logActivity({ actor: user, action: 'USER_REGISTERED', details: 'Created an account' });
    res.status(201).json({ success: true, data: { user: userData(user), token: generateToken(user) }, message: 'Account created' });
  } catch (error) { next(error); }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase().trim() }).select('+password');
    if (!user || !(await bcrypt.compare(password || '', user.password))) return res.status(401).json({ success: false, message: 'Email or password is incorrect' });
    await logActivity({ actor: user, action: 'USER_LOGIN', details: 'Signed in' });
    res.json({ success: true, data: { user: userData(user), token: generateToken(user) }, message: 'Signed in' });
  } catch (error) { next(error); }
}

export async function currentUser(req, res) {
  res.json({ success: true, data: userData(req.user), message: 'Current user' });
}
