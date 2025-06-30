import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server } from 'socket.io';
import QRCode from 'qrcode';
import pkg from 'whatsapp-web.js';
const { Client, LocalAuth, MessageMedia } = pkg;
import multer from 'multer';
import axios from 'axios';
import cron from 'node-cron';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST']
  }
});

// Load plugin system
const pluginLoader = require('./lib/pluginLoader.js');

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, 'uploads');
    fs.ensureDirSync(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 100 * 1024 * 1024 } }); // 100MB limit

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
const botSessions = new Map();
const messageHistory = new Map();
const JWT_SECRET = 'your-secret-key-change-in-production';

// Admin credentials
const ADMIN_USERNAME = 'DarkWinzo';
const ADMIN_EMAIL = 'DarkWinzo@gmail.com';
const ADMIN_PASSWORD = '20030210';

// Advanced WhatsApp Bot class
class AdvancedWhatsAppBot {
  constructor(userId, io) {
    this.userId = userId;
    this.io = io;
    this.client = null;
    this.isConnected = false;
    this.isPaused = false;
    this.startTime = Date.now();
    this.messageCount = 0;
    this.userCount = 0;
    this.groupCount = 0;
    this.commandsUsed = new Map();
    this.activeUsers = new Set();
    this.bannedUsers = new Set();
    this.autoReplyMessages = new Map();
    this.scheduledMessages = [];
    this.mediaCache = new Map();
    this.qrRetries = 0;
    this.maxQrRetries = 3;
    this.chats = [];
    this.currentChat = null;
    this.messages = new Map(); // Store messages for each chat
    
    // Load config
    this.config = this.loadConfig();
    this.settings = this.loadSettings();
  }

  loadConfig() {
    try {
      const configPath = path.join(__dirname, 'config/config.json');
      if (fs.existsSync(configPath)) {
        return JSON.parse(fs.readFileSync(configPath, 'utf8'));
      }
    } catch (error) {
      console.error('Error loading config:', error);
    }
    
    // Default config
    return {
      LANGUAGE: "EN",
      PREFIX: ".",
      OWNER_NUMBER: "",
      BOT_NAME: "Queen Bot",
      AUTO_REACT: true,
      AUTO_READ: false,
      WELCOME_MESSAGE: true,
      ANTI_LINK: false,
      MAX_DOWNLOAD_SIZE: "100MB",
      WORK_MODE: "public",
      RESPONSE_DELAY: 1000,
      MAX_MESSAGES_PER_MINUTE: 10,
      AI_CHATBOT: false,
      VOICE_TO_TEXT: false,
      TEXT_TO_VOICE: false,
      IMAGE_GENERATION: false,
      WEATHER_UPDATES: false,
      NEWS_UPDATES: false,
      REMINDER_SYSTEM: false,
      GROUP_MANAGEMENT: true,
      ADMIN_ONLY: false,
      GROUP_ADMIN_ONLY: false,
      BLOCK_UNKNOWN: false,
      ANTI_FLOOD: true,
      ALLOWED_FILE_TYPES: ["image", "video", "audio", "document"],
      AUTO_DOWNLOAD_MEDIA: false,
      COMPRESS_IMAGES: true,
      LOG_MESSAGES: true,
      SAVE_MEDIA: true,
      NOTIFY_ON_COMMAND: true,
      NOTIFY_ON_ERROR: true,
      NOTIFY_ON_NEW_USER: false,
      NOTIFY_ON_GROUP_JOIN: true,
      AUTO_REPLY_TEXT: "Hello! I am currently unavailable. I will get back to you soon.",
      AUTO_REPLY_ENABLED: false,
      WELCOME_TEXT: "Welcome to our group! Please read the rules and enjoy your stay."
    };
  }

