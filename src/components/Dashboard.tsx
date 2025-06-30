import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Bot, 
  QrCode, 
  Smartphone, 
  Settings, 
  BarChart3, 
  MessageSquare, 
  Users, 
  Activity, 
  LogOut,
  Wifi,
  WifiOff,
  Send,
  Search,
  MoreVertical,
  Phone,
  Video,
  Paperclip,
  Smile,
  ArrowLeft,
  CheckCheck,
  Check,
  Clock,
  User,
  Github,
  Mail,
  Globe,
  Heart,
  Star,
  Code,
  Zap,
  Shield,
  Cpu,
  HardDrive,
  Download,
  Upload,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
  MessageCircle,
  Calendar,
  MapPin,
  Award,
  Briefcase
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
  profilePicUrl?: string;
}

interface Message {
  id: string;
  body: string;
  timestamp: number;
  fromMe: boolean;
  type: string;
  hasMedia: boolean;
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
  autoReplyText: string;
  autoReplyEnabled: boolean;
  welcomeText: string;
  enabledCommands: Record<string, boolean>;
  workMode: string;
  responseDelay: number;
  maxMessagesPerMinute: number;
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
  maxDownloadSize: string;
  allowedFileTypes: string[];
  autoDownloadMedia: boolean;
  compressImages: boolean;
  logMessages: boolean;
  saveMedia: boolean;
  notifyOnCommand: boolean;
  notifyOnError: boolean;
  notifyOnNewUser: boolean;
  notifyOnGroupJoin: boolean;
}

