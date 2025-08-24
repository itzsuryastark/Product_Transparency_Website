import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { prisma } from '../services/prisma';
import { createReportPdfBuffer } from '../utils/pdf';

export const reportsRouter = Router();

reportsRouter.post('/', requireAuth, async (req, res) => {
  const { productId } = req.body || {};
  if (!productId) return res.status(400).json({ error: 'productId is required' });
  const product = await prisma.product.findFirst({ where: { id: Number(productId), companyId: req.user!.companyId }, include: { questions: true } });
  if (!product) return res.status(404).json({ error: 'Product not found' });

  const pdf = await createReportPdfBuffer(product);
  const report = await prisma.report.create({ data: { productId: product.id, fileName: `report_${product.id}.pdf` } });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${report.fileName}"`);
  res.send(pdf);
});


