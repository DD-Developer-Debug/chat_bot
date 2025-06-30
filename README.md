# Advanced WhatsApp Bot Platform with whatsapp-web.js

A comprehensive WhatsApp bot management platform featuring real WhatsApp Web integration, advanced bot features, and a modern dashboard interface.

## 🚀 Features

### 🤖 Advanced Bot Capabilities
- **Real WhatsApp Integration** using whatsapp-web.js
- **Multi-language Support** (English/Sinhala)
- **Advanced Command System** with 20+ built-in commands
- **AI-Powered Features** (configurable)
- **Group Management** with admin controls
- **Anti-Spam Protection** with flood control
- **Media Processing** (stickers, downloads, compression)
- **Auto-Reply System** with customizable messages
- **Scheduled Messages** and reminder system
- **Voice & Text Processing** capabilities

### 📊 Dashboard Features
- **Real-time Statistics** monitoring
- **Live Chat Management** interface
- **Comprehensive Settings** panel
- **User & Group Analytics**
- **Command Usage Tracking**
- **System Health Monitoring**
- **Admin Panel** for platform management

### 🔧 Technical Features
- **Separate Frontend/Backend** architecture
- **Socket.IO** for real-time updates
- **JWT Authentication** with role-based access
- **File Upload/Download** system
- **Session Management** with persistence
- **Error Handling** and logging
- **Responsive Design** with modern UI

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ installed
- Chrome/Chromium browser (for Puppeteer)
- npm or yarn package manager

### Backend Setup

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start the backend server:**
```bash
npm start
```

The backend will run on `http://localhost:3001`

### Frontend Setup

1. **In a new terminal, navigate to project root:**
```bash
cd ..
```

2. **Install frontend dependencies:**
```bash
npm install
```

3. **Start the frontend development server:**
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## 📱 Demo Accounts

### User Account
- **Email:** demo@example.com
- **Password:** password

### Admin Account
- **Username:** DarkWinzo
- **Password:** 20030210

## 🤖 Bot Commands

### Utility Commands
- `.ping` - Check bot response time
- `.help [command]` - Show available commands
- `.info` - Display bot information
- `.weather <city>` - Get weather information

### Media Commands
- `.sticker` - Convert image/video to sticker (reply to media)
- `.download` - Download media from URLs

### Group Management (Admin Only)
- `.kick @user` - Remove user from group
- `.ban @user` - Ban user from using bot
- `.unban @user` - Unban user
- `.promote @user` - Promote user to admin
- `.demote @user` - Demote user from admin
- `.everyone <message>` - Tag all group members
- `.mute @user` - Mute user in group
- `.unmute @user` - Unmute user in group

### Advanced Features
- `.ai <message>` - AI-powered chat responses
- `.translate <text>` - Translate text to different languages
- `.news` - Get latest news updates
- `.reminder <time> <message>` - Set reminders

## ⚙️ Configuration

### Bot Settings Categories

#### Basic Settings
- Bot name and prefix customization
- Language selection (EN/SI)
- Owner number configuration

#### Behavior Settings
- Auto-react to messages
- Auto-read messages
- Auto-typing indicators
- Welcome messages for new users
- Anti-link and anti-spam protection

#### Advanced Features
- AI chatbot integration
- Voice-to-text conversion
- Text-to-voice synthesis
- Image generation from text
- Weather and news updates
- Reminder system
- Group management tools

#### Security Settings
- Admin-only mode
- Unknown contact blocking
- Anti-flood protection
- Message rate limiting

#### Media Settings
- File size limits
- Allowed file types
- Auto-download settings
- Image compression

#### Command Management
- Enable/disable individual commands
- Custom command responses
- Usage tracking and analytics

## 🔌 API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `POST /api/admin/login` - Admin login

### Bot Management
- `POST /api/bot/connect` - Connect WhatsApp bot
- `POST /api/bot/disconnect` - Disconnect bot
- `GET /api/bot/status` - Get bot status and statistics
- `GET /api/bot/settings` - Get bot configuration
- `POST /api/bot/settings` - Update bot settings

### Advanced Features
- `POST /api/bot/send-message` - Send message to specific chat
- `POST /api/bot/schedule-message` - Schedule message for later
- `GET /api/bot/chats` - Get list of active chats
- `POST /api/upload` - Upload files

### Admin
- `GET /api/admin/users` - Get all users (admin only)
- `GET /api/admin/stats` - Get system statistics (admin only)

## 🏗️ Architecture

### Frontend (React + TypeScript)
- **Framework:** React 18 with TypeScript
- **Styling:** Tailwind CSS with custom components
- **Icons:** Lucide React icon library
- **Routing:** React Router DOM
- **State Management:** React Context API
- **Real-time:** Socket.IO client

### Backend (Node.js + Express)
- **Runtime:** Node.js with ES Modules
- **Framework:** Express.js with middleware
- **WhatsApp:** whatsapp-web.js integration
- **Authentication:** JWT with bcryptjs
- **Real-time:** Socket.IO server
- **File Handling:** Multer for uploads
- **Task Scheduling:** node-cron
- **Media Processing:** Sharp for images