  loadSettings() {
    return {
      // Basic Settings
      botName: this.config.BOT_NAME,
      prefix: this.config.PREFIX,
      language: this.config.LANGUAGE,
      ownerNumber: this.config.OWNER_NUMBER,
      
      // Behavior Settings
      autoReact: this.config.AUTO_REACT,
      autoRead: this.config.AUTO_READ,
      autoTyping: true,
      welcomeMessage: this.config.WELCOME_MESSAGE,
      antiLink: this.config.ANTI_LINK,
      antiSpam: true,
      autoReply: this.config.AUTO_REPLY_ENABLED,
      
      // Advanced Features
      aiChatbot: this.config.AI_CHATBOT,
      voiceToText: this.config.VOICE_TO_TEXT,
      textToVoice: this.config.TEXT_TO_VOICE,
      imageGeneration: this.config.IMAGE_GENERATION,
      weatherUpdates: this.config.WEATHER_UPDATES,
      newsUpdates: this.config.NEWS_UPDATES,
      reminderSystem: this.config.REMINDER_SYSTEM,
      groupManagement: this.config.GROUP_MANAGEMENT,
      
      // Security Settings
      adminOnly: this.config.ADMIN_ONLY,
      groupAdminOnly: this.config.GROUP_ADMIN_ONLY,
      blockUnknown: this.config.BLOCK_UNKNOWN,
      antiFlood: this.config.ANTI_FLOOD,
      maxMessagesPerMinute: this.config.MAX_MESSAGES_PER_MINUTE,
      
      // Media Settings
      maxDownloadSize: this.config.MAX_DOWNLOAD_SIZE,
      allowedFileTypes: this.config.ALLOWED_FILE_TYPES,
      autoDownloadMedia: this.config.AUTO_DOWNLOAD_MEDIA,
      compressImages: this.config.COMPRESS_IMAGES,
      
      // Response Settings
      responseDelay: this.config.RESPONSE_DELAY,
      workMode: this.config.WORK_MODE,
      logMessages: this.config.LOG_MESSAGES,
      saveMedia: this.config.SAVE_MEDIA,
      
      // Notification Settings
      notifyOnCommand: this.config.NOTIFY_ON_COMMAND,
      notifyOnError: this.config.NOTIFY_ON_ERROR,
      notifyOnNewUser: this.config.NOTIFY_ON_NEW_USER,
      notifyOnGroupJoin: this.config.NOTIFY_ON_GROUP_JOIN,
      
      // Auto-Reply Settings
      autoReplyText: this.config.AUTO_REPLY_TEXT,
      autoReplyEnabled: this.config.AUTO_REPLY_ENABLED,
      
      // Welcome Message Settings
      welcomeText: this.config.WELCOME_TEXT,
      
      // Command Settings
      enabledCommands: {
        ping: true,
        help: true,
        info: true,
        weather: true,
        translate: true,
        sticker: true,
        download: true,
        ai: true,
        news: true,
        reminder: true,
        ban: true,
        unban: true,
        kick: true,
        promote: true,
        demote: true,
        mute: true,
        unmute: true,
        everyone: true,
        tagall: true,
        joke: true,
        quote: true,
        fact: true,
        meme: true
      }
    };
  }

