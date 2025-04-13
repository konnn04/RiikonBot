import { handleStatusCommand } from './status.js';
import { handleServersCommand } from './servers.js';
import { handleUsersCommand } from './users.js';
import { handleHelpCommand } from './help.js';
import logger from '../../../utils/logger.js';

export async function processCommand(message, telegramApi, config, botClient, chatId) {
  try {
    if (!message || !message.text) {
      logger.error('Invalid message object received in processCommand');
      return;
    }

    const { text, from } = message;
    const userId = from.id.toString();

    logger.info(`Telegram: Received message from user ${userId}: ${text}`);
    
    // Check if this user is allowed to control the bot
    if (config.allowedUsers && config.allowedUsers.length > 0 && !config.allowedUsers.includes(userId)) {
      logger.warn(`Telegram: Unauthorized user ${userId} attempted to use command: ${text}`);
      await telegramApi.sendMessage(chatId, `❌ User ${from.username || userId} is not authorized to control the bot.`);
      return;
    }
    
    // Check for command prefix
    if (!text.startsWith(config.commandPrefix)) {
      logger.debug(`Telegram: Message doesn't start with command prefix: ${text}`);
      return;
    }
    
    const command = text.substring(config.commandPrefix.length).split(' ')[0].toLowerCase();
    logger.info(`Telegram: Processing command: ${command}`);
    
    switch (command) {
      case 'status':
        await handleStatusCommand(botClient, telegramApi, chatId);
        break;
      case 'servers':
        await handleServersCommand(botClient, telegramApi, chatId);
        break;
      case 'users':
        await handleUsersCommand(botClient, telegramApi, chatId);
        break;
      case 'help':
        await handleHelpCommand(config, telegramApi, chatId);
        break;
      default:
        logger.warn(`Telegram: Unknown command received: ${command}`);
        await telegramApi.sendMessage(chatId, `Unknown command: ${command}\nType ${config.commandPrefix}help for available commands.`);
    }
  } catch (error) {
    logger.error(`Error processing Telegram command: ${error.message}`, error);
    try {
      await telegramApi.sendMessage(chatId, `❌ Error processing command: ${error.message}`);
    } catch (sendError) {
      logger.error(`Failed to send error message to Telegram: ${sendError.message}`);
    }
  }
}
