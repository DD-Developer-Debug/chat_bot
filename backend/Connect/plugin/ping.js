const { Queen } = require("../lib");

Queen.addCommand({
  pattern: ["ping", "speed"],
  category: "utility",
  onlyPm: false,
  onlyGroup: false,
  React: "🚀",
  desc: "Check bot response time",
  usage: ".ping"
}, async (message, client) => {
  const start = new Date().getTime();
  const { key } = await client.sendMessage(message.key.remoteJid, { text: '🏓 Pinging...' });
  const end = new Date().getTime();
  
  const responseTime = end - start;
  const responseText = `🏓 *Pong!*\n\n⚡ *Response Time:* ${responseTime}ms\n🤖 *Status:* Online\n✨ *Bot Speed:* ${responseTime < 100 ? 'Excellent' : responseTime < 500 ? 'Good' : 'Average'}`;
  
  await client.sendMessage(message.key.remoteJid, { 
    text: responseText,
    edit: key
  });
});

Queen.addCommand({
  pattern: ["menu", "help", "commands"],
  category: "utility",
  onlyPm: false,
  onlyGroup: false,
  React: "📋",
  desc: "Show bot menu",
  usage: ".menu"
}, async (message, client) => {
  const menuText = `
🤖 *Queen Bot Menu* 🤖

📋 *Available Commands:*
• .ping - Check bot speed
• .menu - Show this menu
• .info - Bot information
• .weather - Get weather info
• .joke - Random joke
• .quote - Inspirational quote

👑 *Admin Commands:*
• .ban - Ban user (admin only)
• .kick - Kick user (admin only)
• .promote - Promote user
• .demote - Demote user

🔧 *Utility Commands:*
• .sticker - Create sticker
• .translate - Translate text

Type any command with ${Queen.config.PREFIX} prefix to use!
`;

  await client.sendMessage(message.key.remoteJid, { text: menuText });
});

Queen.addCommand({
  pattern: ["info", "about"],
  category: "utility",
  onlyPm: false,
  onlyGroup: false,
  React: "ℹ️",
  desc: "Show bot information",
  usage: ".info"
}, async (message, client) => {
  const infoText = `
🤖 *Queen Bot Information* 🤖

📱 *Name:* ${Queen.config.BOT_NAME}
🎯 *Version:* 1.0.0
👨‍💻 *Developer:* DarkWinzo
🌟 *Features:* Multi-language, Plugin-based
⚡ *Status:* Online & Active

🔗 *Capabilities:*
• Multi-user support
• Plugin system
• Admin controls
• Real-time stats
• Auto reactions

💫 Built with love and advanced technology!
`;

  await client.sendMessage(message.key.remoteJid, { text: infoText });
});

module.exports = {};