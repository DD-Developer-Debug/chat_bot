const { Queen } = require("../lib/event");

Queen.addCommand({
  pattern: ["restart"],
  category: "owner",
  onlyPm: false,
  onlyGroup: false,
  React: "🔄",
  ownerOnly: true,
  desc: "Restart the bot",
  usage: ".restart"
}, async (message, client) => {
  await client.sendMessage(message.key.remoteJid, { text: Queen.infoMessage("Restarting bot... Please wait!") });
  
  // Implement restart logic
  setTimeout(() => {
    process.exit(0);
  }, 2000);
});

Queen.addCommand({
  pattern: ["shutdown"],
  category: "owner",
  onlyPm: false,
  onlyGroup: false,
  React: "⚡",
  ownerOnly: true,
  desc: "Shutdown the bot",
  usage: ".shutdown"
}, async (message, client) => {
  await client.sendMessage(message.key.remoteJid, { text: Queen.infoMessage("Shutting down bot... Goodbye!") });
  
  setTimeout(() => {
    process.exit(0);
  }, 2000);
});

Queen.addCommand({
  pattern: ["eval"],
  category: "owner",
  onlyPm: false,
  onlyGroup: false,
  React: "💻",
  ownerOnly: true,
  desc: "Execute JavaScript code",
  usage: ".eval <code>"
}, async (message, client, args) => {
  if (args.length === 0) {
    await client.sendMessage(message.key.remoteJid, { text: Queen.errorMessage("Please provide code to execute!") });
    return;
  }
  
  try {
    const code = args.join(' ');
    const result = eval(code);
    await client.sendMessage(message.key.remoteJid, { text: `💻 *Code Execution Result:*\n\n\`\`\`${result}\`\`\`` });
  } catch (error) {
    await client.sendMessage(message.key.remoteJid, { text: Queen.errorMessage(`Execution failed: ${error.message}`) });
  }
});

Queen.addCommand({
  pattern: ["broadcast"],
  category: "owner",
  onlyPm: false,
  onlyGroup: false,
  React: "📢",
  ownerOnly: true,
  desc: "Broadcast message to all chats",
  usage: ".broadcast <message>"
}, async (message, client, args) => {
  if (args.length === 0) {
    await client.sendMessage(message.key.remoteJid, { text: Queen.errorMessage("Please provide a message to broadcast!") });
    return;
  }
  
  const broadcastMessage = args.join(' ');
  await client.sendMessage(message.key.remoteJid, { text: Queen.infoMessage("Broadcasting message to all chats...") });
  
  try {
    const chats = await client.getChats();
    let sentCount = 0;
    
    for (const chat of chats) {
      try {
        await client.sendMessage(chat.id._serialized, { text: `📢 *Broadcast Message*\n\n${broadcastMessage}` });
        sentCount++;
      } catch (error) {
        console.error(`Failed to send to ${chat.id._serialized}:`, error);
      }
    }
    
    await client.sendMessage(message.key.remoteJid, { text: Queen.successfulMessage(`Broadcast sent to ${sentCount} chats!`) });
  } catch (error) {
    await client.sendMessage(message.key.remoteJid, { text: Queen.errorMessage("Failed to broadcast message!") });
  }
});

module.exports = {};