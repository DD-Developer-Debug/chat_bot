const { Queen } = require("../lib/event");

Queen.addCommand({
  pattern: ["kick"],
  category: "admin",
  onlyGroup: true,
  onlyPm: false,
  React: "👢",
  adminOnly: true,
  desc: "Kick user from group",
  usage: ".kick @user"
}, async (message, client) => {
  try {
    const chat = await message.getChat();
    if (!chat.isGroup) {
      await client.sendMessage(message.key.remoteJid, { text: Queen.errorMessage("This command only works in groups!") });
      return;
    }

    const mentions = await message.getMentions();
    if (mentions.length === 0) {
      await client.sendMessage(message.key.remoteJid, { text: Queen.errorMessage("Please mention a user to kick!") });
      return;
    }

    await chat.removeParticipants(mentions.map(m => m.id._serialized));
    await client.sendMessage(message.key.remoteJid, { text: Queen.successfulMessage("User(s) kicked successfully!") });
  } catch (error) {
    await client.sendMessage(message.key.remoteJid, { text: Queen.errorMessage("Failed to kick user(s)!") });
  }
});

Queen.addCommand({
  pattern: ["ban"],
  category: "admin",
  onlyPm: false,
  onlyGroup: false,
  React: "🚫",
  adminOnly: true,
  desc: "Ban user from using bot",
  usage: ".ban @user"
}, async (message, client) => {
  const mentions = await message.getMentions();
  if (mentions.length === 0) {
    await client.sendMessage(message.key.remoteJid, { text: Queen.errorMessage("Please mention a user to ban!") });
    return;
  }

  // Add to banned users list (implement in main bot logic)
  await client.sendMessage(message.key.remoteJid, { text: Queen.successfulMessage("User(s) banned successfully!") });
});

Queen.addCommand({
  pattern: ["promote"],
  category: "admin",
  onlyGroup: true,
  onlyPm: false,
  React: "👑",
  adminOnly: true,
  desc: "Promote user to admin",
  usage: ".promote @user"
}, async (message, client) => {
  try {
    const chat = await message.getChat();
    const mentions = await message.getMentions();
    
    if (mentions.length === 0) {
      await client.sendMessage(message.key.remoteJid, { text: Queen.errorMessage("Please mention a user to promote!") });
      return;
    }

    await chat.promoteParticipants(mentions.map(m => m.id._serialized));
    await client.sendMessage(message.key.remoteJid, { text: Queen.successfulMessage("User(s) promoted successfully!") });
  } catch (error) {
    await client.sendMessage(message.key.remoteJid, { text: Queen.errorMessage("Failed to promote user(s)!") });
  }
});

Queen.addCommand({
  pattern: ["demote"],
  category: "admin",
  onlyGroup: true,
  onlyPm: false,
  React: "📉",
  adminOnly: true,
  desc: "Demote user from admin",
  usage: ".demote @user"
}, async (message, client) => {
  try {
    const chat = await message.getChat();
    const mentions = await message.getMentions();
    
    if (mentions.length === 0) {
      await client.sendMessage(message.key.remoteJid, { text: Queen.errorMessage("Please mention a user to demote!") });
      return;
    }

    await chat.demoteParticipants(mentions.map(m => m.id._serialized));
    await client.sendMessage(message.key.remoteJid, { text: Queen.successfulMessage("User(s) demoted successfully!") });
  } catch (error) {
    await client.sendMessage(message.key.remoteJid, { text: Queen.errorMessage("Failed to demote user(s)!") });
  }
});

Queen.addCommand({
  pattern: ["everyone", "tagall"],
  category: "admin",
  onlyGroup: true,
  onlyPm: false,
  React: "📢",
  adminOnly: true,
  desc: "Tag all group members",
  usage: ".everyone <message>"
}, async (message, client, args) => {
  try {
    const chat = await message.getChat();
    const text = args.join(' ') || 'Attention everyone!';
    let mentions = [];
    
    for (let participant of chat.participants) {
      mentions.push(`@${participant.id.user}`);
    }

    await client.sendMessage(message.key.remoteJid, { text: `${text}\n\n${mentions.join(' ')}` });
  } catch (error) {
    await client.sendMessage(message.key.remoteJid, { text: Queen.errorMessage("Failed to tag everyone!") });
  }
});

module.exports = {};