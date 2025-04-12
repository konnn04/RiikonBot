import logger from '../../utils/logger.js';
import { registerEvents } from './events/index.js';
import { registerCommands } from './commands/index.js';
import { registerPrefixCommands } from './prefixCommands/index.js';
import { MusicPlayer } from './utils/musicPlayer.js';

// Global package variables
let config = null;
let packageManager = null;
let botClient = null;
let musicPlayer = null;

// Initialize the package
export async function initialize(client, manager, packageConfig) {
  packageManager = manager;
  config = packageConfig;
  botClient = client;
  
  // Create music player instance
  musicPlayer = new MusicPlayer(client);
  
  // CRITICAL: Directly attach musicPlayer to the client object
  client.musicPlayer = musicPlayer;
  
  // Also register the getter function directly on the client
  client.getMusicPlayer = getMusicPlayer;
  
  // Register it on package manager too for redundancy
  if (manager) {
    manager.musicPlayer = musicPlayer;
    manager.getMusicPlayer = getMusicPlayer;
    logger.info('Registered music player on package manager');
  }

  // Register Discord commands
  registerCommands(client);
  
  // Register prefix commands for music functionality
  registerPrefixCommands(client, config, musicPlayer);
  
  // Register events for voice state updates
  registerEvents(packageManager, (msg) => logger.info(msg));
  
  logger.info('YTMusic package initialized');
}

// Called when package is enabled
export async function onEnable() {
  if (config && config.enabled) {
    // Initialize music resources
    if (musicPlayer) {
      await musicPlayer.initialize();
      logger.info('Music player initialized and ready');
    } else {
      logger.error('Music player not available during onEnable');
    }
  }
  logger.info('YTMusic package enabled');
}

// Called when package is disabled
export async function onDisable() {  
  // Clean up any active voice connections
  if (musicPlayer) {
    await musicPlayer.cleanup();
  }
  logger.info('YTMusic package disabled');
}

// Expose the music player to other parts of the package
export function getMusicPlayer() {
  return musicPlayer;
}


