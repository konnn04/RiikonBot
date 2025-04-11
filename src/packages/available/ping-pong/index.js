import { registerEvents } from './events/index.js';
import { registerCommands } from './commands/index.js';
import logger from '../../../utils/logger.js';

// Global package variables
let config = null;
let packageManager = null;

// Initialize function called when the package is loaded
export async function initialize(client, manager, packageConfig) {
  packageManager = manager;
  config = packageConfig;
  
  // Register event listeners and commands
  registerEvents(client, manager, config);
  registerCommands(client);
  
  logger.info('Ping-pong package initialized');
}

// Called when package config is updated
export async function onConfigUpdate(newConfig) {
  config = newConfig;
  logger.info('Ping-pong package config updated');
}

// Called when package is enabled
export async function onEnable() {
  logger.info('Ping-pong package enabled');
}

// Called when package is disabled
export async function onDisable() {
  logger.info('Ping-pong package disabled');
}

// Export config and packageManager for use in other modules
export function getConfig() {
  return config;
}

export function getPackageManager() {
  return packageManager;
}
