import logger from '../../../../utils/logger.js';

// Command configuration
export const config = {
  name: 'ping',
  description: 'Check the bot\'s response time',
  category: 'Utility',
  usage: '/ping',
  examples: ['/ping'],
  cooldown: 5
};

// Command execution function
export async function execute(interaction, client) {
  const latency = client.ws.ping;
  await interaction.reply(`Pong! 🏓\nAPI Latency: ${latency}ms`);
  logger.debug(`Replied to ping command from ${interaction.user.tag}`);
}
