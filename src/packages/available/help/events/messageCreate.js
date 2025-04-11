import logger from '../../../../utils/logger.js';
import { handleHelpCommand } from '../prefixCommands/help.js';

export async function handleMessage(message, client, config) {
  if (message.author.bot) return;
  
  // Check for prefix command
  if (message.content.startsWith(`${config.prefix}help`)) {
    await handleHelpCommand(message, client);
  }
}
