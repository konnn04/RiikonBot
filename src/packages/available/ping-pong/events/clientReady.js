import logger from '../../../../utils/logger.js';
import { SlashCommandBuilder } from 'discord.js';

export async function onClientReady(client) {
  try {
    const pingCommand = new SlashCommandBuilder()
      .setName('ping')
      .setDescription('Replies with Pong!');
    
    // Register commands with Discord API
    const commands = [pingCommand.toJSON()];
    
    // Register commands globally
    await client.application.commands.set(commands);
    
    // Add commands to the client's command collection
    client.commands.set('ping', {
      execute: async (interaction) => {
        await interaction.reply('Pong! 🏓');
      }
    });
    
    logger.info('Ping-pong slash commands registered');
  } catch (error) {
    logger.error('Error registering ping-pong slash commands:', error);
  }
}
