import logger from '../../../utils/logger.js';

// This package temporarily has no commands
export function registerCommands(client) {
  try {
    // Register empty slash commands
    logger.info('YTMusic package has no commands temporarily');
  } catch (error) {
    logger.error('Error in YTMusic commands setup:', error);
  }
}

