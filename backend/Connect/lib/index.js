const fs = require("fs");
const path = require("path");
const config = require("../../config/config.json");

let Commands = [];

const loadLanguage = () => {
  try {
    const langFile = config.LANGUAGE === 'SI' ? '../language/SINHALA.json' : '../language/ENGLISH.json';
    const langPath = path.join(__dirname, langFile);
    return JSON.parse(fs.readFileSync(langPath, 'utf8'));
  } catch (error) {
    console.error('Error loading language:', error);
    return {};
  }
};

const language = loadLanguage();

const getString = (key) => {
  return language.STRINGS && language.STRINGS[key] ? language.STRINGS[key] : key;
};

const reactArry = async (text = "INFO") => {
  const reactData = getString("react");
  const reactions = reactData && reactData[text] ? reactData[text] : ["🤖"];
  return reactions[Math.floor(Math.random() * reactions.length)];
};

const successfulMessage = (msg) => `👩‍🦰 Successful:- ${msg}`;
const errorMessage = (msg) => `🚀 Error:- ${msg}`;
const infoMessage = (msg) => `🤖 Info:- ${msg}`;

function addCommand(info, func) {
  const infos = {
    pattern: info.pattern || [],
    category: info.category || "all",
    fromMe: info.fromMe !== undefined ? info.fromMe : true,
    onlyGroup: info.onlyGroup || false,
    onlyPm: info.onlyPm || false,
    onlyPinned: info.onlyPinned || false,
    react: info.React || info.react || "",
    adminOnly: info.adminOnly || false,
    ownerOnly: info.ownerOnly || false,
    function: func
  };
  
  Commands.push(infos);
  return infos;
}

const Queen = {
  addCommand,
  getString,
  reactArry,
  successfulMessage,
  errorMessage,
  infoMessage
};

module.exports = {
  Queen,
  commands: Commands,
  addCommand,
  getString,
  reactArry,
  successfulMessage,
  errorMessage,
  infoMessage
};