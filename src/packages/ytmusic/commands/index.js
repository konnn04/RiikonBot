import { SlashCommandBuilder } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import logger from '../../../utils/logger.js';
import { createCommandExecutor } from '../prefixCommands/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Map to store slash commands
const slashCommands = new Map();

/**
 * Convert command options to slash command options
 */
function addCommandOptions(slashCommandBuilder, options) {
  if (!options || !Array.isArray(options)) return slashCommandBuilder;
  
  options.forEach(option => {
    switch (option.type) {
      case 'STRING':
        slashCommandBuilder.addStringOption(opt => 
          opt.setName(option.name)
             .setDescription(option.description)
             .setRequired(option.required || false));
        break;
      case 'INTEGER':
        slashCommandBuilder.addIntegerOption(opt => 
          opt.setName(option.name)
             .setDescription(option.description)
             .setRequired(option.required || false));
        break;
      case 'BOOLEAN':
        slashCommandBuilder.addBooleanOption(opt => 
          opt.setName(option.name)
             .setDescription(option.description)
             .setRequired(option.required || false));
        break;
      // Thêm các loại options khác nếu cần
    }
  });
  
  return slashCommandBuilder;
}

/**
 * Register all music slash commands
 */
export function registerCommands(client) {
  // Đảm bảo musicPlayer có sẵn
  if (!client.musicPlayer) {
    logger.warn('MusicPlayer not available on client - will be attached later');
  }
  
  // Load all command files
  const commandFiles = fs.readdirSync(__dirname)
    .filter(file => file.endsWith('.js') && file !== 'index.js');
    
  for (const file of commandFiles) {
    (async () => {
      try {
        const filePath = path.join(__dirname, file);
        const commandModule = await import(`file://${filePath}`);
        
        if (commandModule.data && commandModule.execute) {
          const commandName = commandModule.data.name;
          
          // Tạo executor cho slash command
          const { slashExecutor } = createCommandExecutor(commandModule.execute);
          
          slashCommands.set(commandName, {
            data: commandModule.data,
            execute: slashExecutor
          });
          
          logger.debug(`Loaded music slash command: ${commandName}`);
        } else {
          logger.warn(`Slash command file ${file} is missing data or execute function`);
        }
      } catch (error) {
        logger.error(`Error loading slash command from ${file}:`, error);
      }
    })();
  }
  
  // Register interaction handler for commands
  client.packageManager.registerEventListener('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;
    
    const command = slashCommands.get(interaction.commandName);
    if (!command) return;
    
    try {
      // Cần đảm bảo musicPlayer được truyền vào
      const musicPlayer = client.musicPlayer || client.packageManager.getMusicPlayer();
      
      if (!musicPlayer) {
        logger.error('MusicPlayer not available for slash command execution');
        return interaction.reply({
          embeds: [{
            color: 0xFF0000,
            title: '❌ Error',
            description: 'Music player is not available at the moment',
            timestamp: new Date()
          }],
          ephemeral: true
        });
      }
      
      // Thực thi lệnh
      await command.execute(interaction, client, musicPlayer);
      logger.debug(`Executed music slash command ${interaction.commandName} for ${interaction.user.tag}`);
    } catch (error) {
      logger.error(`Error executing music slash command ${interaction.commandName}:`, error);
      
      // Phản hồi lỗi
      try {
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({
            embeds: [{
              color: 0xFF0000,
              title: '❌ Command Error',
              description: 'There was an error executing that command!',
              fields: [{ name: 'Error', value: error.message || 'Unknown error' }],
              timestamp: new Date()
            }],
            ephemeral: true
          });
        } else {
          await interaction.followUp({
            embeds: [{
              color: 0xFF0000,
              title: '❌ Command Error',
              description: 'There was an error executing that command!',
              fields: [{ name: 'Error', value: error.message || 'Unknown error' }],
              timestamp: new Date()
            }],
            ephemeral: true
          });
        }
      } catch (replyError) {
        logger.error('Error sending error reply:', replyError);
      }
    }
  }, 'ytmusic-slash-commands');
  
  logger.info('Music slash commands registered');
}

/**
 * Export getCommands function for updateCommands.js
 */
export async function getCommands() {
  const commands = [];
  
  // Load all command files
  const commandFiles = fs.readdirSync(__dirname)
    .filter(file => file.endsWith('.js') && file !== 'index.js');
    
  for (const file of commandFiles) {
    try {
      const filePath = path.join(__dirname, file);
      const commandModule = await import(`file://${filePath}`);
      
      if (commandModule.data) {
        commands.push(commandModule.data.toJSON());
      }
    } catch (error) {
      logger.error(`Error loading slash command data from ${file}:`, error);
    }
  }
  
  // Nếu không có file lệnh riêng, lấy từ prefixCommands
  if (commands.length === 0) {
    try {
      const { getSlashCommands } = await import('../prefixCommands/index.js');
      const prefixCommands = await getSlashCommands();
      commands.push(...prefixCommands);
    } catch (error) {
      logger.error('Error getting slash commands from prefix commands:', error);
    }
  }
  
  return commands;
}