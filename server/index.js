import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { WhatsAppBot } from './whatsapp/bot.js';
import { getSystemStats } from './utils/stats.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(express.json());

// In-memory storage (replace with database in production)
const users = [
  {
    id: '1',
    username: 'demo',
    email: 'demo@example.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    createdAt: new Date(),
    botConnected: false
  }
];

const activeBots = new Map();
const JWT_SECRET = 'your-secret-key-change-in-production';

// Admin credentials
const ADMIN_USERNAME = 'DarkWinzo';
const ADMIN_PASSWORD = '20030210';

// Initialize server with proper error handling
async function initializeServer() {
  try {
    // Ensure directories exist
    await fs.ensureDir(path.join(__dirname, '../Connect/lib'));
    await fs.ensureDir(path.join(__dirname, '../Connect/plugin'));
    await fs.ensureDir(path.join(__dirname, '../Connect/language'));
    await fs.ensureDir(path.join(__dirname, '../Connect/database/react'));
    await fs.ensureDir(path.join(__dirname, '../config'));
    await fs.ensureDir(path.join(__dirname, '../auth_sessions'));
    
    console.log('✅ Directories initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing directories:', error);
    // Continue with server startup even if directory creation fails
  }
}

// Authentication Routes
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = { 
      id: Date.now().toString(), 
      username, 
      email, 
      password: hashedPassword,
      createdAt: new Date(),
      botConnected: false
    };
    
    users.push(user);
    
    const token = jwt.sign({ userId: user.id }, JWT_SECRET);
    res.json({ token, user: { id: user.id, username, email, botConnected: false } });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = users.find(u => u.email === email);
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ userId: user.id }, JWT_SECRET);
    res.json({ 
      token, 
      user: { 
        id: user.id, 
        username: user.username, 
        email: user.email,
        botConnected: user.botConnected 
      } 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin login
app.post('/api/admin/login', (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      const token = jwt.sign({ admin: true }, JWT_SECRET);
      res.json({ token, admin: true });
    } else {
      res.status(401).json({ error: 'Invalid admin credentials' });
    }
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.sendStatus(401);
  }
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Bot Routes
app.post('/api/bot/connect', authenticateToken, async (req, res) => {
  try {
    const { method, phoneNumber } = req.body;
    const userId = req.user.userId;
    
    if (activeBots.has(userId)) {
      const existingBot = activeBots.get(userId);
      if (existingBot.isConnected) {
        return res.status(400).json({ error: 'Bot already connected' });
      }
      // Clean up existing bot if not connected
      existingBot.disconnect();
      activeBots.delete(userId);
    }
    
    const bot = new WhatsAppBot(userId, io);
    activeBots.set(userId, bot);
    
    if (method === 'qr') {
      const qrCode = await bot.generateQR();
      res.json({ qrCode });
    } else if (method === 'pairing') {
      if (!phoneNumber) {
        return res.status(400).json({ error: 'Phone number is required for pairing method' });
      }
      const pairingCode = await bot.generatePairingCode(phoneNumber);
      res.json({ pairingCode });
    } else {
      return res.status(400).json({ error: 'Invalid connection method' });
    }
  } catch (error) {
    console.error('Bot connection error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/bot/disconnect', authenticateToken, (req, res) => {
  try {
    const userId = req.user.userId;
    const bot = activeBots.get(userId);
    
    if (bot) {
      bot.disconnect();
      activeBots.delete(userId);
      const user = users.find(u => u.id === userId);
      if (user) user.botConnected = false;
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Bot disconnect error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/bot/status', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const bot = activeBots.get(userId);
    
    if (!bot || !bot.isConnected) {
      return res.json({ 
        connected: false, 
        stats: { uptime: 0, totalUsers: 0, totalCommands: 0, ramUsage: 0 } 
      });
    }
    
    const stats = await bot.getStats();
    const systemStats = await getSystemStats();
    
    res.json({ 
      connected: true, 
      stats: { ...stats, ...systemStats } 
    });
  } catch (error) {
    console.error('Bot status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Bot Settings Routes
app.get('/api/bot/settings', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const bot = activeBots.get(userId);
    
    if (!bot) {
      return res.status(404).json({ error: 'Bot not found' });
    }
    
    res.json(bot.getSettings());
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/bot/settings', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const bot = activeBots.get(userId);
    
    if (!bot) {
      return res.status(404).json({ error: 'Bot not found' });
    }
    
    await bot.updateSettings(req.body);
    res.json({ success: true });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Admin Routes
app.get('/api/admin/users', authenticateToken, (req, res) => {
  try {
    if (!req.user.admin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const userList = users.map(u => ({
      id: u.id,
      username: u.username,
      email: u.email,
      createdAt: u.createdAt,
      botConnected: u.botConnected
    }));
    
    res.json(userList);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/admin/stats', authenticateToken, async (req, res) => {
  try {
    if (!req.user.admin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const systemStats = await getSystemStats();
    const totalUsers = users.length;
    const connectedBots = activeBots.size;
    
    res.json({
      totalUsers,
      connectedBots,
      ...systemStats
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Check if dist directory exists and serve static files conditionally
const distPath = path.join(__dirname, '../dist');
const indexPath = path.join(distPath, 'index.html');

// Only serve static files if dist directory exists
if (await fs.pathExists(distPath)) {
  app.use(express.static(distPath));
  
  // Serve React app for all other routes only if index.html exists
  app.get('*', async (req, res) => {
    try {
      if (await fs.pathExists(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).json({ error: 'Frontend not built. Please run npm run build first.' });
      }
    } catch (error) {
      console.error('Error serving static files:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
} else {
  // If dist doesn't exist, provide helpful message
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
      res.status(404).json({ error: 'API endpoint not found' });
    } else {
      res.status(404).json({ 
        error: 'Frontend not built. Please run "npm run build" to build the frontend first.',
        message: 'The server is running but the React frontend needs to be built.'
      });
    }
  });
}

// Start server with proper error handling
async function startServer() {
  try {
    await initializeServer();
    
    const PORT = process.env.PORT || 3001;
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📱 WhatsApp Bot Dashboard: http://localhost:${PORT}`);
      console.log(`💡 If you see 404 errors, run "npm run build" to build the frontend`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
startServer();