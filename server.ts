import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import Redis from 'ioredis';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Trust the first proxy (Cloud Run / Nginx / Vercel)
app.set('trust proxy', 1);

// Redis setup with in-memory fallback
let redis: any;

if (process.env.REDIS_URL) {
  redis = new Redis(process.env.REDIS_URL);
  redis.on('error', (err: any) => {
    console.error('[REDIS] Client Error', err);
    console.warn('[REDIS] Falling back to in-memory store');
    useMemoryStore();
  });
} else {
  console.warn('[SYSTEM] No REDIS_URL provided. Using in-memory store.');
  useMemoryStore();
}

function useMemoryStore() {
  const store = new Map<string, any>();
  redis = {
    set: async (key: string, val: any, mode?: string, duration?: number) => {
      store.set(key, val);
      if (mode === 'EX' && duration) {
        setTimeout(() => store.delete(key), duration * 1000);
      }
      return 'OK';
    },
    get: async (key: string) => store.get(key) || null,
    del: async (key: string) => store.delete(key),
    lpush: async (key: string, val: any) => {
      const list = store.get(key) || [];
      list.unshift(val);
      store.set(key, list);
      return list.length;
    },
    lrange: async (key: string, start: number, end: number) => {
      const list = store.get(key) || [];
      if (end === -1) return list.slice(start);
      return list.slice(start, end + 1);
    },
    on: () => {}
  };
}

app.use(express.json());

// Tactical Logger
app.use((req, res, next) => {
  if (req.url.startsWith('/api/')) {
    console.log(`[API] ${req.method} ${req.url}`);
  }
  next();
});

app.use(cors({
  origin: true, // Allow all origins in development
  credentials: true
}));

// Disable X-Powered-By header
app.disable('x-powered-by');

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

// --- Auth Middleware ---
const authenticate = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// --- API Routes ---

// Admin Login
app.post('/api/auth/admin-login', async (req: any, res: any) => {
  const { username, password } = req.body;
  console.log('[API] Admin Login attempt for:', username);
  
  if (username === 'ankur15121985' && password === 'M@thur24') {
    const user = { username, id: 'admin-id', role: 'admin' };
    const token = jwt.sign({ username, id: user.id, role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user });
  } else {
    res.status(401).json({ error: 'Invalid admin credentials' });
  }
});

// OTP Request
app.post('/api/auth/otp-request', async (req: any, res: any) => {
  const { mobile } = req.body;
  console.log('[API] OTP Request for:', mobile);
  if (!mobile) return res.status(400).json({ error: 'Mobile number required' });

  const otp = '123456'; 
  await redis.set(`otp:${mobile}`, otp, 'EX', 300);
  res.json({ message: 'OTP sent successfully (Use 123456)' });
});

// OTP Verify
app.post('/api/auth/otp-verify', async (req: any, res: any) => {
  const { mobile, otp } = req.body;
  console.log('[API] OTP Verify for:', mobile);
  if (!mobile || !otp) return res.status(400).json({ error: 'Mobile and OTP required' });

  const storedOtp = await redis.get(`otp:${mobile}`);
  
  if (storedOtp === otp || otp === '123456') {
    await redis.del(`otp:${mobile}`);
    const user = { mobile, id: crypto.randomUUID() };
    await redis.set(`user:${mobile}`, JSON.stringify(user));
    const token = jwt.sign({ mobile, id: user.id }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user });
  } else {
    res.status(401).json({ error: 'Invalid or expired OTP' });
  }
});

// Token Verification
app.get('/api/auth/verify', authenticate, (req: any, res: any) => {
  res.json({ valid: true, user: req.user });
});

// Key Generation
app.post('/api/keys/generate', authenticate, async (req: any, res: any) => {
  const { algorithm } = req.body;
  if (!algorithm) return res.status(400).json({ error: 'Algorithm required' });
  const key = crypto.randomBytes(32).toString('hex');
  res.json({ algorithm, key, createdAt: new Date().toISOString() });
});

// Store Encrypted Key
app.post('/api/keys/store', authenticate, async (req: any, res: any) => {
  const { encryptedKey, algorithm, metadata } = req.body;
  const userId = req.user.id;
  const keyId = crypto.randomUUID();
  const keyData = { id: keyId, userId, encryptedKey, algorithm, metadata, createdAt: new Date().toISOString() };
  await redis.lpush(`user:${userId}:keys`, JSON.stringify(keyData));
  res.json({ message: 'Key stored securely', keyId });
});

// Get User Keys
app.get('/api/keys', authenticate, async (req: any, res) => {
  const userId = req.user.id;
  const keys = await redis.lrange(`user:${userId}:keys`, 0, -1);
  res.json(keys.map(k => JSON.parse(k)));
});

// API Error Handler for non-existent routes
app.all('/api/*', (req, res) => {
  res.status(404).json({ error: `Tactical endpoint ${req.method} ${req.url} not found` });
});

// --- Vite Middleware & Static Serving ---
async function setupFrontend() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }
}

setupFrontend();

// Global Error Handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error('[CRITICAL] Server Error:', err);
  if (req.path.startsWith('/api/')) {
    return res.status(500).json({ error: 'Internal Protocol Error' });
  }
  next(err);
});

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SYSTEM] Node running on http://localhost:${PORT}`);
  });
}

export default app;
