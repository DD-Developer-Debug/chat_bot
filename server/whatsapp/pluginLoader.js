import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pluginDir = path.join(__dirname, '../../Connect/plugin');

export async function loadPlugins() {
  const plugins = [];
  
  try {
    await fs.ensureDir(pluginDir);
    const files = await fs.readdir(pluginDir);
    
    for (const file of files) {
      if (file.endsWith('.js')) {
        try {
          const pluginPath = path.join(pluginDir, file);
          const plugin = await import(`file://${pluginPath}`);
          
          if (plugin.commands) {
            plugins.push(...plugin.commands);
          }
        } catch (error) {
          console.error(`Error loading plugin ${file}:`, error);
        }
      }
    }
  } catch (error) {
    console.error('Error loading plugins:', error);
  }
  
  return plugins;
}