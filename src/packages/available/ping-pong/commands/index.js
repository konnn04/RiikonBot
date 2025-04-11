import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import logger from '../../../../utils/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function registerCommands(client) {
  // Get all JS files in this directory, excluding this index.js
  const commandFiles = fs.readdirSync(__dirname)
    .filter(file => file.endsWith('.js') && file !== 'index.js');
    
  for (const file of commandFiles) {
    (async () => {
      try {
        const filePath = path.join(__dirname, file);
        const commandModule = await import(pathToFileURL(filePath).href);
        
        if (commandModule.config && commandModule.execute) {
          const commandName = commandModule.config.name || path.basename(file, '.js');
          
          // Register the command with the client
          client.commands.set(commandName, {
            config: commandModule.config,
            execute: commandModule.execute
          });
          
          logger.debug(`Registered slash command: ${commandName}`);
        } else {
          logger.warn(`Command file ${file} is missing config or execute function`);
        }
      } catch (error) {
        logger.error(`Error loading command from ${file}:`, error);
      }
    })();
  }
}

// Function to get all commands for Discord API registration
export function getAllCommands() {
  const commands = [];
  
  const commandFiles = fs.readdirSync(__dirname)
    .filter(file => file.endsWith('.js') && file !== 'index.js');
    
  for (const file of commandFiles) {
    try {
      const filePath = path.join(__dirname, file);
      const command = require(filePath);
      
      if (command.config) {
        commands.push(command.config);
      }
    } catch (error) {
      logger.error(`Error loading command config from ${file}:`, error);
    }
  }
  
  return commands;
}