export default function Dashboard() {
  const { user, logout, token } = useAuth();
  const [activeTab, setActiveTab] = useState('connect');
  const [botConnected, setBotConnected] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [showQR, setShowQR] = useState(false);
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
    autoReplyText: 'Hello! I am currently unavailable. I will get back to you soon.',
    autoReplyEnabled: false,
    welcomeText: 'Welcome to our group! Please read the rules and enjoy your stay.',
    enabledCommands: {},
    workMode: 'public',
    responseDelay: 1000,
    maxMessagesPerMinute: 10,
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
    maxDownloadSize: '100MB',
    allowedFileTypes: ['image', 'video', 'audio', 'document'],
    autoDownloadMedia: false,
    compressImages: true,
    logMessages: true,
    saveMedia: true,
    notifyOnCommand: true,
    notifyOnError: true,
    notifyOnNewUser: false,
    notifyOnGroupJoin: true
  });
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Initialize Socket.IO connection
    const socket = new WebSocket(`ws://localhost:3001`);
    
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'qr-code' && data.userId === user?.id) {
        setQrCode(data.qrCode);
        setShowQR(true);
      } else if (data.type === 'qr-hidden' && data.userId === user?.id) {
        setShowQR(false);
        setQrCode('');
      } else if (data.type === 'bot-connected' && data.userId === user?.id) {
        setBotConnected(true);
        setLoading(false);
        setError('');
        setShowQR(false);
        fetchChats();
      } else if (data.type === 'bot-disconnected' && data.userId === user?.id) {
        setBotConnected(false);
      } else if (data.type === 'chats-updated' && data.userId === user?.id) {
        setChats(data.chats);
      } else if (data.type === 'new-message' && data.userId === user?.id) {
        if (selectedChat && data.chatId === selectedChat.id) {
          setMessages(prev => [...prev, data.message]);
        }
      } else if (data.type === 'bot-error' && data.userId === user?.id) {
        setError(data.error);
        setLoading(false);
      }
    };

    // Check initial bot status
    checkBotStatus();
    fetchSettings();

    return () => {
      socket.close();
    };
  }, [user?.id]);

  const checkBotStatus = async () => {
    try {
      const response = await fetch('/api/bot/status', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setBotConnected(data.connected);
        setStats(data.stats);
        
        if (data.connected) {
          fetchChats();
        }
      }
    } catch (error) {
      console.error('Error checking bot status:', error);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/bot/settings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const fetchChats = async () => {
    try {
      const response = await fetch('/api/bot/chats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setChats(data);
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
    }
  };

  const fetchMessages = async (chatId: string) => {
    try {
      const response = await fetch(`/api/bot/chats/${chatId}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const connectBot = async (method: 'qr' | 'pairing') => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/bot/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ method })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Connection failed');
      }
      
      const data = await response.json();
      
      if (data.qrCode) {
        setQrCode(data.qrCode);
        setShowQR(true);
      } else if (data.message) {
        setBotConnected(true);
        setLoading(false);
        fetchChats();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed');
      setLoading(false);
    }
  };

  const disconnectBot = async () => {
    try {
      const response = await fetch('/api/bot/disconnect', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        setBotConnected(false);
        setQrCode('');
        setShowQR(false);
        setChats([]);
        setSelectedChat(null);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error disconnecting bot:', error);
    }
  };

  const updateSettings = async (newSettings: Partial<BotSettings>) => {
    try {
      const response = await fetch('/api/bot/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newSettings)
      });
      
      if (response.ok) {
        setSettings(prev => ({ ...prev, ...newSettings }));
      }
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;
    
    try {
      const response = await fetch(`/api/bot/chats/${selectedChat.id}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: newMessage })
      });
      
      if (response.ok) {
        setNewMessage('');
        // Message will be added via socket event
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const selectChat = (chat: Chat) => {
    setSelectedChat(chat);
    fetchMessages(chat.id);
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 24 * 60 * 60 * 1000) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
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
                <h1 className="text-2xl font-bold text-white">Queen Bot Dashboard</h1>
                <p className="text-white/70">Welcome back, {user?.username}!</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {botConnected ? (
                  <div className="flex items-center space-x-2 text-green-400">
                    <Wifi className="w-5 h-5" />
                    <span className="text-sm font-medium">Connected</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 text-red-400">
                    <WifiOff className="w-5 h-5" />
                    <span className="text-sm font-medium">Disconnected</span>
                  </div>
                )}
              </div>
              <button
                onClick={logout}
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-2 mb-6">
          <div className="flex space-x-2 overflow-x-auto">
            {[
              { id: 'connect', label: 'Connect', icon: QrCode },
              { id: 'chats', label: 'Chats', icon: MessageSquare },
              { id: 'stats', label: 'Statistics', icon: BarChart3 },
              { id: 'settings', label: 'Settings', icon: Settings },
              { id: 'developer', label: 'Developer', icon: Code }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Connect Tab */}
          {activeTab === 'connect' && (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-4">Connect Your WhatsApp</h2>
                <p className="text-white/70 mb-8">Choose a method to connect your WhatsApp account</p>
                
                {!botConnected ? (
                  <div className="space-y-6">
                    {showQR && qrCode ? (
                      <div className="max-w-md mx-auto">
                        <div className="bg-white p-6 rounded-2xl shadow-2xl">
                          <img src={qrCode} alt="QR Code" className="w-full h-auto" />
                        </div>
                        <p className="text-white/70 mt-4">Scan this QR code with your WhatsApp</p>
                        <div className="flex justify-center mt-4">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                        <button
                          onClick={() => connectBot('qr')}
                          disabled={loading}
                          className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-6 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <QrCode className="w-12 h-12 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold mb-2">QR Code</h3>
                          <p className="text-sm opacity-90">Scan QR code with WhatsApp</p>
                        </button>
                        
                        <button
                          onClick={() => connectBot('pairing')}
                          disabled={true}
                          className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-6 rounded-xl opacity-50 cursor-not-allowed"
                        >
                          <Smartphone className="w-12 h-12 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold mb-2">Pairing Code</h3>
                          <p className="text-sm opacity-90">Coming Soon</p>
                        </button>
                      </div>
                    )}
                    
                    {loading && !showQR && (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                        <span className="text-white">Initializing bot...</span>
                      </div>
                    )}
                    
                    {error && (
                      <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 max-w-md mx-auto">
                        <p className="text-red-300">{error}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-6 max-w-md mx-auto">
                      <div className="flex items-center justify-center space-x-2 mb-4">
                        <Wifi className="w-6 h-6 text-green-400" />
                        <span className="text-green-400 font-semibold">Bot Connected Successfully!</span>
                      </div>
                      <p className="text-white/70">Your WhatsApp bot is now active and ready to use.</p>
                    </div>
                    
                    <button
                      onClick={disconnectBot}
                      className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                      Disconnect Bot
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Chats Tab */}
          {activeTab === 'chats' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
              {/* Chat List */}
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 flex flex-col">
                <div className="p-4 border-b border-white/20">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search chats..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto">
                  {botConnected ? (
                    filteredChats.length > 0 ? (
                      filteredChats.map((chat) => (
                        <div
                          key={chat.id}
                          onClick={() => selectChat(chat)}
                          className={`p-4 border-b border-white/10 cursor-pointer hover:bg-white/5 transition-colors ${
                            selectedChat?.id === chat.id ? 'bg-white/10' : ''
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                              {chat.isGroup ? (
                                <Users className="w-6 h-6 text-white" />
                              ) : (
                                <span className="text-white font-semibold">
                                  {chat.name.charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h3 className="text-white font-medium truncate">{chat.name}</h3>
                                {chat.lastMessage && (
                                  <span className="text-white/50 text-xs">
                                    {formatTime(chat.lastMessage.timestamp)}
                                  </span>
                                )}
                              </div>
                              {chat.lastMessage && (
                                <p className="text-white/70 text-sm truncate">
                                  {chat.lastMessage.fromMe ? 'You: ' : ''}
                                  {chat.lastMessage.body}
                                </p>
                              )}
                            </div>
                            {chat.unreadCount > 0 && (
                              <div className="bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                {chat.unreadCount}
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-white/50">No chats found</p>
                      </div>
                    )
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-white/50">Connect your bot to view chats</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Chat Messages */}
              <div className="lg:col-span-2 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 flex flex-col">
                {selectedChat ? (
                  <>
                    {/* Chat Header */}
                    <div className="p-4 border-b border-white/20 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => setSelectedChat(null)}
                          className="lg:hidden p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg"
                        >
                          <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                          {selectedChat.isGroup ? (
                            <Users className="w-5 h-5 text-white" />
                          ) : (
                            <span className="text-white font-semibold">
                              {selectedChat.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <h3 className="text-white font-medium">{selectedChat.name}</h3>
                          <p className="text-white/50 text-sm">
                            {selectedChat.isGroup ? 'Group' : 'Contact'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg">
                          <Phone className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg">
                          <Video className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.fromMe ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                              message.fromMe
                                ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                                : 'bg-white/20 text-white'
                            }`}
                          >
                            <p className="text-sm">{message.body}</p>
                            <div className="flex items-center justify-end space-x-1 mt-1">
                              <span className="text-xs opacity-70">
                                {formatTime(message.timestamp)}
                              </span>
                              {message.fromMe && (
                                <CheckCheck className="w-3 h-3 opacity-70" />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Message Input */}
                    <div className="p-4 border-t border-white/20">
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg">
                          <Paperclip className="w-5 h-5" />
                        </button>
                        <div className="flex-1 relative">
                          <input
                            type="text"
                            placeholder="Type a message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                            className="w-full bg-white/10 border border-white/20 rounded-full px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                          <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-white/70 hover:text-white">
                            <Smile className="w-5 h-5" />
                          </button>
                        </div>
                        <button
                          onClick={sendMessage}
                          disabled={!newMessage.trim()}
                          className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Send className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <MessageSquare className="w-16 h-16 text-white/30 mx-auto mb-4" />
                      <p className="text-white/50">Select a chat to start messaging</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Statistics Tab */}
          {activeTab === 'stats' && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/70 text-sm">Uptime</p>
                      <p className="text-2xl font-bold text-white">{formatUptime(stats.uptime)}</p>
                    </div>
                    <Activity className="w-8 h-8 text-green-400" />
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/70 text-sm">Total Users</p>
                      <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
                    </div>
                    <Users className="w-8 h-8 text-blue-400" />
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/70 text-sm">Messages</p>
                      <p className="text-2xl font-bold text-white">{stats.messageCount}</p>
                    </div>
                    <MessageSquare className="w-8 h-8 text-purple-400" />
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/70 text-sm">Commands</p>
                      <p className="text-2xl font-bold text-white">{stats.totalCommands}</p>
                    </div>
                    <Bot className="w-8 h-8 text-orange-400" />
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">System Performance</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-white/70">CPU Usage</span>
                        <span className="text-white">{stats.cpuUsage}%</span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full"
                          style={{ width: `${stats.cpuUsage}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-white/70">RAM Usage</span>
                        <span className="text-white">{stats.ramUsage}%</span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full"
                          style={{ width: `${stats.ramUsage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Bot Activity</h3>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-white/70">Active Users</span>
                      <span className="text-white font-medium">{stats.activeUsers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Total Groups</span>
                      <span className="text-white font-medium">{stats.totalGroups}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Banned Users</span>
                      <span className="text-white font-medium">{stats.bannedUsers}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* Basic Settings */}
              <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Basic Settings</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">Bot Name</label>
                    <input
                      type="text"
                      value={settings.botName}
                      onChange={(e) => updateSettings({ botName: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">Command Prefix</label>
                    <input
                      type="text"
                      value={settings.prefix}
                      onChange={(e) => updateSettings({ prefix: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">Language</label>
                    <select
                      value={settings.language}
                      onChange={(e) => updateSettings({ language: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="EN">English</option>
                      <option value="SI">Sinhala</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">Owner Number</label>
                    <input
                      type="text"
                      value={settings.ownerNumber}
                      onChange={(e) => updateSettings({ ownerNumber: e.target.value })}
                      placeholder="+1234567890"
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">Work Mode</label>
                    <select
                      value={settings.workMode}
                      onChange={(e) => updateSettings({ workMode: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="public">Public</option>
                      <option value="private">Private Only</option>
                      <option value="group-only">Groups Only</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">Response Delay (ms)</label>
                    <input
                      type="number"
                      value={settings.responseDelay}
                      onChange={(e) => updateSettings({ responseDelay: parseInt(e.target.value) })}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* Behavior Settings */}
              <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Behavior Settings</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { key: 'autoReact', label: 'Auto React', description: 'Automatically react to messages' },
                    { key: 'autoRead', label: 'Auto Read', description: 'Mark messages as read automatically' },
                    { key: 'autoTyping', label: 'Auto Typing', description: 'Show typing indicator' },
                    { key: 'welcomeMessage', label: 'Welcome Message', description: 'Send welcome message to new users' },
                    { key: 'antiLink', label: 'Anti Link', description: 'Block messages with links' },
                    { key: 'antiSpam', label: 'Anti Spam', description: 'Prevent spam messages' },
                    { key: 'antiFlood', label: 'Anti Flood', description: 'Prevent message flooding' },
                    { key: 'logMessages', label: 'Log Messages', description: 'Log all messages' },
                    { key: 'saveMedia', label: 'Save Media', description: 'Save downloaded media' }
                  ].map((setting) => (
                    <div key={setting.key} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                      <div>
                        <h4 className="text-white font-medium">{setting.label}</h4>
                        <p className="text-white/60 text-sm">{setting.description}</p>
                      </div>
                      <button
                        onClick={() => updateSettings({ [setting.key]: !settings[setting.key as keyof BotSettings] })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings[setting.key as keyof BotSettings] ? 'bg-purple-500' : 'bg-white/20'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings[setting.key as keyof BotSettings] ? 'translate-x-6' : 'translate-x-1'
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { key: 'aiChatbot', label: 'AI Chatbot', description: 'Enable AI-powered responses' },
                    { key: 'voiceToText', label: 'Voice to Text', description: 'Convert voice messages to text' },
                    { key: 'textToVoice', label: 'Text to Voice', description: 'Convert text to voice messages' },
                    { key: 'imageGeneration', label: 'Image Generation', description: 'Generate images from text' },
                    { key: 'weatherUpdates', label: 'Weather Updates', description: 'Provide weather information' },
                    { key: 'newsUpdates', label: 'News Updates', description: 'Send news updates' },
                    { key: 'reminderSystem', label: 'Reminder System', description: 'Set and manage reminders' },
                    { key: 'groupManagement', label: 'Group Management', description: 'Advanced group controls' },
                    { key: 'autoDownloadMedia', label: 'Auto Download Media', description: 'Automatically download media' }
                  ].map((setting) => (
                    <div key={setting.key} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                      <div>
                        <h4 className="text-white font-medium">{setting.label}</h4>
                        <p className="text-white/60 text-sm">{setting.description}</p>
                      </div>
                      <button
                        onClick={() => updateSettings({ [setting.key]: !settings[setting.key as keyof BotSettings] })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings[setting.key as keyof BotSettings] ? 'bg-purple-500' : 'bg-white/20'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings[setting.key as keyof BotSettings] ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Security Settings */}
              <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Security Settings</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    {[
                      { key: 'adminOnly', label: 'Admin Only Mode', description: 'Only admins can use the bot' },
                      { key: 'groupAdminOnly', label: 'Group Admin Only', description: 'Only group admins can use admin commands' },
                      { key: 'blockUnknown', label: 'Block Unknown', description: 'Block messages from unknown contacts' }
                    ].map((setting) => (
                      <div key={setting.key} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                        <div>
                          <h4 className="text-white font-medium">{setting.label}</h4>
                          <p className="text-white/60 text-sm">{setting.description}</p>
                        </div>
                        <button
                          onClick={() => updateSettings({ [setting.key]: !settings[setting.key as keyof BotSettings] })}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            settings[setting.key as keyof BotSettings] ? 'bg-purple-500' : 'bg-white/20'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              settings[setting.key as keyof BotSettings] ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">Max Messages Per Minute</label>
                      <input
                        type="number"
                        value={settings.maxMessagesPerMinute}
                        onChange={(e) => updateSettings({ maxMessagesPerMinute: parseInt(e.target.value) })}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">Max Download Size</label>
                      <select
                        value={settings.maxDownloadSize}
                        onChange={(e) => updateSettings({ maxDownloadSize: e.target.value })}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="50MB">50MB</option>
                        <option value="100MB">100MB</option>
                        <option value="200MB">200MB</option>
                        <option value="500MB">500MB</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Auto Reply Settings */}
              <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Auto Reply Settings</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">Enable Auto Reply</h4>
                      <p className="text-white/60 text-sm">Automatically reply to private messages</p>
                    </div>
                    <button
                      onClick={() => updateSettings({ autoReplyEnabled: !settings.autoReplyEnabled })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.autoReplyEnabled ? 'bg-purple-500' : 'bg-white/20'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.autoReplyEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">Auto Reply Message</label>
                    <textarea
                      value={settings.autoReplyText}
                      onChange={(e) => updateSettings({ autoReplyText: e.target.value })}
                      rows={3}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">Welcome Message</label>
                    <textarea
                      value={settings.welcomeText}
                      onChange={(e) => updateSettings({ welcomeText: e.target.value })}
                      rows={3}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Developer Tab */}
          {activeTab === 'developer' && (
            <div className="space-y-6">
              {/* Developer Profile */}
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8">
                <div className="text-center mb-8">
                  <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-12 h-12 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-2">DarkWinzo</h2>
                  <p className="text-white/70 text-lg">Full Stack Developer & Bot Creator</p>
                  <div className="flex items-center justify-center space-x-2 mt-2">
                    <MapPin className="w-4 h-4 text-white/50" />
                    <span className="text-white/50">Sri Lanka</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center p-4 bg-white/5 rounded-lg">
                    <Code className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                    <h3 className="text-white font-semibold">5+ Years</h3>
                    <p className="text-white/60 text-sm">Experience</p>
                  </div>
                  <div className="text-center p-4 bg-white/5 rounded-lg">
                    <Star className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                    <h3 className="text-white font-semibold">50+ Projects</h3>
                    <p className="text-white/60 text-sm">Completed</p>
                  </div>
                  <div className="text-center p-4 bg-white/5 rounded-lg">
                    <Heart className="w-8 h-8 text-red-400 mx-auto mb-2" />
                    <h3 className="text-white font-semibold">1000+ Users</h3>
                    <p className="text-white/60 text-sm">Happy Clients</p>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-white/80 text-lg mb-6">
                    Passionate developer specializing in WhatsApp automation, web development, and creating innovative solutions. 
                    Always excited to work on new projects and help bring ideas to life.
                  </p>
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Get In Touch
                  </h3>
                  
                  <div className="space-y-4">
                    <a 
                      href="mailto:isurulakshan9998@gmail.com"
                      className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors group"
                    >
                      <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                        <Mail className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-medium">Email</h4>
                        <p className="text-white/60 text-sm">isurulakshan9998@gmail.com</p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-white/40 group-hover:text-white/60" />
                    </a>

                    <a 
                      href="https://github.com/DarkWinzo"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors group"
                    >
                      <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center">
                        <Github className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-medium">GitHub</h4>
                        <p className="text-white/60 text-sm">github.com/DarkWinzo</p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-white/40 group-hover:text-white/60" />
                    </a>

                    <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                      <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                        <Globe className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-medium">Location</h4>
                        <p className="text-white/60 text-sm">Sri Lanka, Asia</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Briefcase className="w-5 h-5 mr-2" />
                    Services
                  </h3>
                  
                  <div className="space-y-3">
                    {[
                      { icon: Bot, title: 'WhatsApp Bot Development', desc: 'Custom bot solutions' },
                      { icon: Globe, title: 'Web Development', desc: 'Full-stack applications' },
                      { icon: Smartphone, title: 'Mobile Apps', desc: 'Cross-platform development' },
                      { icon: Shield, title: 'Security Solutions', desc: 'Secure implementations' },
                      { icon: Zap, title: 'API Integration', desc: 'Third-party services' },
                      { icon: Award, title: 'Consulting', desc: 'Technical guidance' }
                    ].map((service, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                        <service.icon className="w-6 h-6 text-purple-400" />
                        <div>
                          <h4 className="text-white font-medium text-sm">{service.title}</h4>
                          <p className="text-white/60 text-xs">{service.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Skills & Technologies */}
              <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Skills & Technologies</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {[
                    'JavaScript', 'TypeScript', 'Node.js', 'React', 'Python', 'PHP',
                    'MongoDB', 'MySQL', 'PostgreSQL', 'Redis', 'Docker', 'AWS',
                    'WhatsApp API', 'Telegram Bot', 'Discord Bot', 'REST API',
                    'GraphQL', 'Socket.IO', 'Express.js', 'Next.js', 'Vue.js', 'Angular'
                  ].map((skill) => (
                    <div key={skill} className="bg-white/5 rounded-lg p-3 text-center">
                      <span className="text-white text-sm font-medium">{skill}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Project Stats */}
              <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Project Statistics</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Code className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="text-2xl font-bold text-white">50+</h4>
                    <p className="text-white/60">Projects Completed</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Users className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="text-2xl font-bold text-white">1000+</h4>
                    <p className="text-white/60">Happy Clients</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Star className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="text-2xl font-bold text-white">4.9/5</h4>
                    <p className="text-white/60">Average Rating</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Calendar className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="text-2xl font-bold text-white">5+</h4>
                    <p className="text-white/60">Years Experience</p>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Send a Message</h3>
                
                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">Name</label>
                      <input
                        type="text"
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">Email</label>
                      <input
                        type="email"
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">Subject</label>
                    <input
                      type="text"
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Project inquiry"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">Message</label>
                    <textarea
                      rows={4}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Tell me about your project..."
                    />
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold py-3 px-4 rounded-lg hover:from-purple-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
                  >
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}