import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import logger from '../../../../utils/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Command collection
const prefixCommands = new Map();

// Load all prefix commands
export function loadPrefixCommands(config) {
  const commandFiles = fs.readdirSync(__dirname)
    .filter(file => file.endsWith('.js') && file !== 'index.js');
    
  for (const file of commandFiles) {
    (async () => {
      try {
        const filePath = path.join(__dirname, file);
        const commandModule = await import(pathToFileURL(filePath).href);
        
        if (commandModule.config && commandModule.handlePingCommand) {
          const commandName = commandModule.config.name || path.basename(file, '.js');
          
          prefixCommands.set(commandName, {
            config: commandModule.config,
            execute: commandModule.handlePingCommand
          });
          
          logger.debug(`Loaded prefix command: ${commandName}`);
        } else {
          logger.warn(`Prefix command file ${file} is missing config or handlePingCommand function`);
        }
      } catch (error) {
        logger.error(`Error loading prefix command from ${file}:`, error);
      }
    })();
  }
  
  return prefixCommands;
}

// Process a message to check for prefix commands
export function processMessage(message, client, config) {
  if (message.author.bot) return;
  
  const prefix = config.prefix || '!';
  
  if (!message.content.startsWith(prefix)) return;
  
  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();
  
  const command = prefixCommands.get(commandName);
  
  if (!command) return;
  
  try {
    command.execute(message, args, client);
  } catch (error) {
    logger.error(`Error executing prefix command ${commandName}:`, error);
    message.reply('There was an error executing that command!').catch(() => {});
  }
}

// Get all prefix commands for help system
export function getAllPrefixCommands() {
  return Array.from(prefixCommands.entries()).map(([name, command]) => ({
    name,
    ...command.config
  }));
}
