import logger from '../../../utils/logger.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { EmbedBuilder } from 'discord.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Map to store commands
const musicCommands = new Map();

/**
 * Process a message for music commands
 */
export async function processMessage(message, client, prefix, musicPlayer) {
  if (!message || message.author.bot) return;
  
  if (!message.content.startsWith(prefix)) return;
  
  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();
  
  const command = musicCommands.get(commandName);
  if (!command) return;
  
  try {
    // Get the most reliable music player instance with more error checking
    let resolvedMusicPlayer = null;
    
    // Check musicPlayer parameter first
    if (musicPlayer) {
      resolvedMusicPlayer = musicPlayer;
      logger.debug('Using musicPlayer passed to processMessage');
    }
    // Then try client.musicPlayer (direct property we added in index.js)
    else if (client && client.musicPlayer) {
      resolvedMusicPlayer = client.musicPlayer;
      logger.debug('Using musicPlayer from client.musicPlayer');
    }
    // Then try client.getMusicPlayer() (function we added in index.js)
    else if (client && typeof client.getMusicPlayer === 'function') {
      resolvedMusicPlayer = client.getMusicPlayer();
      logger.debug('Using musicPlayer from client.getMusicPlayer()');
    }
    // Then try packageManager.musicPlayer or the getter
    else if (client && client.packageManager) {
      if (client.packageManager.musicPlayer) {
        resolvedMusicPlayer = client.packageManager.musicPlayer;
        logger.debug('Using musicPlayer from client.packageManager.musicPlayer');
      }
      else if (typeof client.packageManager.getMusicPlayer === 'function') {
        resolvedMusicPlayer = client.packageManager.getMusicPlayer();
        logger.debug('Using musicPlayer from client.packageManager.getMusicPlayer()');
      }
    }
    
    // Log whether we found a music player
    if (resolvedMusicPlayer) {
      logger.debug(`Found musicPlayer: ${!!resolvedMusicPlayer}`);
    } else {
      logger.warn('Could not find musicPlayer through any method');
    }

    // Create a context object for command execution with all necessary parameters
    const context = {
      message,
      args,
      client,
      musicPlayer: resolvedMusicPlayer,
      // Add these for convenience in commands
      channel: message.channel,
      guild: message.guild,
      member: message.member,
      reply: (content) => message.reply(content)
    };
    
    // Execute command with the context
    await command.execute(context);
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
 * Common command execution logic for both slash and prefix commands
 */
export function createCommandExecutor(commandAction) {
  // Hàm xử lý prefix command
  const prefixExecutor = async (message, args, client, musicPlayer) => {
    if (!message || !client) {
      throw new Error('Missing required parameters for command execution');
    }
    
    try {
      // Gọi hàm xử lý với context đúng cho prefix command
      return await commandAction({
        user: message.author,
        member: message.member,
        channel: message.channel,
        guild: message.guild,
        reply: (content) => {
          // Nếu nội dung đã là embed options, gửi trực tiếp
          if (content && typeof content === 'object' && (content.embeds || content.components)) {
            return message.reply(content);
          }
          
          // Chuyển đổi nội dung văn bản sang embed
          const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setDescription(typeof content === 'string' ? content : 'Command executed successfully')
            .setTimestamp();
            
          return message.reply({ embeds: [embed] });
        },
        followUp: (content) => {
          // Tương tự như reply, nhưng sử dụng channel.send
          if (content && typeof content === 'object' && (content.embeds || content.components)) {
            return message.channel.send(content);
          }
          
          const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setDescription(typeof content === 'string' ? content : 'Command executed successfully')
            .setTimestamp();
            
          return message.channel.send({ embeds: [embed] });
        },
        args,
        client,
        musicPlayer,
        message // Truyền thêm message object cho prefixCommands
      });
    } catch (error) {
      logger.error(`Error in prefixExecutor: ${error.message}`, error);
      throw error;
    }
  };
  
  // Hàm xử lý slash command
  const slashExecutor = async (interaction, client, musicPlayer) => {
    try {
      // Gọi hàm xử lý với context đúng cho slash command
      return await commandAction({
        user: interaction.user,
        member: interaction.member,
        channel: interaction.channel,
        guild: interaction.guild,
        reply: async (content) => {
          // Nếu người dùng đã trả lời, sử dụng followUp
          if (interaction.replied || interaction.deferred) {
            return interaction.followUp(content);
          }
          
          // Chuyển đổi nội dung văn bản sang embed nếu cần
          if (typeof content === 'string') {
            const embed = new EmbedBuilder()
              .setColor('#0099ff')
              .setDescription(content)
              .setTimestamp();
              
            return interaction.reply({ embeds: [embed] });
          }
          
          return interaction.reply(content);
        },
        followUp: (content) => {
          // Đảm bảo interaction đã được trả lời trước khi followUp
          if (!interaction.replied && !interaction.deferred) {
            interaction.deferReply();
          }
          
          // Chuyển đổi nội dung văn bản sang embed nếu cần
          if (typeof content === 'string') {
            const embed = new EmbedBuilder()
              .setColor('#0099ff')
              .setDescription(content)
              .setTimestamp();
              
            return interaction.followUp({ embeds: [embed] });
          }
          
          return interaction.followUp(content);
        },
        // Chuyển đổi options từ slash command thành args
        args: interaction.options ? 
          interaction.options.data.map(option => option.value) : [],
        client,
        musicPlayer,
        interaction // Truyền thêm interaction để xử lý đặc biệt nếu cần
      });
    } catch (error) {
      // Xử lý lỗi trong slash command
      if (!interaction.replied && !interaction.deferred) {
        const errorEmbed = new EmbedBuilder()
          .setColor('#FF0000')
          .setTitle('❌ Command Error')
          .setDescription('There was an error executing that command!')
          .addFields({ name: 'Error', value: error.message || 'Unknown error' })
          .setTimestamp();
          
        await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      } else {
        await interaction.followUp({ 
          embeds: [
            new EmbedBuilder()
              .setColor('#FF0000')
              .setTitle('❌ Command Error')
              .setDescription('There was an error executing that command!')
              .addFields({ name: 'Error', value: error.message || 'Unknown error' })
              .setTimestamp()
          ], 
          ephemeral: true 
        });
      }
      throw error;
    }
  };
  
  return { prefixExecutor, slashExecutor };
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
        const commandModule = await import(`file://${filePath}`);
        
        if (commandModule.config && commandModule.execute) {
          const commandName = commandModule.config.name || path.basename(file, '.js');
          
          // Tạo executor để xử lý cả prefix và slash command
          const { prefixExecutor } = createCommandExecutor(commandModule.execute);
          
          musicCommands.set(commandName, {
            config: commandModule.config,
            execute: prefixExecutor
          });
          
          // Register aliases if any
          if (commandModule.config.aliases) {
            for (const alias of commandModule.config.aliases) {
              musicCommands.set(alias, {
                config: commandModule.config,
                execute: prefixExecutor
              });
            }
          }
          
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
    processMessage(message, client, prefix, client.musicPlayer);
  }, 'youtube-music-bot');
  
  // Đăng ký function để tạo slash commands
  registerSlashCommandGenerator(client);
  
  // Attach the getAllMusicCommands function to the packageManager so it's accessible
  if (client.packageManager) {
    client.packageManager.getAllMusicCommands = getAllMusicCommands;
    
    // Add music commands to the main prefix commands collection if it exists
    if (typeof client.packageManager.getAllPrefixCommands === 'function') {
      const originalGetAllPrefixCommands = client.packageManager.getAllPrefixCommands;
      
      // Override the function to include music commands
      client.packageManager.getAllPrefixCommands = function() {
        const standardCommands = originalGetAllPrefixCommands();
        const musicCommandsList = getAllMusicCommands();
        return [...standardCommands, ...musicCommandsList];
      };
      
      logger.info('Music commands integrated with help system');
    } else {
      // If getAllPrefixCommands doesn't exist yet, create it
      client.packageManager.getAllPrefixCommands = function() {
        return getAllMusicCommands();
      };
      logger.info('Created getAllPrefixCommands with music commands');
    }
    
    // Tương tự, tích hợp slash commands vào hệ thống help
    if (typeof client.packageManager.getAllSlashCommands === 'function') {
      const originalGetAllSlashCommands = client.packageManager.getAllSlashCommands;
      
      client.packageManager.getAllSlashCommands = function() {
        const standardSlashCommands = originalGetAllSlashCommands();
        const musicSlashCommands = Array.from(musicCommands.entries())
          .filter(([name, command]) => {
            // Only include primary command names, not aliases
            if (command.config.aliases && command.config.aliases.includes(name)) {
              return false;
            }
            return true;
          })
          .map(([name, command]) => ({
            name,
            ...command.config,
            package: 'youtube-music-bot',
            type: 'SLASH'
          }));
        return [...standardSlashCommands, ...musicSlashCommands];
      };
      
      logger.info('Music slash commands integrated with help system');
    } else {
      client.packageManager.getAllSlashCommands = function() {
        return getAllMusicCommands().map(cmd => ({...cmd, type: 'SLASH'}));
      };
    }
  } else {
    logger.error('Cannot attach command functions: packageManager not available on client');
  }
  
  logger.info('Music prefix commands registered');
}

/**
 * Đăng ký hàm tạo slash commands
 */
function registerSlashCommandGenerator(client) {
  // Thêm hàm getCommands vào module để được gọi từ updateCommands.js
  if (!client.packageManager) return;
  
  client.packageManager.getSlashCommandsForPackage = client.packageManager.getSlashCommandsForPackage || {};
  
  // Định nghĩa hàm tạo slash commands cho package ytmusic
  client.packageManager.getSlashCommandsForPackage['youtube-music-bot'] = async () => {
    const commands = [];
    
    // Chuyển đổi từ prefix commands sang slash commands
    for (const [name, command] of musicCommands.entries()) {
      // Bỏ qua các alias
      if (command.config.aliases && command.config.aliases.includes(name)) continue;
      
      // Tạo cấu trúc lệnh slash command
      const slashCommand = {
        name: name,
        description: command.config.description || 'No description available',
        options: command.config.options || []
      };
      
      commands.push(slashCommand);
    }
    
    return commands;
  };
  
  // Đăng ký interaction handler cho slash commands
  client.packageManager.registerEventListener('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;
    
    const command = musicCommands.get(interaction.commandName);
    if (!command) return;
    
    try {
      // Tạo executor cho slash command
      const { slashExecutor } = createCommandExecutor(command.execute);
      
      // Thực thi lệnh
      await slashExecutor(interaction, client, client.musicPlayer);
      logger.debug(`Executed music slash command ${interaction.commandName} for ${interaction.user.tag}`);
    } catch (error) {
      logger.error(`Error executing music slash command ${interaction.commandName}:`, error);
    }
  }, 'youtube-music-bot');
}

// Get all music commands for help system
export function getAllMusicCommands() {
  return Array.from(musicCommands.entries())
    .filter(([name, command]) => {
      // Only include primary command names, not aliases
      if (command.config.aliases && command.config.aliases.includes(name)) {
        return false;
      }
      return true;
    })
    .map(([name, command]) => ({
      name,
      ...command.config,
      package: 'youtube-music-bot',
      type: 'PREFIX'
    }));
}

/**
 * Export hàm getSlashCommands để updateCommands.js có thể sử dụng
 */
export async function getSlashCommands() {
  const commands = [];
  
  // Chuyển đổi từ prefix commands sang slash commands
  for (const [name, command] of musicCommands.entries()) {
    // Bỏ qua các alias
    if (command.config.aliases && command.config.aliases.includes(name)) continue;
    
    // Tạo cấu trúc lệnh slash command
    const slashCommand = {
      name: name,
      description: command.config.description || 'No description available',
      options: command.config.options || []
    };
    
    commands.push(slashCommand);
  }
  
  return commands;
}
