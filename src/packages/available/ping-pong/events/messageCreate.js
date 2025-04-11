import logger from '../../../../utils/logger.js';
import { handlePingCommand } from '../prefixCommands/ping.js';

export async function handleMessage(message, client, config) {
  if (message.author.bot) return;
  
  // Check for mention
  const isMentioned = message.mentions.has(client.user) && config.respondToMentions;
  
  // Check for prefix command
  const hasPrefix = message.content.startsWith(`${config.prefix}ping`);
  
  if (isMentioned || hasPrefix) {
    await handlePingCommand(message);
  }
}