  async initialize() {
    try {
      console.log(`Initializing bot for user ${this.userId}...`);
      
      // Load plugins
      await pluginLoader.loadPlugins();
      
      this.client = new Client({
        authStrategy: new LocalAuth({
          clientId: `bot-${this.userId}`,
          dataPath: path.join(__dirname, 'sessions')
        }),
        puppeteer: {
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor'
          ]
        }
      });

      this.setupEventHandlers();
      
      console.log(`Starting WhatsApp client for user ${this.userId}...`);
      await this.client.initialize();
      
      return true;
    } catch (error) {
      console.error('Bot initialization error:', error);
      this.io.emit('bot-error', { 
        userId: this.userId, 
        error: `Initialization failed: ${error.message}` 
      });
      throw error;
    }
  }

  setupEventHandlers() {
    this.client.on('qr', (qr) => {
      console.log(`QR code received for user ${this.userId}`);
      QRCode.toDataURL(qr, (err, url) => {
        if (!err) {
          this.io.emit('qr-code', { userId: this.userId, qrCode: url });
          console.log(`QR code sent to client for user ${this.userId}`);
        } else {
          console.error('QR code generation error:', err);
          this.io.emit('bot-error', { 
            userId: this.userId, 
            error: `QR code generation failed: ${err.message}` 
          });
        }
      });
    });

    this.client.on('ready', async () => {
      console.log(`Bot ${this.userId} is ready!`);
      this.isConnected = true;
      this.qrRetries = 0;
      
      // Update user status
      const user = users.find(u => u.id === this.userId);
      if (user) user.botConnected = true;

      try {
        // Get initial stats and chats
        const chats = await this.client.getChats();
        this.groupCount = chats.filter(chat => chat.isGroup).length;
        this.userCount = chats.filter(chat => !chat.isGroup).length;
        
        // Format chats for frontend
        this.chats = await Promise.all(chats.slice(0, 50).map(async (chat) => {
          try {
            const contact = chat.isGroup ? null : await chat.getContact();
            return {
              id: chat.id._serialized,
              name: chat.name || (contact ? contact.pushname || contact.number : 'Unknown'),
              isGroup: chat.isGroup,
              unreadCount: chat.unreadCount || 0,
              lastMessage: chat.lastMessage ? {
                body: chat.lastMessage.body || '',
                timestamp: chat.lastMessage.timestamp,
                fromMe: chat.lastMessage.fromMe
              } : null,
              profilePicUrl: null
            };
          } catch (error) {
            console.error('Error processing chat:', error);
            return null;
          }
        }));
        
        // Filter out null chats
        this.chats = this.chats.filter(chat => chat !== null);
        
        // Send chats to frontend
        this.io.emit('chats-updated', { userId: this.userId, chats: this.chats });
        
      } catch (error) {
        console.error('Error getting initial stats:', error);
      }

      // Hide QR code and show success
      this.io.emit('qr-hidden', { userId: this.userId });
      this.io.emit('bot-connected', { userId: this.userId });
    });

    this.client.on('authenticated', () => {
      console.log(`Bot ${this.userId} authenticated successfully`);
      this.io.emit('qr-hidden', { userId: this.userId });
    });

    this.client.on('auth_failure', (message) => {
      console.log(`Authentication failed for bot ${this.userId}:`, message);
      this.qrRetries++;
      
      if (this.qrRetries >= this.maxQrRetries) {
        this.io.emit('bot-error', { 
          userId: this.userId, 
          error: 'Authentication failed after multiple attempts. Please try again.' 
        });
      } else {
        this.io.emit('auth-failure', { 
          userId: this.userId, 
          message: `Authentication failed (attempt ${this.qrRetries}/${this.maxQrRetries}). Please scan the QR code again.` 
        });
      }
    });

    this.client.on('message', async (message) => {
      if (!this.isPaused) {
        await this.handleMessage(message);
      }
    });

    this.client.on('message_create', async (message) => {
      if (message.fromMe) {
        this.messageCount++;
      }
      
      // Store message for chat interface
      const chatId = message.from || message.to;
      if (!this.messages.has(chatId)) {
        this.messages.set(chatId, []);
      }
      
      const messageData = {
        id: message.id._serialized,
        body: message.body,
        timestamp: message.timestamp,
        fromMe: message.fromMe,
        type: message.type,
        hasMedia: message.hasMedia
      };
      
      this.messages.get(chatId).push(messageData);
      
      // Keep only last 100 messages per chat
      if (this.messages.get(chatId).length > 100) {
        this.messages.get(chatId).shift();
      }
      
      // Send to frontend
      this.io.emit('new-message', { 
        userId: this.userId, 
        chatId, 
        message: messageData 
      });
    });

    this.client.on('group_join', async (notification) => {
      if (this.settings.welcomeMessage && this.settings.notifyOnGroupJoin) {
        try {
          const chat = await notification.getChat();
          const welcomeText = this.settings.welcomeText || 'Welcome to our group!';
          await chat.sendMessage(`👋 ${welcomeText}`);
        } catch (error) {
          console.error('Error sending welcome message:', error);
        }
      }
    });

    this.client.on('disconnected', (reason) => {
      console.log(`Bot ${this.userId} disconnected:`, reason);
      this.isConnected = false;
      
      const user = users.find(u => u.id === this.userId);
      if (user) user.botConnected = false;

      this.io.emit('bot-disconnected', { userId: this.userId, reason });
    });

    this.client.on('loading_screen', (percent, message) => {
      console.log(`Loading screen for bot ${this.userId}: ${percent}% - ${message}`);
      this.io.emit('bot-loading', { userId: this.userId, percent, message });
    });
  }

  async handleMessage(message) {
    try {
      // Increment message count
      this.messageCount++;
      
      // Add user to active users
      this.activeUsers.add(message.from);

      // Check if user is banned
      if (this.bannedUsers.has(message.from)) {
        return;
      }

      // Anti-spam protection
      if (this.settings.antiSpam && this.isSpam(message)) {
        await message.reply('⚠️ Please slow down! You are sending messages too quickly.');
        return;
      }

      // Auto-read messages
      if (this.settings.autoRead) {
        await message.getChat().then(chat => chat.markUnread());
      }

      // Auto-react to messages
      if (this.settings.autoReact && Math.random() < 0.1) { // 10% chance
        const reactions = ['👍', '❤️', '😊', '🔥', '💯'];
        const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];
        try {
          await message.react(randomReaction);
        } catch (error) {
          // Ignore reaction errors
        }
      }

      // Handle commands
      if (message.body.startsWith(this.settings.prefix)) {
        await this.handleCommand(message);
      }
      // Handle non-prefix commands (like greetings)
      else {
        await this.handleNonPrefixCommand(message);
      }

      // Log message if enabled
      if (this.settings.logMessages) {
        this.logMessage(message);
      }

    } catch (error) {
      console.error('Error handling message:', error);
    }
  }

  async handleCommand(message) {
    const args = message.body.slice(this.settings.prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    
    // Get commands from plugin loader
    const commands = pluginLoader.getCommands();
    const command = commands.find(cmd => cmd.pattern && cmd.pattern.includes(commandName));
    
    if (!command) return;

    // Check if command is enabled
    if (!this.settings.enabledCommands[commandName]) {
      await message.reply('❌ This command is currently disabled!');
      return;
    }

    // Check admin permissions
    if (command.adminOnly || command.ownerOnly) {
      const contact = await message.getContact();
      if (contact.number !== this.settings.ownerNumber.replace(/\D/g, '')) {
        await message.reply('❌ This command requires admin privileges!');
        return;
      }
    }

    // Check work mode
    const chat = await message.getChat();
    if (this.settings.workMode === 'private' && chat.isGroup) {
      await message.reply('❌ This bot only works in private chats!');
      return;
    }
    if (this.settings.workMode === 'group-only' && !chat.isGroup) {
      await message.reply('❌ This bot only works in groups!');
      return;
    }

    // Check group/PM restrictions
    if (command.onlyGroup && !chat.isGroup) {
      await message.reply('❌ This command only works in groups!');
      return;
    }
    if (command.onlyPm && chat.isGroup) {
      await message.reply('❌ This command only works in private messages!');
      return;
    }

    try {
      // Send typing indicator
      if (this.settings.autoTyping) {
        await this.sendTyping(message);
      }

      // Add delay if configured
      if (this.settings.responseDelay > 0) {
        await new Promise(resolve => setTimeout(resolve, this.settings.responseDelay));
      }

      // React to command if specified
      if (command.React) {
        try {
          await message.react(command.React);
        } catch (error) {
          // Ignore reaction errors
        }
      }

      // Execute command
      await command.function(message, this.client, args);
      
      // Track command usage
      const count = this.commandsUsed.get(commandName) || 0;
      this.commandsUsed.set(commandName, count + 1);

      // Notify if enabled
      if (this.settings.notifyOnCommand) {
        console.log(`Command ${commandName} used by ${message.from}`);
      }

    } catch (error) {
      console.error(`Error executing command ${commandName}:`, error);
      await message.reply('❌ An error occurred while executing the command!');
      
      if (this.settings.notifyOnError) {
        console.error(`Command error: ${commandName} - ${error.message}`);
      }
    }
  }

  async handleNonPrefixCommand(message) {
    // Get commands from plugin loader
    const commands = pluginLoader.getCommands();
    const messageText = message.body.toLowerCase().trim();
    
    // Find non-prefix commands (like greetings)
    const nonPrefixCommand = commands.find(cmd => 
      cmd.fromMe === false && 
      cmd.pattern && 
      cmd.pattern.some(pattern => messageText.includes(pattern.toLowerCase()))
    );
    
    if (nonPrefixCommand) {
      try {
        // React to command if specified
        if (nonPrefixCommand.React) {
          try {
            await message.react(nonPrefixCommand.React);
          } catch (error) {
            // Ignore reaction errors
          }
        }

        // Execute command
        await nonPrefixCommand.function(message, this.client, []);
        
      } catch (error) {
        console.error('Error executing non-prefix command:', error);
      }
    }
    // Auto-reply for non-command messages
    else if (this.settings.autoReply && this.settings.autoReplyEnabled) {
      const chat = await message.getChat();
      if (!chat.isGroup) { // Only in private chats
        await this.sendTyping(message);
        await message.reply(this.settings.autoReplyText);
      }
    }
  }

  async sendTyping(message) {
    try {
      const chat = await message.getChat();
      await chat.sendStateTyping();
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Error sending typing indicator:', error);
    }
  }

  isSpam(message) {
    if (!this.settings.antiFlood) return false;
    
    const now = Date.now();
    const userMessages = messageHistory.get(message.from) || [];
    
    // Remove old messages (older than 1 minute)
    const recentMessages = userMessages.filter(time => now - time < 60000);
    
    // Add current message
    recentMessages.push(now);
    messageHistory.set(message.from, recentMessages);
    
    return recentMessages.length > this.settings.maxMessagesPerMinute;
  }

  logMessage(message) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      from: message.from,
      body: message.body,
      type: message.type,
      isGroup: message.from.includes('@g.us')
    };
    
    // In production, save to database or file
    console.log('Message logged:', logEntry);
  }

  async generateQR() {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        console.error(`QR code generation timeout for user ${this.userId}`);
        reject(new Error('QR code generation timeout. Please try again.'));
      }, 60000);

      const onQR = (qr) => {
        clearTimeout(timeout);
        this.client.removeListener('ready', onReady);
        QRCode.toDataURL(qr, (err, url) => {
          if (err) {
            console.error('QR code conversion error:', err);
            reject(err);
          } else {
            console.log(`QR code generated successfully for user ${this.userId}`);
            resolve(url);
          }
        });
      };

      const onReady = () => {
        clearTimeout(timeout);
        this.client.removeListener('qr', onQR);
        console.log(`Bot ${this.userId} already authenticated`);
        resolve(null);
      };

      const onAuthFailure = (message) => {
        clearTimeout(timeout);
        this.client.removeListener('qr', onQR);
        this.client.removeListener('ready', onReady);
        console.error(`Authentication failure for user ${this.userId}:`, message);
        reject(new Error(`Authentication failed: ${message}`));
      };

      this.client.once('qr', onQR);
      this.client.once('ready', onReady);
      this.client.once('auth_failure', onAuthFailure);
    });
  }

  async generatePairingCode(phoneNumber) {
    try {
      throw new Error('Pairing code method not supported with whatsapp-web.js. Please use QR code method.');
    } catch (error) {
      throw error;
    }
  }

  async disconnect() {
    try {
      console.log(`Disconnecting bot for user ${this.userId}...`);
      if (this.client) {
        await this.client.destroy();
      }
      this.isConnected = false;
      
      const user = users.find(u => u.id === this.userId);
      if (user) user.botConnected = false;
      
      console.log(`Bot ${this.userId} disconnected successfully`);
    } catch (error) {
      console.error('Error disconnecting bot:', error);
    }
  }

  pause() {
    this.isPaused = true;
    console.log(`Bot ${this.userId} paused`);
  }

  resume() {
    this.isPaused = false;
    console.log(`Bot ${this.userId} resumed`);
  }

  async restart() {
    console.log(`Restarting bot ${this.userId}...`);
    await this.disconnect();
    setTimeout(async () => {
      await this.initialize();
    }, 2000);
  }

  async getStats() {
    const uptime = Math.floor((Date.now() - this.startTime) / 1000);
    const commandStats = Object.fromEntries(this.commandsUsed);
    
    return {
      uptime,
      totalUsers: this.userCount,
      totalGroups: this.groupCount,
      totalCommands: Array.from(this.commandsUsed.values()).reduce((a, b) => a + b, 0),
      messageCount: this.messageCount,
      activeUsers: this.activeUsers.size,
      bannedUsers: this.bannedUsers.size,
      commandStats,
      ramUsage: Math.floor(Math.random() * 30) + 40,
      cpuUsage: Math.floor(Math.random() * 20) + 10,
      isPaused: this.isPaused
    };
  }

  getSettings() {
    return this.settings;
  }

  async updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    
    // Update config
    this.config = { ...this.config, ...newSettings };
    
    // Save settings to file
    try {
      const settingsPath = path.join(__dirname, 'data', `${this.userId}_settings.json`);
      await fs.ensureDir(path.dirname(settingsPath));
      await fs.writeJson(settingsPath, this.settings, { spaces: 2 });
      
      // Save config
      const configPath = path.join(__dirname, 'config/config.json');
      await fs.ensureDir(path.dirname(configPath));
      await fs.writeJson(configPath, this.config, { spaces: 2 });
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }

  async getChats() {
    return this.chats;
  }

  async getChatMessages(chatId) {
    return this.messages.get(chatId) || [];
  }

  async sendMessage(chatId, message) {
    try {
      if (!this.client || !this.isConnected) {
        throw new Error('Bot not connected');
      }
      
      await this.client.sendMessage(chatId, message);
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }
}

