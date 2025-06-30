const fs = require("fs");
const path = require("path");

var Commands = [];
const config = require("../../config/config.json");

// Load language strings
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
const reactData = JSON.parse(fs.readFileSync(path.join(__dirname, "../database/react/React.json"), 'utf8'));

const getString = (key) => {
  return language.STRINGS && language.STRINGS[key] ? language.STRINGS[key] : key;
};

const reactArry = async (text = "INFO") => {
  const reactions = reactData.STRINGS.react[text] || reactData.STRINGS.react["INFO"];
  return reactions[Math.floor(Math.random() * reactions.length)];
};

const successfulMessage = (msg) => `👩‍🦰 ${getString('SUCCESS').GENERAL || 'Successful'}:- ${msg}`;
const errorMessage = (msg) => `🚀 ${getString('ERRORS').GENERAL || 'Error'}:- ${msg}`;
const infoMessage = (msg) => `🤖 ${getString('INFO') || 'Info'}:- ${msg}`;

const categories = ["all", "group", "media", "download", "logo", "fun", "utility", "admin", "owner"];

function addCommand(info, func) {
  const types = ["photo", "image", "text", "message", "video", "audio", "document"];
  
  const infos = {
    pattern: info.pattern || [],
    category: info.category || "all",
    fromMe: info.fromMe !== undefined ? info.fromMe : true,
    onlyGroup: info.onlyGroup || false,
    onlyPm: info.onlyPm || false,
    onlyPinned: info.onlyPinned || false,
    React: info.React || "",
    adminOnly: info.adminOnly || false,
    ownerOnly: info.ownerOnly || false,
    groupAdminOnly: info.groupAdminOnly || false,
    desc: info.desc || "",
    usage: info.usage || "",
    filename: info.filename || "",
    function: func
  };

  if (info.on === undefined && info.pattern === undefined) {
    infos.on = "message";
    infos.fromMe = false;
  } else if (info.on !== undefined && types.includes(info.on)) {
    infos.on = info.on;
  }

  Commands.push(infos);
  return infos;
}

const Queen = {
  addCommand,
  getString,
  reactArry,
  successfulMessage,
  errorMessage,
  infoMessage,
  config
};

module.exports = {
  Queen,
  commands: Commands,
  addCommand,
  getString,
  reactArry,
  successfulMessage,
  errorMessage,
  infoMessage,
  categories
};