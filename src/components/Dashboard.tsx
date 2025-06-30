import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Bot, 
  QrCode, 
  Smartphone, 
  Activity, 
  Users, 
  MessageSquare, 
  Settings, 
  LogOut,
  Wifi,
  WifiOff,
  Play,
  Pause,
  RotateCcw,
  MessageCircle,
  Send,
  Phone,
  Mail,
  Github,
  ExternalLink,
  User,
  Shield,
  Zap,
  Globe,
  Command,
  Heart,
  Star,
  Coffee,
  Code,
  Headphones
} from 'lucide-react';

interface BotStats {
  uptime: number;
  totalUsers: number;
  totalGroups: number;
  totalCommands: number;
  messageCount: number;
  activeUsers: number;
  bannedUsers: number;
  ramUsage: number;
  cpuUsage: number;
}

interface BotSettings {
  botName: string;
  prefix: string;
  language: string;
  ownerNumber: string;
  autoReact: boolean;
  autoRead: boolean;
  autoTyping: boolean;
  welcomeMessage: boolean;
  antiLink: boolean;
  antiSpam: boolean;
  autoReply: boolean;
  aiChatbot: boolean;
  voiceToText: boolean;
  textToVoice: boolean;
  imageGeneration: boolean;
  weatherUpdates: boolean;
  newsUpdates: boolean;
  reminderSystem: boolean;
  groupManagement: boolean;
  adminOnly: boolean;
  groupAdminOnly: boolean;
  blockUnknown: boolean;
  antiFlood: boolean;
  maxMessagesPerMinute: number;
  maxDownloadSize: string;
  allowedFileTypes: string[];
  autoDownloadMedia: boolean;
  compressImages: boolean;
  responseDelay: number;
  workMode: string;
  logMessages: boolean;
  saveMedia: boolean;
  notifyOnCommand: boolean;
  notifyOnError: boolean;
  notifyOnNewUser: boolean;
  notifyOnGroupJoin: boolean;
  autoReplyText: string;
  autoReplyEnabled: boolean;
  welcomeText: string;
  enabledCommands: Record<string, boolean>;
}

interface Chat {
  id: string;
  name: string;
  isGroup: boolean;
  unreadCount: number;
  lastMessage?: {
    body: string;
    timestamp: number;
    fromMe: boolean;
  };
}

interface Message {
  id: string;
  body: string;
  timestamp: number;
  fromMe: boolean;
  type: string;
  hasMedia: boolean;
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [botConnected, setBotConnected] = useState(false);
  const [botPaused, setBotPaused] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [connectionMethod, setConnectionMethod] = useState('qr');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [pairingCode, setPairingCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<BotStats>({
    uptime: 0,
    totalUsers: 0,
    totalGroups: 0,
    totalCommands: 0,
    messageCount: 0,
    activeUsers: 0,
    bannedUsers: 0,
    ramUsage: 0,
    cpuUsage: 0
  });
  const [settings, setSettings] = useState<BotSettings>({
    botName: 'Queen Bot',
    prefix: '.',
    language: 'EN',
    ownerNumber: '',
    autoReact: true,
    autoRead: false,
    autoTyping: true,
    welcomeMessage: true,
    antiLink: false,
    antiSpam: true,
    autoReply: false,
    aiChatbot: false,
    voiceToText: false,
    textToVoice: false,
    imageGeneration: false,
    weatherUpdates: false,
    newsUpdates: false,
    reminderSystem: false,
    groupManagement: true,
    adminOnly: false,
    groupAdminOnly: false,
    blockUnknown: false,
    antiFlood: true,
    maxMessagesPerMinute: 10,
    maxDownloadSize: '100MB',
    allowedFileTypes: ['image', 'video', 'audio', 'document'],
    autoDownloadMedia: false,
    compressImages: true,
    responseDelay: 1000,
    workMode: 'public',
    logMessages: true,
    saveMedia: true,
    notifyOnCommand: true,
    notifyOnError: true,
    notifyOnNewUser: false,
    notifyOnGroupJoin: true,
    autoReplyText: 'Hello! I am currently unavailable. I will get back to you soon.',
    autoReplyEnabled: false,
    welcomeText: 'Welcome to our group! Please read the rules and enjoy your stay.',
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
      tagall: true
    }
  });
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    checkBotStatus();
    loadSettings();
    const interval = setInterval(() => {
      if (botConnected) {
        checkBotStatus();
        loadChats();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [botConnected]);

  const checkBotStatus = async () => {
    try {
      const response = await fetch('/api/bot/status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setBotConnected(data.connected);
      if (data.connected) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error checking bot status:', error);
    }
  };

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/bot/settings', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const loadChats = async () => {
    try {
      const response = await fetch('/api/bot/chats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setChats(data);
      }
    } catch (error) {
      console.error('Error loading chats:', error);
    }
  };

  const connectBot = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/bot/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          method: connectionMethod,
          phoneNumber: connectionMethod === 'pairing' ? phoneNumber : undefined
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        if (data.qrCode) {
          setQrCode(data.qrCode);
        }
        if (data.pairingCode) {
          setPairingCode(data.pairingCode);
        }
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError('Failed to connect bot');
    } finally {
      setLoading(false);
    }
  };

