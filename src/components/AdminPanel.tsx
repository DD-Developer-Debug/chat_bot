import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Shield, 
  Users, 
  Activity, 
  Server, 
  LogOut, 
  TrendingUp,
  Cpu,
  HardDrive
} from 'lucide-react';

interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  botConnected: boolean;
}

interface AdminStats {
  totalUsers: number;
  connectedBots: number;
  ramUsage: number;
  cpuUsage: number;
  totalMemory: number;
  usedMemory: number;
}

// Mock data for demo
const mockUsers: User[] = [
  {
    id: '1',
    username: 'demo',
    email: 'demo@example.com',
    createdAt: new Date().toISOString(),
    botConnected: true
  },
  {
    id: '2',
    username: 'user2',
    email: 'user2@example.com',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    botConnected: false
  },
  {
    id: '3',
    username: 'user3',
    email: 'user3@example.com',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    botConnected: true
  }
];

export default function AdminPanel() {
  const { logout } = useAuth();
  const [users] = useState<User[]>(mockUsers);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 3,
    connectedBots: 2,
    ramUsage: 65,
    cpuUsage: 35,
    totalMemory: 8,
    usedMemory: 5
  });

  useEffect(() => {
    // Mock stats update
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        ramUsage: Math.floor(Math.random() * 30) + 50,
        cpuUsage: Math.floor(Math.random() * 40) + 20,
        connectedBots: Math.floor(Math.random() * 3) + 1
      }));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-red-500 to-orange-500 w-12 h-12 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
                <p className="text-white/70">System Administration Dashboard</p>
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

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
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
                <p className="text-white/70 text-sm">Connected Bots</p>
                <p className="text-2xl font-bold text-white">{stats.connectedBots}</p>
              </div>
              <Activity className="w-8 h-8 text-green-400" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">CPU Usage</p>
                <p className="text-2xl font-bold text-white">{stats.cpuUsage}%</p>
              </div>
              <Cpu className="w-8 h-8 text-orange-400" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">RAM Usage</p>
                <p className="text-2xl font-bold text-white">{stats.ramUsage}%</p>
              </div>
              <HardDrive className="w-8 h-8 text-purple-400" />
            </div>
          </div>
        </div>

        {/* System Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">System Health</h3>
              
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
                
                <div className="pt-2 border-t border-white/20">
                  <div className="text-sm text-white/70">
                    Memory: {stats.usedMemory}GB / {stats.totalMemory}GB
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Platform Overview</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-white/5 rounded-lg">
                  <Server className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{stats.connectedBots}</p>
                  <p className="text-white/70 text-sm">Active Bots</p>
                </div>
                
                <div className="text-center p-4 bg-white/5 rounded-lg">
                  <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{Math.round((stats.connectedBots / stats.totalUsers) * 100)}%</p>
                  <p className="text-white/70 text-sm">Connection Rate</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
          <h2 className="text-xl font-bold text-white mb-4">User Management</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left py-3 px-4 text-white/70 font-medium">Username</th>
                  <th className="text-left py-3 px-4 text-white/70 font-medium">Email</th>
                  <th className="text-left py-3 px-4 text-white/70 font-medium">Bot Status</th>
                  <th className="text-left py-3 px-4 text-white/70 font-medium">Joined</th>
                  <th className="text-left py-3 px-4 text-white/70 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-white/10 hover:bg-white/5">
                    <td className="py-3 px-4 text-white">{user.username}</td>
                    <td className="py-3 px-4 text-white/70">{user.email}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.botConnected 
                          ? 'bg-green-500/20 text-green-300 border border-green-500/50' 
                          : 'bg-red-500/20 text-red-300 border border-red-500/50'
                      }`}>
                        {user.botConnected ? 'Connected' : 'Disconnected'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-white/70">{formatDate(user.createdAt)}</td>
                    <td className="py-3 px-4">
                      <button className="text-blue-400 hover:text-blue-300 text-sm">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}