// Initialize directories
async function initializeServer() {
  try {
    await fs.ensureDir(path.join(__dirname, 'data'));
    await fs.ensureDir(path.join(__dirname, 'sessions'));
    await fs.ensureDir(path.join(__dirname, 'uploads'));
    await fs.ensureDir(path.join(__dirname, 'downloads'));
    await fs.ensureDir(path.join(__dirname, 'config'));
    await fs.ensureDir(path.join(__dirname, 'Connect/lib'));
    await fs.ensureDir(path.join(__dirname, 'Connect/plugin'));
    await fs.ensureDir(path.join(__dirname, 'Connect/language'));
    await fs.ensureDir(path.join(__dirname, 'Connect/database/react'));
    console.log('✅ Server directories initialized');
  } catch (error) {
    console.error('❌ Error initializing directories:', error);
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
    
    // Check for admin login
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const token = jwt.sign({ admin: true, username: ADMIN_USERNAME }, JWT_SECRET);
      return res.json({ 
        token, 
        admin: true,
        user: {
          id: 'admin',
          username: ADMIN_USERNAME,
          email: ADMIN_EMAIL,
          isAdmin: true
        }
      });
    }
    
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
      const token = jwt.sign({ admin: true, username: ADMIN_USERNAME }, JWT_SECRET);
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
    const { method } = req.body;
    const userId = req.user.userId || req.user.username;
    
    console.log(`Bot connection request from user ${userId} using method: ${method}`);
    
    if (activeBots.has(userId)) {
      const existingBot = activeBots.get(userId);
      if (existingBot.isConnected) {
        return res.status(400).json({ error: 'Bot already connected' });
      }
      await existingBot.disconnect();
      activeBots.delete(userId);
    }
    
    const bot = new AdvancedWhatsAppBot(userId, io);
    activeBots.set(userId, bot);
    
    if (method === 'qr') {
      try {
        await bot.initialize();
        const qrCode = await bot.generateQR();
        if (qrCode) {
          res.json({ qrCode });
        } else {
          res.json({ message: 'Bot is already authenticated' });
        }
      } catch (error) {
        console.error(`QR generation error for user ${userId}:`, error);
        activeBots.delete(userId);
        res.status(500).json({ error: error.message });
      }
    } else if (method === 'pairing') {
      return res.status(400).json({ error: 'Pairing code method not supported. Please use QR code method.' });
    } else {
      return res.status(400).json({ error: 'Invalid connection method' });
    }
  } catch (error) {
    console.error('Bot connection error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/bot/disconnect', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.username;
    const bot = activeBots.get(userId);
    
    if (bot) {
      await bot.disconnect();
      activeBots.delete(userId);
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Bot disconnect error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/bot/pause', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.username;
    const bot = activeBots.get(userId);
    
    if (bot) {
      bot.pause();
      res.json({ success: true, paused: true });
    } else {
      res.status(404).json({ error: 'Bot not found' });
    }
  } catch (error) {
    console.error('Bot pause error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/bot/resume', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.username;
    const bot = activeBots.get(userId);
    
    if (bot) {
      bot.resume();
      res.json({ success: true, paused: false });
    } else {
      res.status(404).json({ error: 'Bot not found' });
    }
  } catch (error) {
    console.error('Bot resume error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/bot/restart', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.username;
    const bot = activeBots.get(userId);
    
    if (bot) {
      await bot.restart();
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Bot not found' });
    }
  } catch (error) {
    console.error('Bot restart error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/bot/status', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.username;
    const bot = activeBots.get(userId);
    
    if (!bot || !bot.isConnected) {
      return res.json({ 
        connected: false, 
        stats: { 
          uptime: 0, 
          totalUsers: 0, 
          totalGroups: 0,
          totalCommands: 0, 
          messageCount: 0,
          activeUsers: 0,
          bannedUsers: 0,
          ramUsage: 0, 
          cpuUsage: 0,
          isPaused: false
        } 
      });
    }
    
    const stats = await bot.getStats();
    
    res.json({ 
      connected: true, 
      stats 
    });
  } catch (error) {
    console.error('Bot status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Bot Settings Routes
app.get('/api/bot/settings', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.username;
    const bot = activeBots.get(userId);
    
    if (!bot) {
      const defaultBot = new AdvancedWhatsAppBot(userId, io);
      return res.json(defaultBot.getSettings());
    }
    
    res.json(bot.getSettings());
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/bot/settings', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.username;
    let bot = activeBots.get(userId);
    
    if (!bot) {
      bot = new AdvancedWhatsAppBot(userId, io);
      activeBots.set(userId, bot);
    }
    
    await bot.updateSettings(req.body);
    res.json({ success: true });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Chat Routes
app.get('/api/bot/chats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.username;
    const bot = activeBots.get(userId);
    
    if (!bot || !bot.isConnected) {
      return res.status(400).json({ error: 'Bot not connected' });
    }
    
    const chats = await bot.getChats();
    res.json(chats);
  } catch (error) {
    console.error('Get chats error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/bot/chats/:chatId/messages', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.username;
    const { chatId } = req.params;
    const bot = activeBots.get(userId);
    
    if (!bot || !bot.isConnected) {
      return res.status(400).json({ error: 'Bot not connected' });
    }
    
    const messages = await bot.getChatMessages(chatId);
    res.json(messages);
  } catch (error) {
    console.error('Get chat messages error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/bot/chats/:chatId/send', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.username;
    const { chatId } = req.params;
    const { message } = req.body;
    const bot = activeBots.get(userId);
    
    if (!bot || !bot.isConnected) {
      return res.status(400).json({ error: 'Bot not connected' });
    }
    
    await bot.sendMessage(chatId, message);
    res.json({ success: true });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Plugin management routes
app.get('/api/bot/plugins', authenticateToken, async (req, res) => {
  try {
    const commands = pluginLoader.getCommands();
    res.json({ commands });
  } catch (error) {
    console.error('Get plugins error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/bot/plugins/reload', authenticateToken, async (req, res) => {
  try {
    await pluginLoader.reloadPlugins();
    res.json({ success: true, message: 'Plugins reloaded successfully' });
  } catch (error) {
    console.error('Reload plugins error:', error);
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
    
    const totalUsers = users.length;
    const connectedBots = activeBots.size;
    
    res.json({
      totalUsers,
      connectedBots,
      ramUsage: Math.floor(Math.random() * 30) + 50,
      cpuUsage: Math.floor(Math.random() * 40) + 20,
      totalMemory: 8,
      usedMemory: 5
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Scheduled tasks
cron.schedule('* * * * *', () => {
  activeBots.forEach(bot => {
    if (bot.isConnected) {
      bot.processScheduledMessages && bot.processScheduledMessages();
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
async function startServer() {
  try {
    await initializeServer();
    
    const PORT = process.env.PORT || 3001;
    server.listen(PORT, () => {
      console.log(`🚀 Advanced WhatsApp Bot Backend Server running on port ${PORT}`);
      console.log(`📱 API Base URL: http://localhost:${PORT}/api`);
      console.log(`💡 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`👤 Demo Login: demo@example.com / password`);
      console.log(`👑 Admin Login: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
      console.log(`🤖 WhatsApp Web.js Integration: Active`);
      console.log(`🔌 Plugin System: Loaded`);
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