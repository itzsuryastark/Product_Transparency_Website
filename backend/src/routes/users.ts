import { Router } from 'express';
import { requireAuth, requireAdmin, AuthRequest } from '../middleware/auth';
import { prisma } from '../services/prisma';
import bcrypt from 'bcryptjs';

export const usersRouter = Router();

// Get all users (Admin only)
usersRouter.get('/', requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { companyId: req.user!.companyId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    return res.json(users);
  } catch (error) {
    console.log('Database error:', error);
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get single user (Admin only)
usersRouter.get('/:id', requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findFirst({
      where: { 
        id: Number(req.params.id), 
        companyId: req.user!.companyId 
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json(user);
  } catch (error) {
    console.log('Database error:', error);
    return res.status(404).json({ error: 'User not found' });
  }
});

// Create user (Admin only)
usersRouter.post('/', requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  const { email, password, name, role = 'VIEWER' } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Email, password, and name are required' });
  }

  if (!['ADMIN', 'MANAGER', 'VIEWER'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
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
        companyId: req.user!.companyId
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return res.status(201).json(user);
  } catch (error) {
    console.log('Database error:', error);
    return res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update user (Admin only)
usersRouter.put('/:id', requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  const { email, name, role, isActive } = req.body;
  const userId = Number(req.params.id);

  try {
    const user = await prisma.user.findFirst({
      where: { 
        id: userId, 
        companyId: req.user!.companyId 
      }
    });
    
    if (!user) return res.status(404).json({ error: 'User not found' });

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        email: email || user.email,
        name: name || user.name,
        role: role || user.role,
        isActive: isActive !== undefined ? isActive : user.isActive
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    return res.json(updatedUser);
  } catch (error) {
    console.log('Database error:', error);
    return res.status(404).json({ error: 'User not found' });
  }
});

// Change user password (Admin only)
usersRouter.put('/:id/password', requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  const { password } = req.body;
  const userId = Number(req.params.id);

  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }

  try {
    const user = await prisma.user.findFirst({
      where: { 
        id: userId, 
        companyId: req.user!.companyId 
      }
    });
    
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Hash new password
    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: passwordHash }
    });
    
    return res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.log('Database error:', error);
    return res.status(404).json({ error: 'User not found' });
  }
});

// Delete user (Admin only)
usersRouter.delete('/:id', requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  const userId = Number(req.params.id);

  try {
    const user = await prisma.user.findFirst({
      where: { 
        id: userId, 
        companyId: req.user!.companyId 
      }
    });
    
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Prevent admin from deleting themselves
    if (userId === Number(req.user!.userId)) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    await prisma.user.delete({ where: { id: userId } });
    return res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.log('Database error:', error);
    return res.status(404).json({ error: 'User not found' });
  }
});