  const disconnectBot = async () => {
    try {
      await fetch('/api/bot/disconnect', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setBotConnected(false);
      setQrCode('');
      setPairingCode('');
    } catch (error) {
      console.error('Error disconnecting bot:', error);
    }
  };

  const pauseBot = () => {
    setBotPaused(!botPaused);
    // Implement pause/resume logic
  };

  const restartBot = async () => {
    await disconnectBot();
    setTimeout(() => {
      connectBot();
    }, 2000);
  };

  const updateSettings = async (newSettings: Partial<BotSettings>) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      const response = await fetch('/api/bot/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updatedSettings)
      });

      if (response.ok) {
        setSettings(updatedSettings);
      }
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  const sendMessage = async () => {
    if (!selectedChat || !newMessage.trim()) return;

    try {
      await fetch(`/api/bot/chats/${selectedChat.id}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ message: newMessage })
      });
      setNewMessage('');
      // Reload messages
      loadChatMessages(selectedChat.id);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const loadChatMessages = async (chatId: string) => {
    try {
      const response = await fetch(`/api/bot/chats/${chatId}/messages`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Bot Connection</h3>
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
            botConnected ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
          }`}>
            {botConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            <span className="text-sm font-medium">
              {botConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        {!botConnected ? (
          <div className="space-y-4">
            <div className="flex space-x-4">
              <button
                onClick={() => setConnectionMethod('qr')}
                className={`flex-1 p-3 rounded-lg border transition-colors ${
                  connectionMethod === 'qr'
                    ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                    : 'bg-white/5 border-white/20 text-white/70 hover:bg-white/10'
                }`}
              >
                <QrCode className="w-5 h-5 mx-auto mb-2" />
                <div className="text-sm font-medium">QR Code</div>
              </button>
              <button
                onClick={() => setConnectionMethod('pairing')}
                className={`flex-1 p-3 rounded-lg border transition-colors ${
                  connectionMethod === 'pairing'
                    ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                    : 'bg-white/5 border-white/20 text-white/70 hover:bg-white/10'
                }`}
              >
                <Smartphone className="w-5 h-5 mx-auto mb-2" />
                <div className="text-sm font-medium">Pairing Code</div>
              </button>
            </div>

            {connectionMethod === 'pairing' && (
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter phone number (e.g., +1234567890)"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            )}

            <button
              onClick={connectBot}
              disabled={loading || (connectionMethod === 'pairing' && !phoneNumber)}
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold py-3 px-4 rounded-lg hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Bot className="w-5 h-5 mr-2" />
                  Connect Bot
                </>
              )}
            </button>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            {qrCode && (
              <div className="text-center">
                <p className="text-white/70 mb-4">Scan this QR code with WhatsApp:</p>
                <img src={qrCode} alt="QR Code" className="mx-auto rounded-lg" />
              </div>
            )}

            {pairingCode && (
              <div className="text-center bg-white/10 rounded-lg p-4">
                <p className="text-white/70 mb-2">Enter this pairing code in WhatsApp:</p>
                <p className="text-2xl font-mono font-bold text-white">{pairingCode}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex space-x-3">
              <button
                onClick={pauseBot}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-lg transition-colors ${
                  botPaused 
                    ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30' 
                    : 'bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30'
                }`}
              >
                {botPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                <span>{botPaused ? 'Resume' : 'Pause'}</span>
              </button>
              <button
                onClick={restartBot}
                className="flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-lg bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Restart</span>
              </button>
              <button
                onClick={disconnectBot}
                className="flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-colors"
              >
                <WifiOff className="w-4 h-4" />
                <span>Disconnect</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      {botConnected && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Uptime</p>
                <p className="text-xl font-bold text-white">{formatUptime(stats.uptime)}</p>
              </div>
              <Activity className="w-8 h-8 text-green-400" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Total Users</p>
                <p className="text-xl font-bold text-white">{stats.totalUsers}</p>
              </div>
              <Users className="w-8 h-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Messages</p>
                <p className="text-xl font-bold text-white">{stats.messageCount}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-purple-400" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Commands</p>
                <p className="text-xl font-bold text-white">{stats.totalCommands}</p>
              </div>
              <Command className="w-8 h-8 text-orange-400" />
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      {/* Basic Settings */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Basic Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">Bot Name</label>
            <input
              type="text"
              value={settings.botName}
              onChange={(e) => updateSettings({ botName: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">Command Prefix</label>
            <input
              type="text"
              value={settings.prefix}
              onChange={(e) => updateSettings({ prefix: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">Language</label>
            <select
              value={settings.language}
              onChange={(e) => updateSettings({ language: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="EN" className="bg-gray-800">English</option>
              <option value="SI" className="bg-gray-800">Sinhala</option>
            </select>
          </div>
          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">Owner Number</label>
            <input
              type="tel"
              value={settings.ownerNumber}
              onChange={(e) => updateSettings({ ownerNumber: e.target.value })}
              placeholder="+1234567890"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Behavior Settings */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Behavior Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { key: 'autoReact', label: 'Auto React', icon: Heart },
            { key: 'autoRead', label: 'Auto Read', icon: MessageCircle },
            { key: 'autoTyping', label: 'Auto Typing', icon: MessageSquare },
            { key: 'welcomeMessage', label: 'Welcome Message', icon: Users },
            { key: 'antiLink', label: 'Anti Link', icon: Shield },
            { key: 'antiSpam', label: 'Anti Spam', icon: Shield },
            { key: 'autoReply', label: 'Auto Reply', icon: MessageCircle },
            { key: 'groupManagement', label: 'Group Management', icon: Users },
            { key: 'logMessages', label: 'Log Messages', icon: MessageSquare }
          ].map(({ key, label, icon: Icon }) => (
            <div key={key} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div className="flex items-center space-x-3">
                <Icon className="w-5 h-5 text-purple-400" />
                <span className="text-white/80">{label}</span>
              </div>
              <button
                onClick={() => updateSettings({ [key]: !settings[key as keyof BotSettings] })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings[key as keyof BotSettings] ? 'bg-purple-500' : 'bg-white/20'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings[key as keyof BotSettings] ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Advanced Features */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Advanced Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { key: 'aiChatbot', label: 'AI Chatbot', icon: Bot },
            { key: 'voiceToText', label: 'Voice to Text', icon: Headphones },
            { key: 'textToVoice', label: 'Text to Voice', icon: MessageCircle },
            { key: 'imageGeneration', label: 'Image Generation', icon: Star },
            { key: 'weatherUpdates', label: 'Weather Updates', icon: Globe },
            { key: 'newsUpdates', label: 'News Updates', icon: Globe },
            { key: 'reminderSystem', label: 'Reminder System', icon: Zap },
            { key: 'autoDownloadMedia', label: 'Auto Download Media', icon: MessageSquare },
            { key: 'compressImages', label: 'Compress Images', icon: Star }
          ].map(({ key, label, icon: Icon }) => (
            <div key={key} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div className="flex items-center space-x-3">
                <Icon className="w-5 h-5 text-blue-400" />
                <span className="text-white/80">{label}</span>
              </div>
              <button
                onClick={() => updateSettings({ [key]: !settings[key as keyof BotSettings] })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings[key as keyof BotSettings] ? 'bg-blue-500' : 'bg-white/20'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings[key as keyof BotSettings] ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Message Settings */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Message Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">Auto Reply Text</label>
            <textarea
              value={settings.autoReplyText}
              onChange={(e) => updateSettings({ autoReplyText: e.target.value })}
              rows={3}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">Welcome Text</label>
            <textarea
              value={settings.welcomeText}
              onChange={(e) => updateSettings({ welcomeText: e.target.value })}
              rows={3}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">Response Delay (ms)</label>
              <input
                type="number"
                value={settings.responseDelay}
                onChange={(e) => updateSettings({ responseDelay: parseInt(e.target.value) })}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">Max Messages/Minute</label>
              <input
                type="number"
                value={settings.maxMessagesPerMinute}
                onChange={(e) => updateSettings({ maxMessagesPerMinute: parseInt(e.target.value) })}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderChats = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
      {/* Chat List */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-4">
        <h3 className="text-lg font-semibold text-white mb-4">Chats</h3>
        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => {
                setSelectedChat(chat);
                loadChatMessages(chat.id);
              }}
              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                selectedChat?.id === chat.id
                  ? 'bg-purple-500/20 border border-purple-500/50'
                  : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{chat.name}</p>
                  {chat.lastMessage && (
                    <p className="text-white/60 text-sm truncate">
                      {chat.lastMessage.fromMe ? 'You: ' : ''}{chat.lastMessage.body}
                    </p>
                  )}
                </div>
                {chat.unreadCount > 0 && (
                  <span className="bg-purple-500 text-white text-xs rounded-full px-2 py-1 ml-2">
                    {chat.unreadCount}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="lg:col-span-2 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 flex flex-col">
        {selectedChat ? (
          <>
            <div className="p-4 border-b border-white/20">
              <h3 className="text-lg font-semibold text-white">{selectedChat.name}</h3>
              <p className="text-white/60 text-sm">
                {selectedChat.isGroup ? 'Group Chat' : 'Private Chat'}
              </p>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.fromMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.fromMe
                        ? 'bg-purple-500 text-white'
                        : 'bg-white/20 text-white'
                    }`}
                  >
                    <p className="text-sm">{message.body}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(message.timestamp * 1000).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-4 border-t border-white/20">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={sendMessage}
                  className="bg-purple-500 hover:bg-purple-600 text-white p-2 rounded-lg transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 text-white/40 mx-auto mb-4" />
              <p className="text-white/60">Select a chat to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderDeveloper = () => (
    <div className="space-y-6">
      {/* Developer Info */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
        <div className="text-center mb-6">
          <div className="bg-gradient-to-r from-purple-500 to-blue-500 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">DarkWinzo</h2>
          <p className="text-white/70">Full Stack Developer & Bot Creator</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-white/5 rounded-lg">
            <Code className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <p className="text-white font-semibold">5+ Years</p>
            <p className="text-white/60 text-sm">Experience</p>
          </div>
          <div className="text-center p-4 bg-white/5 rounded-lg">
            <Bot className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <p className="text-white font-semibold">50+ Bots</p>
            <p className="text-white/60 text-sm">Created</p>
          </div>
          <div className="text-center p-4 bg-white/5 rounded-lg">
            <Users className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-white font-semibold">10K+ Users</p>
            <p className="text-white/60 text-sm">Served</p>
          </div>
        </div>

        <div className="space-y-4">
          <a
            href="mailto:isurulakshan9998@gmail.com"
            className="flex items-center space-x-3 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors group"
          >
            <Mail className="w-6 h-6 text-red-400" />
            <div className="flex-1">
              <p className="text-white font-medium">Email</p>
              <p className="text-white/60 text-sm">isurulakshan9998@gmail.com</p>
            </div>
            <ExternalLink className="w-5 h-5 text-white/40 group-hover:text-white/60" />
          </a>

          <a
            href="https://github.com/DarkWinzo"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-3 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors group"
          >
            <Github className="w-6 h-6 text-gray-400" />
            <div className="flex-1">
              <p className="text-white font-medium">GitHub</p>
              <p className="text-white/60 text-sm">github.com/DarkWinzo</p>
            </div>
            <ExternalLink className="w-5 h-5 text-white/40 group-hover:text-white/60" />
          </a>

          <div className="flex items-center space-x-3 p-4 bg-white/5 rounded-lg">
            <Phone className="w-6 h-6 text-green-400" />
            <div className="flex-1">
              <p className="text-white font-medium">WhatsApp Support</p>
              <p className="text-white/60 text-sm">Available 24/7 for premium users</p>
            </div>
          </div>
        </div>
      </div>

      {/* Skills & Technologies */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Skills & Technologies</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            'JavaScript', 'TypeScript', 'Node.js', 'React',
            'Python', 'WhatsApp API', 'Bot Development', 'AI/ML',
            'Database Design', 'Cloud Computing', 'DevOps', 'UI/UX'
          ].map((skill) => (
            <div key={skill} className="bg-white/5 rounded-lg p-3 text-center">
              <p className="text-white/80 text-sm font-medium">{skill}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Support & Services */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Support & Services</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-white/5 rounded-lg">
            <Coffee className="w-8 h-8 text-yellow-400 mb-3" />
            <h4 className="text-white font-semibold mb-2">Custom Bot Development</h4>
            <p className="text-white/60 text-sm">Get a custom WhatsApp bot tailored to your specific needs</p>
          </div>
          <div className="p-4 bg-white/5 rounded-lg">
            <Headphones className="w-8 h-8 text-blue-400 mb-3" />
            <h4 className="text-white font-semibold mb-2">24/7 Support</h4>
            <p className="text-white/60 text-sm">Premium support for all your bot-related queries</p>
          </div>
          <div className="p-4 bg-white/5 rounded-lg">
            <Star className="w-8 h-8 text-purple-400 mb-3" />
            <h4 className="text-white font-semibold mb-2">Feature Requests</h4>
            <p className="text-white/60 text-sm">Suggest new features and improvements</p>
          </div>
          <div className="p-4 bg-white/5 rounded-lg">
            <Zap className="w-8 h-8 text-green-400 mb-3" />
            <h4 className="text-white font-semibold mb-2">Performance Optimization</h4>
            <p className="text-white/60 text-sm">Optimize your bot for better performance</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-purple-500 to-blue-500 w-12 h-12 rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">WhatsApp Bot Dashboard</h1>
                <p className="text-white/70">Welcome back, {user?.username}!</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-2 mb-6">
          <div className="flex space-x-2">
            {[
              { id: 'overview', label: 'Overview', icon: Activity },
              { id: 'settings', label: 'Settings', icon: Settings },
              { id: 'chats', label: 'Chats', icon: MessageCircle },
              { id: 'developer', label: 'Developer', icon: User }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === id
                    ? 'bg-purple-500 text-white'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="min-h-[600px]">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'settings' && renderSettings()}
          {activeTab === 'chats' && renderChats()}
          {activeTab === 'developer' && renderDeveloper()}
        </div>
      </div>
    </div>
  );
}