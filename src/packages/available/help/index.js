import { registerEvents } from './events/index.js';
import { registerCommands } from './commands/index.js';
import logger from '../../../utils/logger.js';

// Global package variables
let config = null;
let packageManager = null;
let botClient = null;

// Initialize function called when the package is loaded
export async function initialize(client, manager, packageConfig) {
  packageManager = manager;
  config = packageConfig;
  botClient = client;
  
  // Register event listeners and commands
  registerEvents(client, manager, config);
  registerCommands(client);
  
  logger.info('Help package initialized');
}

// Called when package config is updated
export async function onConfigUpdate(newConfig) {
  config = newConfig;
  logger.info('Help package config updated');
}

// Called when package is enabled
export async function onEnable() {
  logger.info('Help package enabled');
}

// Called when package is disabled
export async function onDisable() {
  logger.info('Help package disabled');
}

// Export utility functions
export function getConfig() {
  return config;
}

export function getPackageManager() {
  return packageManager;
}

export function getClient() {
  return botClient;
}
