import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function loadLanguage(lang = 'EN') {
  try {
    const langFile = lang === 'SI' ? 'SINHALA.json' : 'ENGLISH.json';
    const langPath = path.join(__dirname, `../../Connect/language/${langFile}`);
    
    if (await fs.exists(langPath)) {
      return await fs.readJson(langPath);
    }
    
    return {};
  } catch (error) {
    console.error('Error loading language:', error);
    return {};
  }
}