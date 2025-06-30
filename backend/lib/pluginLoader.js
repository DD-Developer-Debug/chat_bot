const fs = require('fs');
const path = require('path');

class PluginLoader {
  constructor() {
    this.plugins = [];
    this.commands = [];
  }

  async loadPlugins() {
    const pluginDir = path.join(__dirname, '../Connect/plugin');
    
    try {
      if (!fs.existsSync(pluginDir)) {
        console.log('Plugin directory not found, creating...');
        fs.mkdirSync(pluginDir, { recursive: true });
        return;
      }

      const files = fs.readdirSync(pluginDir);
      const jsFiles = files.filter(file => file.endsWith('.js'));

      console.log(`Loading ${jsFiles.length} plugins...`);

      for (const file of jsFiles) {
        try {
          const pluginPath = path.join(pluginDir, file);
          
          // Clear require cache to allow hot reloading
          delete require.cache[require.resolve(pluginPath)];
          
          // Load the plugin
          require(pluginPath);
          
          console.log(`✅ Loaded plugin: ${file}`);
        } catch (error) {
          console.error(`❌ Error loading plugin ${file}:`, error.message);
        }
      }

      // Get commands from event.js
      const { commands } = require('../Connect/lib/event');
      this.commands = commands;
      
      console.log(`📋 Total commands loaded: ${commands.length}`);
      
    } catch (error) {
      console.error('Error loading plugins:', error);
    }
  }

  getCommands() {
    return this.commands;
  }

  async reloadPlugins() {
    console.log('🔄 Reloading plugins...');
    
    // Clear commands array
    const { commands } = require('../Connect/lib/event');
    commands.length = 0;
    
    // Reload all plugins
    await this.loadPlugins();
  }
}

module.exports = new PluginLoader();