import logger from '../../../../utils/logger.js';

// Command configuration
export const config = {
  name: 'ping',
  description: 'Check the bot\'s response time',
  category: 'Utility',
  usage: '!ping',
  examples: ['!ping'],
  cooldown: 5
};

// Command execution function
export async function handlePingCommand(message) {
  try {
    await message.reply('Pong! 🏓');
    logger.debug(`Replied to ping message from ${message.author.tag}`);
  } catch (error) {
    logger.error('Error responding to ping message:', error);
  }
}
