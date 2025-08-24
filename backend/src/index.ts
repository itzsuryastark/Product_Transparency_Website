import dotenv from 'dotenv';
dotenv.config();

import { app } from './server/app';

const PORT = process.env.PORT ? Number(process.env.PORT) : 8000;

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend API listening on http://localhost:${PORT}`);
});


