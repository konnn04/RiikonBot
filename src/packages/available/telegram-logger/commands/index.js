import logger from '../../../../utils/logger.js';
import { registerSlashCommands } from './slashCommands.js';
import { TelegramApi } from '../utils/telegramApi.js';

// This package has no Discord commands - it only works with Telegram
export function registerCommands(client) {
  try {
    // This just ensures no Discord commands are registered
    registerSlashCommands(client);
    
    // Verify that Telegram configuration is valid
    const config = client.packageManager.packages.get('telegram-logger')?.config;
    if (config) {
      const botToken = process.env.TELEGRAM_BOT_TOKEN || config.botToken;
      const chatId = process.env.TELEGRAM_CHAT_ID || config.chatId;
      
      if (!botToken || !chatId) {
        logger.warn('Telegram logger not properly configured. Please set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in env or config.');
      } else {
        // Test the connection
        const telegramApi = new TelegramApi(botToken);
        telegramApi.getMe().then(botInfo => {
          logger.info(`Telegram bot connected as: ${botInfo.username}`);
        }).catch(error => {
          logger.error(`Failed to connect to Telegram API: ${error.message}`);
        });
      }
    }
    
    logger.info('Telegram logger has no Discord commands (Telegram-only functionality)');
  } catch (error) {
    logger.error('Error in telegram logger commands setup:', error);
  }
}
