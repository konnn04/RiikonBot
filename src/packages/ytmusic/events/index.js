import { onClientReady } from './clientReady.js';

export function registerEvents(packageManager, sendMessage) {
  packageManager.registerEventListener('clientReady', (client) => 
    onClientReady(client, sendMessage), 'youtube-music-bot');
}