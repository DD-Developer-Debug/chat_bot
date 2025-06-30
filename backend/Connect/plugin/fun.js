const { Queen } = require("../lib");

Queen.addCommand({
  pattern: ["joke"],
  category: "fun",
  onlyPm: false,
  onlyGroup: false,
  React: "😂",
  desc: "Get a random joke",
  usage: ".joke"
}, async (message, client) => {
  const jokes = [
    "Why don't scientists trust atoms? Because they make up everything! 😄",
    "Why did the scarecrow win an award? He was outstanding in his field! 🌾",
    "Why don't eggs tell jokes? They'd crack each other up! 🥚",
    "What do you call a fake noodle? An impasta! 🍝",
    "Why did the math book look so sad? Because it had too many problems! 📚",
    "What do you call a sleeping bull? A bulldozer! 🐂",
    "Why don't skeletons fight each other? They don't have the guts! 💀",
    "What do you call a bear with no teeth? A gummy bear! 🐻"
  ];
  
  const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
  await client.sendMessage(message.key.remoteJid, { text: `😂 *Random Joke*\n\n${randomJoke}` });
});

Queen.addCommand({
  pattern: ["quote"],
  category: "fun",
  onlyPm: false,
  onlyGroup: false,
  React: "✨",
  desc: "Get an inspirational quote",
  usage: ".quote"
}, async (message, client) => {
  const quotes = [
    "The only way to do great work is to love what you do. - Steve Jobs",
    "Innovation distinguishes between a leader and a follower. - Steve Jobs",
    "Life is what happens to you while you're busy making other plans. - John Lennon",
    "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
    "It is during our darkest moments that we must focus to see the light. - Aristotle",
    "Success is not final, failure is not fatal: it is the courage to continue that counts. - Winston Churchill",
    "The way to get started is to quit talking and begin doing. - Walt Disney"
  ];
  
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  await client.sendMessage(message.key.remoteJid, { text: `✨ *Inspirational Quote*\n\n${randomQuote}` });
});

Queen.addCommand({
  pattern: ["fact"],
  category: "fun",
  onlyPm: false,
  onlyGroup: false,
  React: "🧠",
  desc: "Get a random fact",
  usage: ".fact"
}, async (message, client) => {
  const facts = [
    "🧠 Octopuses have three hearts and blue blood!",
    "🌍 A day on Venus is longer than its year!",
    "🐝 Honey never spoils - archaeologists have found edible honey in ancient Egyptian tombs!",
    "🦈 Sharks have been around longer than trees!",
    "🌙 The Moon is moving away from Earth at about 3.8 cm per year!",
    "🐧 Penguins can jump as high as 6 feet in the air!",
    "🧬 Humans share 60% of their DNA with bananas!"
  ];
  
  const randomFact = facts[Math.floor(Math.random() * facts.length)];
  await client.sendMessage(message.key.remoteJid, { text: `🤯 *Random Fact*\n\n${randomFact}` });
});

module.exports = {};