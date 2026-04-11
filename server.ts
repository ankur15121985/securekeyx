import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import cors from 'cors';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { body, validationResult } from 'express-validator';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Trust the first proxy (Cloud Run / Nginx / Vercel)
app.set('trust proxy', 1);

// Redis setup with in-memory fallback and file persistence
let redis: any;
const DB_FILE = path.join(process.cwd(), 'tactical_db.json');

function useMemoryStore() {
  let store = new Map<string, any>();
  
  // Load from file if exists
  if (fs.existsSync(DB_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
      store = new Map(Object.entries(data));
      console.log('[SYSTEM] Tactical DB loaded from file.');
    } catch (err) {
      console.error('[SYSTEM] Failed to load tactical DB:', err);
    }
  }

  const saveToFile = () => {
    try {
      const data = Object.fromEntries(store);
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    } catch (err) {
      console.error('[SYSTEM] Failed to save tactical DB:', err);
    }
  };

  redis = {
    set: async (key: string, val: any, mode?: string, duration?: number) => {
      store.set(key, val);
      saveToFile();
      if (mode === 'EX' && duration) {
        setTimeout(() => {
          store.delete(key);
          saveToFile();
        }, duration * 1000);
      }
      return 'OK';
    },
    get: async (key: string) => store.get(key) || null,
    del: async (key: string) => {
      const res = store.delete(key);
      saveToFile();
      return res;
    },
    lpush: async (key: string, val: any) => {
      const list = store.get(key) || [];
      list.unshift(val);
      store.set(key, list);
      saveToFile();
      return list.length;
    },
    lrange: async (key: string, start: number, end: number) => {
      const list = store.get(key) || [];
      if (end === -1) return list.slice(start);
      return list.slice(start, end + 1);
    },
    // Custom methods for CRUD
    lrem_by_id: async (key: string, id: string) => {
      const list = store.get(key) || [];
      const newList = list.filter((item: string) => {
        try {
          return JSON.parse(item).id !== id;
        } catch {
          return true;
        }
      });
      store.set(key, newList);
      saveToFile();
      return list.length - newList.length;
    },
    lupdate_by_id: async (key: string, id: string, updates: any) => {
      const list = store.get(key) || [];
      let found = false;
      const newList = list.map((item: string) => {
        try {
          const parsed = JSON.parse(item);
          if (parsed.id === id) {
            found = true;
            return JSON.stringify({ ...parsed, ...updates });
          }
          return item;
        } catch {
          return item;
        }
      });
      if (found) {
        store.set(key, newList);
        saveToFile();
      }
      return found;
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

// Security Hardening
app.use(helmet({
  contentSecurityPolicy: false, // Disable for Vite dev compatibility
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP, please try again after 15 minutes' }
});

app.use('/api/', limiter);

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
app.post('/api/auth/login', 
  [
    body('username').trim().notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req: any, res: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;
    console.log('[API] Login attempt for:', username);
    
    const ADMIN_USER = process.env.ADMIN_USERNAME || 'ankur15121985';
    const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'M@thur24';

    if (username === ADMIN_USER && password === ADMIN_PASS) {
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

// Update Key Metadata (PATCH)
app.patch('/api/keys/:id', authenticate, async (req: any, res: any) => {
  const { id } = req.params;
  const userId = req.user.id;
  const { metadata } = req.body;

  if (redis.lupdate_by_id) {
    const success = await redis.lupdate_by_id(`user:${userId}:keys`, id, { metadata });
    if (success) {
      return res.json({ message: 'Key metadata updated successfully' });
    }
  }
  
  res.status(404).json({ error: 'Key not found' });
});

// Decommission Key (DELETE)
app.delete('/api/keys/:id', authenticate, async (req: any, res: any) => {
  const { id } = req.params;
  const userId = req.user.id;

  if (redis.lrem_by_id) {
    const removedCount = await redis.lrem_by_id(`user:${userId}:keys`, id);
    if (removedCount > 0) {
      return res.json({ message: 'Key decommissioned successfully' });
    }
  }

  res.status(404).json({ error: 'Key not found or already decommissioned' });
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
    path.join(__dirname, '..', 'dist'),
    path.join(__dirname, '..', '..', 'dist'),
    path.resolve('dist'),
    path.resolve('../dist'),
    path.join(process.cwd(), '.vercel/output/static'), // Vercel output path
    '/var/task/dist',
    '/var/task/project/dist'
  ];
  
  let distPath = '';
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      distPath = p;
      break;
    }
  }

  // Debug route to help identify file structure on Vercel
  app.get('/api/debug/files', (req, res) => {
    try {
      const currentDir = process.cwd();
      const files = fs.readdirSync(currentDir);
      const dirnameFiles = fs.readdirSync(__dirname);
      res.json({
        cwd: currentDir,
        dirname: __dirname,
        cwdFiles: files,
        dirnameFiles: dirnameFiles,
        possiblePaths,
        env: {
          NODE_ENV: process.env.NODE_ENV,
          VERCEL: process.env.VERCEL
        }
      });
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
    }
  });

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
