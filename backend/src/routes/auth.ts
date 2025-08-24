import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../services/prisma';

export const authRouter = Router();

// Demo users with different roles
const demoUsers = [
  {
    email: 'admin@example.com',
    password: 'admin1234',
    role: 'ADMIN',
    companyId: 'company-001',
    name: 'Admin User'
  },
  {
    email: 'manager@example.com',
    password: 'manager1234',
    role: 'MANAGER',
    companyId: 'company-001',
    name: 'Manager User'
  },
  {
    email: 'viewer@example.com',
    password: 'viewer1234',
    role: 'VIEWER',
    companyId: 'company-001',
    name: 'Viewer User'
  }
];

authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  try {
    // Try to find user in database first
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (user) {
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
      
      if (!user.isActive) return res.status(401).json({ error: 'Account is deactivated' });

      const secret = process.env.JWT_SECRET || 'dev-secret';
      const token = jwt.sign({ 
        userId: user.id,
        companyId: user.companyId, 
        email: user.email,
        role: user.role,
        name: user.name
      }, secret, { expiresIn: '8h' });
      
      return res.json({ 
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name,
          companyId: user.companyId
        }
      });
    }

    // Fallback to demo users if database is not available
    const demoUser = demoUsers.find(u => u.email === email);
    if (!demoUser) return res.status(401).json({ error: 'Invalid credentials' });
    
    if (demoUser.password !== password) return res.status(401).json({ error: 'Invalid credentials' });

    const secret = process.env.JWT_SECRET || 'dev-secret';
    const token = jwt.sign({ 
      userId: `demo-${demoUser.role.toLowerCase()}`,
      companyId: demoUser.companyId, 
      email: demoUser.email,
      role: demoUser.role,
      name: demoUser.name
    }, secret, { expiresIn: '8h' });
    
    return res.json({ 
      token,
      user: {
        id: `demo-${demoUser.role.toLowerCase()}`,
        email: demoUser.email,
        role: demoUser.role,
        name: demoUser.name,
        companyId: demoUser.companyId
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

authRouter.post('/register', async (req, res) => {
  const { email, password, name, role = 'VIEWER', companyId } = req.body || {};
  
  if (!email || !password || !name || !companyId) {
    return res.status(400).json({ error: 'Email, password, name, and companyId required' });
  }

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: passwordHash,
        name,
        role,
        companyId
      }
    });

    const secret = process.env.JWT_SECRET || 'dev-secret';
    const token = jwt.sign({ 
      userId: user.id,
      companyId: user.companyId, 
      email: user.email,
      role: user.role,
      name: user.name
    }, secret, { expiresIn: '8h' });
    
    return res.status(201).json({ 
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        companyId: user.companyId
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

authRouter.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.substring(7);
  const secret = process.env.JWT_SECRET || 'dev-secret';

  try {
    const decoded = jwt.verify(token, secret) as any;
    
    if (decoded.userId.startsWith('demo-')) {
      // Demo user
      const demoUser = demoUsers.find(u => u.email === decoded.email);
      if (!demoUser) return res.status(401).json({ error: 'Invalid token' });
      
      return res.json({
        user: {
          id: decoded.userId,
          email: demoUser.email,
          role: demoUser.role,
          name: demoUser.name,
          companyId: demoUser.companyId
        }
      });
    }

    // Database user
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user || !user.isActive) return res.status(401).json({ error: 'User not found or inactive' });

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        companyId: user.companyId
      }
    });
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
});


