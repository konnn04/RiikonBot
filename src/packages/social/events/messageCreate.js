import logger from '../../../utils/logger.js';
import { processMessage } from '../prefixCommands/index.js';

export async function handleMessage(message, client, config) {
  if (message.author.bot) return;
  
  // Process prefix commands
  try {
    const prefix = config.prefix || 'k!';
    await processMessage(message, client, prefix);
  } catch (error) {
    logger.error('Error processing message:', error);
  }
}
