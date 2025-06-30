const { Queen, categories } = require("../lib/event");

Queen.addCommand({
  pattern: ["menu", "help", "commands"],
  category: "utility",
  onlyPm: false,
  onlyGroup: false,
  React: "📋",
  desc: "Show bot menu",
  usage: ".menu"
}, async (message, client) => {
  const { commands } = require("../lib/event");
  
  let menuText = `🤖 *${Queen.config.BOT_NAME} Menu* 🤖\n\n`;
  
  // Group commands by category
  const commandsByCategory = {};
  commands.forEach(cmd => {
    if (!commandsByCategory[cmd.category]) {
      commandsByCategory[cmd.category] = [];
    }
    if (cmd.pattern && cmd.pattern.length > 0) {
      commandsByCategory[cmd.category].push({
        name: cmd.pattern[0],
        desc: cmd.desc,
        usage: cmd.usage
      });
    }
  });

  // Display commands by category
  Object.keys(commandsByCategory).forEach(category => {
    if (commandsByCategory[category].length > 0) {
      menuText += `📂 *${category.toUpperCase()}*\n`;
      commandsByCategory[category].forEach(cmd => {
        menuText += `• ${Queen.config.PREFIX}${cmd.name} - ${cmd.desc}\n`;
      });
      menuText += '\n';
    }
  });

  menuText += `💡 Type ${Queen.config.PREFIX}help <command> for detailed info\n`;
  menuText += `🔧 Total Commands: ${commands.length}\n`;
  menuText += `🌐 Language: ${Queen.config.LANGUAGE}\n`;
  menuText += `⚡ Prefix: ${Queen.config.PREFIX}`;

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
🤖 *${Queen.config.BOT_NAME} Information* 🤖

📱 *Name:* ${Queen.config.BOT_NAME}
🎯 *Version:* 2.0.0
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