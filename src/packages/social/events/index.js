import { handleMessage } from './messageCreate.js';
import { onClientReady } from './clientReady.js';
import { handleCommand } from './commandInteraction.js';

export function registerEvents(client, packageManager, config) {
  // Register message handler for prefix commands
  packageManager.registerEventListener('messageCreate', (message, client) => 
    handleMessage(message, client, config), 'standard');
  
  // Register client ready event handler
  packageManager.registerEventListener('clientReady', (client) => 
    onClientReady(client), 'standard');
  
  // Register slash command handler
  packageManager.registerEventListener('commandInteraction', (interaction, client) => 
    handleCommand(interaction, client, packageManager), 'standard');
    
  // You can add more event handlers here as needed
  
  // Guild events
  packageManager.registerEventListener('guildCreate', (guild) => {
    // Handle new guild joined
  }, 'standard');
  
  packageManager.registerEventListener('guildDelete', (guild) => {
    // Handle guild left
  }, 'standard');
}
