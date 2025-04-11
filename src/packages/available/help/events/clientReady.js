import logger from '../../../../utils/logger.js';
import { SlashCommandBuilder } from 'discord.js';

export async function onClientReady(client) {
  try {
    const helpCommand = new SlashCommandBuilder()
      .setName('help')
      .setDescription('Shows list of available commands');
    
    // Register commands with Discord API
    const commands = [helpCommand.toJSON()];
    
    // Add to existing commands
    const existingCommands = await client.application.commands.fetch();
    const existingCommandsJson = [...existingCommands.values()].map(cmd => ({
      name: cmd.name,
      id: cmd.id
    }));
    
    logger.debug(`Existing commands: ${JSON.stringify(existingCommandsJson)}`);
    
    // Register the help command if it doesn't exist
    const helpExists = existingCommands.some(cmd => cmd.name === 'help');
    if (!helpExists) {
      await client.application.commands.create(helpCommand);
      logger.info('Help slash command registered');
    }
    
    logger.info('Help slash commands setup complete');
  } catch (error) {
    logger.error('Error registering help slash command:', error);
  }
}
