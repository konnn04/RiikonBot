import logger from '../../../utils/logger.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { EmbedBuilder } from 'discord.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Map to store commands
const musicCommands = new Map();

export async function processMessage(message, client, prefix, musicPlayer) {
  if (!message || message.author.bot) return;
  
  if (!message.content.startsWith(prefix)) return;
  
  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();
  
  const command = musicCommands.get(commandName);
  if (!command) return;
  
  try {
    // Check if the command is a slash command and if so, handle it accordingly
    let resolvedMusicPlayer = musicPlayer || null;
    // Log whether we found a music player
    if (resolvedMusicPlayer) {
      logger.debug(`Found musicPlayer: ${!!resolvedMusicPlayer}`);
    } else {
      logger.warn('Could not find musicPlayer through any method');
    }
    
    await command.execute(message, args, client, resolvedMusicPlayer);
    logger.debug(`Executed music command ${commandName} for ${message.author.tag}`);

  } catch (error) {
    logger.error(`Error executing music command ${commandName}: ${error.message}`, error);
    
    // Sử dụng embed thay vì tin nhắn thông thường
    const errorEmbed = new EmbedBuilder()
      .setColor('#FF0000')
      .setTitle('❌ Command Error')
      .setDescription('There was an error executing that command!')
      .addFields({ name: 'Error', value: error.message || 'Unknown error' })
      .setTimestamp();
      
    await message.reply({ embeds: [errorEmbed] }).catch(() => {});
  }
}
/**
 * Register all music prefix commands
 */
export function registerPrefixCommands(client, config, musicPlayer) {
  // Load all command files
  const commandFiles = fs.readdirSync(__dirname)
    .filter(file => file.endsWith('.js') && file !== 'index.js');
    
  for (const file of commandFiles) {
    (async () => {
      try {
        const filePath = path.join(__dirname, file);
        const commandModule = await import(pathToFileURL(filePath).href);
        
        if (commandModule.config && commandModule.execute) {
          const commandName = commandModule.config.name || path.basename(file, '.js');
          
          // Tạo executor để xử lý cả prefix và slash command
          musicCommands.set(commandName, {
            config: commandModule.config,
            execute: commandModule.execute
          });
          
          logger.debug(`Loaded music command: ${commandName}`);
        } else {
          logger.warn(`Music command file ${file} is missing config or execute function`);
        }
      } catch (error) {
        logger.error(`Error loading music command from ${file}:`, error);
      }
    })();
  }
  
  // Register message handler
  client.packageManager.registerEventListener('messageCreate', (message) => {
    const prefix = config.commandPrefix || 'k!';
    // Pass client and musicPlayer explicitly each time
    processMessage(message, client, prefix, client.getMusicPlayer());
  }, 'youtube-music-bot');
  
  // Attach the getAllMusicCommands function to the packageManager so it's accessible
  if (client.packageManager) {
    client.packageManager.getAllMusicCommands = getAllMusicCommands;
    logger.info('getAllMusicCommands function registered on packageManager');    
  } else {
    logger.error('Cannot attach command functions: packageManager not available on client');
  }
  logger.info('Music prefix commands registered');
}

// Get all music commands for help system
export function getAllMusicCommands() {
  logger.debug('Getting all music commands');

  return Array.from(musicCommands.entries())
  .map(([name, command]) => {
    return {
      name,
      ...command.config,
      package: command.config.package || 'ytmusic',
    };
  })
  
}

