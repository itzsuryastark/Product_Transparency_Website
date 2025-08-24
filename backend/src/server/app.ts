import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { json, urlencoded } from 'express';
import { authRouter } from '../routes/auth';
import { productsRouter } from '../routes/products';
import { reportsRouter } from '../routes/reports';

export const app = express();

app.use(cors({ origin: '*'}));
app.use(morgan('dev'));
app.use(json({ limit: '1mb' }));
app.use(urlencoded({ extended: true }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/auth', authRouter);
app.use('/products', productsRouter);
app.use('/reports', reportsRouter);


