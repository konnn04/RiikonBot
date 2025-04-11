import { handleMessage } from './messageCreate.js';
import { onClientReady } from './clientReady.js';
import { handleCommand } from './commandInteraction.js';

export function registerEvents(client, packageManager, config) {
  // Register event listeners
  packageManager.registerEventListener('messageCreate', (message, client) => 
    handleMessage(message, client, config), 'help');
  
  packageManager.registerEventListener('clientReady', (client) => 
    onClientReady(client), 'help');
  
  packageManager.registerEventListener('commandInteraction', (interaction, client) => 
    handleCommand(interaction, client, packageManager), 'help');
}
