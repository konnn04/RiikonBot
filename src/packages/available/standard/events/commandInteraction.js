import logger from '../../../../utils/logger.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const commandsDir = path.join(__dirname, '../commands');

/**
 * Handles slash command interactions for the standard package
 * @param {Interaction} interaction - The Discord interaction
 * @param {Client} client - The Discord client
 * @param {PackageManager} packageManager - The package manager
 */
export async function handleCommand(interaction, client, packageManager) {
  if (!interaction.isChatInputCommand()) return;
  
  const commandName = interaction.commandName;
  
  // Check if the command exists in the client.commands collection
  // If it's already there, it will be handled by the main bot handler
  if (client.commands && client.commands.has(commandName)) {
    return;
  }
  
  // If we get here, the command wasn't found in the client.commands collection
  // This is a fallback handler for commands that might not be registered properly
  logger.debug(`Standard package handling command interaction: ${commandName}`);
  
  // Check if the command file exists in the commands directory
  const commandFile = path.join(commandsDir, `${commandName}.js`);
  
  if (fs.existsSync(commandFile)) {
    // Import and execute the command module directly
    const commandModule = await import(pathToFileURL(commandFile).href);
    
    if (commandModule.execute) {
      await commandModule.execute(interaction, client);
      logger.debug(`Executed command ${commandName} from file`);
    } else {
      logger.error(`Command file ${commandName}.js exists but has no execute function`);
      await interaction.reply({
        content: 'This command is not properly implemented.',
        ephemeral: true
      });
    }
  } else {
    logger.debug(`No command file found for ${commandName}`);
  }
}
