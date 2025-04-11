import { SlashCommandBuilder } from 'discord.js';

/**
 * Returns an array of slash command definitions for the help package
 */
export async function getCommands() {
  return [
    new SlashCommandBuilder()
      .setName('help')
      .setDescription('Shows list of available commands')
      .toJSON()
  ];
}
