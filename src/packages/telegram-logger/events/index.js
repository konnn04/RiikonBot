import { onClientReady } from './clientReady.js';
import { onError } from './error.js';
import { onGuildJoin } from './guildCreate.js';
import { onGuildLeave } from './guildDelete.js';

export function registerEvents(packageManager, sendMessage) {
  packageManager.registerEventListener('clientReady', (client) => 
    onClientReady(client, sendMessage), 'telegram-logger');
  
  packageManager.registerEventListener('error', (error) => 
    onError(error, sendMessage), 'telegram-logger');
  
  packageManager.registerEventListener('guildCreate', (guild) => 
    onGuildJoin(guild, sendMessage), 'telegram-logger');
  
  packageManager.registerEventListener('guildDelete', (guild) => 
    onGuildLeave(guild, sendMessage), 'telegram-logger');
}
