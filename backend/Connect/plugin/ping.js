const { Queen } = require("../lib/event");

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

module.exports = {};