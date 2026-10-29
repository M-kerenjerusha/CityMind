import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

// Load environment variables from local or root .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { apiRouter } from './routes/api';
import { getDatabase } from './db/database';
import { seedDatabase } from './db/seed';

const app = express();
const PORT = process.env.PORT || 4000;

// Initialize database and seed sample data
try {
  getDatabase();
  seedDatabase();
} catch (dbErr) {
  console.warn('Database initialization warning:', dbErr);
}

// Security Middleware
app.use(
  helmet({
    contentSecurityPolicy: false, // Permit frontend dev proxy & asset loads
    crossOriginEmbedderPolicy: false,
  })
);

app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '1mb' }));

// Rate limiting: allow 180 requests per minute for smooth interactive game simulation
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 180,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, error: 'Too many requests. Please slow down and enjoy the simulation.' },
});
app.use('/api', limiter);

// Mount API router
app.use('/api', apiRouter);

// Serve frontend static build if present
const webDistPath = path.resolve(__dirname, '../../web/dist');
const altWebDistPath = path.resolve(process.cwd(), 'apps/web/dist');
const activeDist = fs.existsSync(webDistPath) ? webDistPath : fs.existsSync(altWebDistPath) ? altWebDistPath : null;

if (activeDist) {
  app.use(express.static(activeDist));
  app.get('*', (req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(activeDist, 'index.html'));
  });
}

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    ok: false,
    error: err?.message || 'Internal server error occurred.',
  });
});

// Start server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`🏙️ CityMind Quest Server is LIVE on port ${PORT}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🤖 Gemini AI Key configured: ${!!process.env.GEMINI_API_KEY}`);
    console.log(`===============================================`);
  });
}

export default app;
