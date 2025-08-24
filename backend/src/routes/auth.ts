import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const authRouter = Router();

// Basic in-memory company user for demo
const demoUser = {
  email: 'company@example.com',
  // password: demo1234
  passwordHash: bcrypt.hashSync('demo1234', 10),
  companyId: 'company-001'
};

authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  if (email !== demoUser.email) return res.status(401).json({ error: 'Invalid credentials' });
  const valid = await bcrypt.compare(password, demoUser.passwordHash);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  const secret = process.env.JWT_SECRET || 'dev-secret';
  const token = jwt.sign({ companyId: demoUser.companyId, email: demoUser.email }, secret, { expiresIn: '8h' });
  return res.json({ token });
});


