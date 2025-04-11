import { SlashCommandBuilder } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const COMMANDS_DIR = path.join(__dirname, 'commands');

/**
 * Returns an array of slash command definitions for the ping-pong package
 */
export async function getCommands() {
  const commands = [];
  
  // Check if the commands directory exists
  if (!fs.existsSync(COMMANDS_DIR)) {
    return commands;
  }
  
  // Get all JS files in the commands directory excluding index.js
  const commandFiles = fs.readdirSync(COMMANDS_DIR)
    .filter(file => file.endsWith('.js') && file !== 'index.js');
  
  for (const file of commandFiles) {
    try {
      const filePath = path.join(COMMANDS_DIR, file);
      const commandModule = await import(pathToFileURL(filePath).href);
      
      if (commandModule.config) {
        const { name, description } = commandModule.config;
        
        if (name && description) {
          const command = new SlashCommandBuilder()
            .setName(name)
            .setDescription(description);
            
          // Here you could add options based on config as well
          
          commands.push(command.toJSON());
        }
      }
    } catch (error) {
      console.error(`Error loading command from ${file}:`, error);
    }
  }
  
  return commands;
}
