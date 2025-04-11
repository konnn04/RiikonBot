import logger from '../../../../utils/logger.js';

// Command configuration
export const config = {
  name: 'ping',
  description: 'Check the bot\'s response time',
  category: 'Utility',
  usage: 'k!ping',
  examples: ['k!ping']
};

// Command execution function
export async function execute(message, args, client) {
  try {
    await message.reply('Pong! 🏓');
    logger.debug(`Replied to prefix ping command from ${message.author.tag}`);
  } catch (error) {
    logger.error('Error responding to ping message:', error);
  }
}
