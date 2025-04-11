import logger from '../../../../utils/logger.js';

/**
 * Registers any slash commands for the telegram-logger package
 * This package doesn't register any Discord commands as it's only for Telegram use
 */
export function registerSlashCommands(client) {
  // No Discord slash commands to register - this package only works in Telegram
  logger.debug('Telegram-logger package has no Discord slash commands (Telegram-only functionality)');
}

/**
 * Returns an array of slash command definitions for the telegram-logger package
 * Used by the updateCommands.js script
 */
export async function getCommands() {
  // Return an empty array since this package is Telegram-only and has no Discord commands
  return [];
}