### WhatsApp Integration
- **Library:** whatsapp-web.js
- **Authentication:** QR code scanning
- **Session Management:** LocalAuth strategy
- **Message Handling:** Event-driven architecture
- **Media Support:** Full media download/upload
- **Group Management:** Complete admin controls

## 📁 Project Structure

```
├── src/                    # Frontend source code
│   ├── components/         # React components
│   │   ├── Dashboard.tsx   # Main dashboard
│   │   ├── Login.tsx       # User login
│   │   ├── Register.tsx    # User registration
│   │   └── AdminPanel.tsx  # Admin interface
│   ├── contexts/          # React contexts
│   │   └── AuthContext.tsx # Authentication context
│   └── ...
├── backend/               # Backend source code
│   ├── server.js         # Main server file
│   ├── package.json      # Backend dependencies
│   ├── sessions/         # WhatsApp sessions (auto-created)
│   ├── uploads/          # File uploads (auto-created)
│   ├── downloads/        # Downloaded media (auto-created)
│   └── data/             # Bot settings storage (auto-created)
├── package.json          # Frontend dependencies
└── README.md
```

## 🔐 Security Features

- **JWT Authentication** with secure token handling
- **Password Hashing** using bcryptjs
- **CORS Protection** for API endpoints
- **Input Validation** and sanitization
- **Rate Limiting** for API calls
- **Session Management** with automatic cleanup
- **Admin Role Protection** for sensitive operations
- **Anti-Spam Measures** in bot functionality

## 🚀 Deployment

### Production Environment Variables
```bash
# Backend Configuration
PORT=3001
JWT_SECRET=your-super-secure-jwt-secret
NODE_ENV=production

# WhatsApp Configuration
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
```

### Backend Deployment
1. Set environment variables
2. Install production dependencies: `npm ci --production`
3. Start server: `npm start`

### Frontend Deployment
1. Build the frontend: `npm run build`
2. Serve static files using nginx, Apache, or CDN

### Docker Deployment (Optional)
```dockerfile
# Backend Dockerfile
FROM node:18-alpine
RUN apk add --no-cache chromium
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

## 🔧 Advanced Configuration

### WhatsApp Session Management
- Sessions are stored in `backend/sessions/`
- Each user gets a unique session ID
- Sessions persist across server restarts
- Automatic session cleanup for inactive users

### Custom Commands
Add new commands by extending the bot class:

```javascript
this.commands.set('custom', {
  description: 'Custom command description',
  usage: '.custom <args>',
  category: 'utility',
  adminOnly: false,
  execute: async (message, args) => {
    // Command logic here
    await message.reply('Custom response');
  }
});
```

### Plugin System
Create modular plugins for extended functionality:

```javascript
// plugins/weather.js
export class WeatherPlugin {
  constructor(bot) {
    this.bot = bot;
    this.registerCommands();
  }
  
  registerCommands() {
    // Register weather-related commands
  }
}
```

## 🐛 Troubleshooting

### Common Issues

1. **Bot Connection Fails:**
   - Ensure Chrome/Chromium is installed
   - Check firewall settings
   - Verify WhatsApp Web access
   - Clear browser cache and sessions

2. **QR Code Not Generating:**
   - Restart the backend server
   - Check Puppeteer configuration
   - Ensure sufficient system resources

3. **Messages Not Sending:**
   - Verify bot connection status
   - Check WhatsApp Web session
   - Ensure proper permissions

4. **High Memory Usage:**
   - Monitor Chrome processes
   - Implement session cleanup
   - Optimize media handling

### Performance Optimization

1. **Memory Management:**
   - Regular session cleanup
   - Media cache management
   - Process monitoring

2. **Database Integration:**
   - Replace in-memory storage
   - Implement proper indexing
   - Use connection pooling

3. **Scaling:**
   - Load balancing for multiple instances
   - Redis for session sharing
   - Message queue for high volume

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and test thoroughly
4. Commit your changes: `git commit -m 'Add amazing feature'`
5. Push to the branch: `git push origin feature/amazing-feature`
6. Submit a pull request

### Development Guidelines
- Follow TypeScript best practices
- Maintain code documentation
- Write unit tests for new features
- Ensure responsive design compatibility
- Test WhatsApp integration thoroughly

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the API documentation
- Join our community discussions

## 🙏 Acknowledgments

- **whatsapp-web.js** - WhatsApp Web API integration
- **React** - Frontend framework
- **Express.js** - Backend framework
- **Tailwind CSS** - Styling framework
- **Lucide React** - Icon library

---

**⚠️ Disclaimer:** This bot is for educational and personal use. Ensure compliance with WhatsApp's Terms of Service and local regulations when using this software.

**🔒 Privacy:** The bot respects user privacy and doesn't store personal messages unless explicitly configured to do so for functionality purposes.