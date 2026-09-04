import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { apiRouter } from './src/server/routes.js';

dotenv.config();

const app = express();
const isProduction = process.env.NODE_ENV === 'production';
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Trust proxy for reverse proxy and correct IP logging
app.set('trust proxy', true);

// Health check route
app.get('/healthz', (req, res) => {
  res.json({ status: 'ok', service: 'DevilCloud Minecraft Hosting Platform' });
});

// Mount API router
app.use('/api', apiRouter);

async function startServer() {
  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production: serve built static client
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`⚡ DEVILCLOUD Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start DEVILCLOUD server:', err);
  process.exit(1);
});
