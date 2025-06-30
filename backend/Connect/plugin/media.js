const { Queen } = require("../lib/event");

Queen.addCommand({
  pattern: ["sticker", "s"],
  category: "media",
  onlyPm: false,
  onlyGroup: false,
  React: "🎨",
  desc: "Convert image/video to sticker",
  usage: ".sticker (reply to image/video)"
}, async (message, client) => {
  if (!message.hasQuotedMsg) {
    await client.sendMessage(message.key.remoteJid, { text: Queen.errorMessage("Please reply to an image or video!") });
    return;
  }

  try {
    const quotedMsg = await message.getQuotedMessage();
    if (quotedMsg.hasMedia) {
      const media = await quotedMsg.downloadMedia();
      const sticker = new MessageMedia('image/webp', media.data, 'sticker.webp');
      await client.sendMessage(message.key.remoteJid, sticker, { sendMediaAsSticker: true });
    } else {
      await client.sendMessage(message.key.remoteJid, { text: Queen.errorMessage("Please reply to an image or video!") });
    }
  } catch (error) {
    await client.sendMessage(message.key.remoteJid, { text: Queen.errorMessage("Failed to create sticker!") });
  }
});

Queen.addCommand({
  pattern: ["toimg", "toimage"],
  category: "media",
  onlyPm: false,
  onlyGroup: false,
  React: "🖼️",
  desc: "Convert sticker to image",
  usage: ".toimg (reply to sticker)"
}, async (message, client) => {
  if (!message.hasQuotedMsg) {
    await client.sendMessage(message.key.remoteJid, { text: Queen.errorMessage("Please reply to a sticker!") });
    return;
  }

  try {
    const quotedMsg = await message.getQuotedMessage();
    if (quotedMsg.type === 'sticker') {
      const media = await quotedMsg.downloadMedia();
      const image = new MessageMedia('image/png', media.data, 'image.png');
      await client.sendMessage(message.key.remoteJid, image);
    } else {
      await client.sendMessage(message.key.remoteJid, { text: Queen.errorMessage("Please reply to a sticker!") });
    }
  } catch (error) {
    await client.sendMessage(message.key.remoteJid, { text: Queen.errorMessage("Failed to convert sticker!") });
  }
});

Queen.addCommand({
  pattern: ["download", "dl"],
  category: "media",
  onlyPm: false,
  onlyGroup: false,
  React: "⬇️",
  desc: "Download media from URL",
  usage: ".download <url>"
}, async (message, client, args) => {
  if (args.length === 0) {
    await client.sendMessage(message.key.remoteJid, { text: Queen.errorMessage("Please provide a URL to download!") });
    return;
  }

  const url = args[0];
  await client.sendMessage(message.key.remoteJid, { text: Queen.infoMessage("Downloading... Please wait!") });
  
  try {
    // Implement download logic here
    await client.sendMessage(message.key.remoteJid, { text: Queen.successfulMessage("Download completed!") });
  } catch (error) {
    await client.sendMessage(message.key.remoteJid, { text: Queen.errorMessage("Failed to download media!") });
  }
});

module.exports = {};