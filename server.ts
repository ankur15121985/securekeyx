import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import cors from 'cors';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
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

if (process.env.REDIS_URL) {
  try {
    const { default: Redis } = await import('ioredis');
    redis = new Redis(process.env.REDIS_URL);
    redis.on('error', (err: any) => {
      console.error('[REDIS] Client Error', err);
      console.warn('[REDIS] Falling back to in-memory store');
      useMemoryStore();
    });
  } catch (err) {
    console.error('[REDIS] Failed to load ioredis:', err);
    useMemoryStore();
  }
} else {
  console.warn('[SYSTEM] No REDIS_URL provided. Using in-memory store.');
  useMemoryStore();
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
  origin: true,
  credentials: true
}));

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

// Login
app.post('/api/auth/login', async (req: any, res: any) => {
  const { username, password } = req.body;
  console.log('[API] Login attempt for:', username);
  
  if (username === 'ankur15121985' && password === 'M@thur24') {
    const user = { username, id: 'admin-id', role: 'admin' };
    const token = jwt.sign({ username, id: user.id, role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
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
  res.json(keys.map((k: string) => JSON.parse(k)));
});

// API Error Handler for non-existent routes
app.all('/api/*', (req, res) => {
  res.status(404).json({ error: `Tactical endpoint ${req.method} ${req.url} not found` });
});

// --- Vite Middleware & Static Serving ---
if (process.env.NODE_ENV !== 'production') {
  try {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } catch (err) {
    console.error('[VITE] Failed to initialize Vite:', err);
  }
} else {
  // Production: Serve static files from dist
  const possiblePaths = [
    path.join(process.cwd(), 'dist'),
    path.join(__dirname, 'dist'),
    path.join(__dirname, '..', 'dist')
  ];
  
  let distPath = '';
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      distPath = p;
      break;
    }
  }

  if (distPath) {
    console.log(`[SYSTEM] Serving static assets from: ${distPath}`);
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      const indexPath = path.join(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send('Index file not found in dist.');
      }
    });
  } else {
    console.warn('[SYSTEM] dist directory not found in any expected location.');
    app.get('*', (req, res) => {
      res.status(404).send(`Frontend assets not found. Paths checked: ${possiblePaths.join(', ')}`);
    });
  }
}

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
