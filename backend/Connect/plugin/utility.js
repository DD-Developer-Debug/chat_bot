const { Queen } = require("../lib");

Queen.addCommand({
  pattern: ["weather"],
  category: "utility",
  onlyPm: false,
  onlyGroup: false,
  React: "🌤️",
  desc: "Get weather information",
  usage: ".weather <city>"
}, async (message, client, args) => {
  if (args.length === 0) {
    await client.sendMessage(message.key.remoteJid, { text: Queen.errorMessage("Please provide a city name!\nUsage: .weather <city>") });
    return;
  }
  
  try {
    const city = args.join(' ');
    // Mock weather data (replace with real API)
    const weather = {
      location: city,
      temperature: Math.floor(Math.random() * 30) + 15,
      condition: ['Sunny', 'Cloudy', 'Rainy', 'Stormy'][Math.floor(Math.random() * 4)],
      humidity: Math.floor(Math.random() * 50) + 30
    };
    
    const weatherText = `🌤️ *Weather in ${weather.location}*\n\n` +
                       `🌡️ Temperature: ${weather.temperature}°C\n` +
                       `☁️ Condition: ${weather.condition}\n` +
                       `💧 Humidity: ${weather.humidity}%`;
    
    await client.sendMessage(message.key.remoteJid, { text: weatherText });
  } catch (error) {
    await client.sendMessage(message.key.remoteJid, { text: Queen.errorMessage("Failed to get weather information!") });
  }
});

Queen.addCommand({
  pattern: ["translate", "tr"],
  category: "utility",
  onlyPm: false,
  onlyGroup: false,
  React: "🌐",
  desc: "Translate text",
  usage: ".translate <text>"
}, async (message, client, args) => {
  if (args.length === 0) {
    await client.sendMessage(message.key.remoteJid, { text: Queen.errorMessage("Please provide text to translate!") });
    return;
  }
  
  const text = args.join(' ');
  // Mock translation (replace with real API)
  const translatedText = `Translated: ${text} (This is a demo translation)`;
  
  await client.sendMessage(message.key.remoteJid, { text: `🌐 *Translation*\n\n${translatedText}` });
});

Queen.addCommand({
  pattern: ["qr"],
  category: "utility",
  onlyPm: false,
  onlyGroup: false,
  React: "📱",
  desc: "Generate QR code",
  usage: ".qr <text>"
}, async (message, client, args) => {
  if (args.length === 0) {
    await client.sendMessage(message.key.remoteJid, { text: Queen.errorMessage("Please provide text for QR code!") });
    return;
  }
  
  const text = args.join(' ');
  await client.sendMessage(message.key.remoteJid, { text: Queen.infoMessage(`QR code for: ${text}\n(QR generation feature coming soon!)`) });
});

module.exports = {};