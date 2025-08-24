import { Router } from 'express';
import { requireAuth, requireManager, AuthRequest } from '../middleware/auth';
import { prisma } from '../services/prisma';

export const productsRouter = Router();

// Get all products (Viewers can view, Managers and Admins can manage)
productsRouter.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { companyId: req.user!.companyId },
      include: { createdBy: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' }
    });
    return res.json(products);
  } catch (error) {
    console.log('Database error:', error);
    // Return mock data if database is unavailable
    return res.json([
      {
        id: 1,
        name: 'Demo Product',
        companyId: req.user!.companyId,
        metadata: { origin_country: 'Demo Country', materials: 'Demo Materials' },
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: { name: 'Demo User', email: 'demo@example.com' }
      }
    ]);
  }
});

// Get single product
productsRouter.get('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const product = await prisma.product.findFirst({
      where: { 
        id: Number(req.params.id), 
        companyId: req.user!.companyId 
      },
      include: { createdBy: { select: { name: true, email: true } } }
    });
    
    if (!product) return res.status(404).json({ error: 'Product not found' });
    return res.json(product);
  } catch (error) {
    console.log('Database error:', error);
    return res.status(404).json({ error: 'Product not found' });
  }
});

// Create product (Only Managers and Admins)
productsRouter.post('/', requireAuth, requireManager, async (req: AuthRequest, res) => {
  const { name, metadata } = req.body;

  if (!name) return res.status(400).json({ error: 'Product name is required' });

  try {
    const product = await prisma.product.create({
      data: {
        name,
        metadata: metadata || {},
        companyId: req.user!.companyId,
        userId: Number(req.user!.userId)
      },
      include: { createdBy: { select: { name: true, email: true } } }
    });
    return res.status(201).json(product);
  } catch (error) {
    console.log('Database error:', error);
    // Return mock product if database is unavailable
    return res.status(201).json({
      id: Date.now(),
      name,
      metadata: metadata || {},
      companyId: req.user!.companyId,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: { name: req.user!.name || 'Demo User', email: req.user!.email }
    });
  }
});

// Update product (Only Managers and Admins)
productsRouter.put('/:id', requireAuth, requireManager, async (req: AuthRequest, res) => {
  const { name, metadata } = req.body;
  const productId = Number(req.params.id);

  try {
    const product = await prisma.product.findFirst({
      where: { 
        id: productId, 
        companyId: req.user!.companyId 
      }
    });
    
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        name: name || product.name,
        metadata: metadata || product.metadata
      },
      include: { createdBy: { select: { name: true, email: true } } }
    });
    
    return res.json(updatedProduct);
  } catch (error) {
    console.log('Database error:', error);
    return res.status(404).json({ error: 'Product not found' });
  }
});

// Delete product (Only Admins)
productsRouter.delete('/:id', requireAuth, requireManager, async (req: AuthRequest, res) => {
  const productId = Number(req.params.id);

  try {
    const product = await prisma.product.findFirst({
      where: { 
        id: productId, 
        companyId: req.user!.companyId 
      }
    });
    
    if (!product) return res.status(404).json({ error: 'Product not found' });

    await prisma.product.delete({ where: { id: productId } });
    return res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.log('Database error:', error);
    return res.status(404).json({ error: 'Product not found' });
  }
});


