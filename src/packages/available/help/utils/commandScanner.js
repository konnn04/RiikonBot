import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import logger from '../../../../utils/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PACKAGES_DIR = path.join(__dirname, '../../../../packages/available');

/**
 * Scans all packages for available commands
 * @param {Array} packages - List of enabled packages
 * @returns {Object} Object containing slash and prefix commands
 */
export async function scanPackagesForCommands(packages) {
  const slashCommands = [];
  const prefixCommands = [];
  const processedPackages = new Set();
  
  for (const pkg of packages) {
    // Skip packages already processed or Telegram-only packages
    if (processedPackages.has(pkg.name) || 
        pkg.name === 'telegram-logger' ||
        pkg.description.toLowerCase().includes('telegram')) {
      continue;
    }
    
    processedPackages.add(pkg.name);
    
    try {
      // Process package
      const packageDir = path.join(PACKAGES_DIR, pkg.name);
      
      // Get prefix (from config or default)
      const prefix = pkg.config && pkg.config.prefix ? pkg.config.prefix : '!';
      
      // Look for slash commands in the commands directory
      const commandsDir = path.join(packageDir, 'commands');
      if (fs.existsSync(commandsDir)) {
        const commandFiles = fs.readdirSync(commandsDir)
          .filter(file => file.endsWith('.js') && file !== 'index.js');
          
        for (const file of commandFiles) {
          try {
            const filePath = path.join(commandsDir, file);
            const commandModule = await import(pathToFileURL(filePath).href);
            
            if (commandModule.config) {
              const { name, description } = commandModule.config;
              if (name && description) {
                slashCommands.push(`/${name} - ${description}`);
              }
            }
          } catch (error) {
            logger.error(`Error loading command from ${file} in package ${pkg.name}:`, error);
          }
        }
      }
      
      // Look for prefix commands in prefixCommands directory
      const prefixCommandsDir = path.join(packageDir, 'prefixCommands');
      if (fs.existsSync(prefixCommandsDir)) {
        const commandFiles = fs.readdirSync(prefixCommandsDir)
          .filter(file => file.endsWith('.js') && file !== 'index.js');
          
        for (const file of commandFiles) {
          try {
            const filePath = path.join(prefixCommandsDir, file);
            const commandModule = await import(pathToFileURL(filePath).href);
            
            if (commandModule.config) {
              const { name, description } = commandModule.config;
              if (name && description) {
                prefixCommands.push(`${prefix}${name} - ${description}`);
              }
            }
          } catch (error) {
            logger.error(`Error loading prefix command from ${file} in package ${pkg.name}:`, error);
          }
        }
      }
    } catch (error) {
      logger.error(`Error scanning commands for package ${pkg.name}:`, error);
    }
  }
  
  return { slashCommands, prefixCommands };
}
