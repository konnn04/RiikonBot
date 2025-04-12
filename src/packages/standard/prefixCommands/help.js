import logger from '../../../utils/logger.js';
import { EmbedBuilder } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

// Command configuration
export const config = {
  name: 'help',
  description: 'Shows a list of all available commands',
  category: 'Utility',
  usage: 'k!help',
  examples: ['k!help', 'k!help ping']
};

// Command execution function
export async function execute(message, args, client) {
  try {
    // Get all enabled packages from packageManager
    const packageManager = client.packageManager;
    if (!packageManager) {
      logger.error('Package manager not accessible in help command');
      throw new Error('Package manager not available');
    }
    
    const packages = packageManager.getAllPackages().filter(pkg => pkg.enabled);
    
    // Get commands - pass client to the scan function
    const { slashCommands, prefixCommands } = await scanPackagesForCommands(packages, packageManager, client);
    
    // Create embed with dynamic command data
    const embed = new EmbedBuilder()
      .setTitle('RiikonBot Commands')
      .setColor('#0099ff')
      .setDescription('Here are all the available commands:');
    
    // Add slash commands field if we have any
    if (slashCommands.length > 0) {
      embed.addFields({
        name: 'Slash Commands',
        value: slashCommands.join('\n') || 'No slash commands available'
      });
    }
    
    // Add prefix commands field if we have any
    if (prefixCommands.length > 0) {
      embed.addFields({
        name: 'Prefix Commands',
        value: prefixCommands.join('\n') || 'No prefix commands available'
      });
    }
    
    embed.setTimestamp()
         .setFooter({ text: 'RiikonBot Help System' });
    
    await message.reply({ embeds: [embed] });
    logger.debug(`Replied to help command from ${message.author.tag}`);
  } catch (error) {
    logger.error('Error responding to help command:', error);
    await message.reply('Sorry, there was an error processing your command.');
  }
}

// Scan packages for available commands - Add client parameter
async function scanPackagesForCommands(packages, packageManager, client) {
  const slashCommands = [];
  const prefixCommands = [];
  const processedPackages = new Set();
  
  // First, try to get commands directly from package manager functions
  try {
    // Try to get slash commands directly if such function exists
    if (typeof packageManager.getAllSlashCommands === 'function') {
      logger.debug('Getting slash commands from package manager...');
      const allSlashCommands = packageManager.getAllSlashCommands();
      
      if (Array.isArray(allSlashCommands) && allSlashCommands.length > 0) {
        logger.info(`Found ${allSlashCommands.length} slash commands from packageManager`);
        
        // Format each command for display
        allSlashCommands.forEach(cmd => {
          if (cmd.name && cmd.description) {
            slashCommands.push(`/${cmd.name} - ${cmd.description}`);
          }
        });
      }
    } else {
      // If no direct function, try to get from the commands collection
      const discordCommands = client?.application?.commands?.cache;
      if (discordCommands && discordCommands.size > 0) {
        logger.info(`Found ${discordCommands.size} slash commands from Discord API cache`);
        
        discordCommands.forEach(cmd => {
          slashCommands.push(`/${cmd.name} - ${cmd.description}`);
        });
      }
    }
    
    // Get prefix commands directly from package manager if the function exists
    if (typeof packageManager.getAllPrefixCommands === 'function') {
      logger.debug('Getting prefix commands from package manager...');
      const allPrefixCommands = packageManager.getAllPrefixCommands();
      
      if (Array.isArray(allPrefixCommands) && allPrefixCommands.length > 0) {
        logger.info(`Found ${allPrefixCommands.length} prefix commands from packageManager`);
        
        // Get prefix from config or use default
        const prefix = packages.find(p => p.name === 'standard')?.config?.prefix || 'k!';
        
        // Format each command for display
        allPrefixCommands.forEach(cmd => {
          if (cmd.name && cmd.description) {
            prefixCommands.push(`${prefix}${cmd.name} - ${cmd.description}`);
          }
        });
      }
    }
    
    // Try to get music commands if the function exists
    if (typeof packageManager.getAllMusicCommands === 'function') {
      logger.debug('Getting music commands from package manager...');
      const musicCmds = packageManager.getAllMusicCommands();
      
      if (Array.isArray(musicCmds) && musicCmds.length > 0) {
        logger.info(`Found ${musicCmds.length} music commands from packageManager`);
        
        // Get prefix from ytmusic package or use default
        const ytmusic = packages.find(p => p.name === 'ytmusic');
        const prefix = ytmusic?.config?.commandPrefix || 'k!';
        
        // Format each command for display
        musicCmds.forEach(cmd => {
          if (cmd.name && cmd.description) {
            prefixCommands.push(`${prefix}${cmd.name} - ${cmd.description}`);
          }
        });
      }
    }
  } catch (error) {
    logger.error('Error getting commands from package manager:', error);
  }
  
  // If we don't have slash commands yet, retrieve from internal client collection
  if (slashCommands.length === 0 && client && client.commands) {
    try {
      logger.debug('Getting slash commands from client.commands collection...');
      client.commands.forEach(cmd => {
        if (cmd.config && cmd.config.name && cmd.config.description) {
          slashCommands.push(`/${cmd.config.name} - ${cmd.config.description}`);
        }
      });
      logger.info(`Found ${slashCommands.length} slash commands from client.commands`);
    } catch (error) {
      logger.error('Error getting commands from client.commands:', error);
    }
  }
  
  // The rest is a fallback if we couldn't get commands from cache/collection
  const shouldScanForSlashCommands = slashCommands.length === 0;
  const shouldScanForPrefixCommands = prefixCommands.length === 0;
  
  // Get the packages directory
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const PACKAGES_DIR = path.join(__dirname, '../../../../packages/available');
  
  // Scan all packages directories as a fallback
  for (const pkg of packages) {
    // Skip packages already processed or Telegram-only packages
    if (processedPackages.has(pkg.name) || 
        pkg.name === 'telegram-logger' ||
        pkg.description?.toLowerCase().includes('telegram only')) {
      continue;
    }
    
    processedPackages.add(pkg.name);
    
    try {
      // Process package
      const packageDir = path.join(PACKAGES_DIR, pkg.name);
      
      // Get prefix (from config or default)
      const prefix = pkg.config?.prefix || pkg.config?.commandPrefix || 'k!';
      
      // Only scan for slash commands if we haven't already got them
      if (shouldScanForSlashCommands) {
        // Look for slash commands in the commands directory
        const commandsDir = path.join(packageDir, 'commands');
        if (fs.existsSync(commandsDir)) {
          const commandFiles = fs.readdirSync(commandsDir)
            .filter(file => file.endsWith('.js') && file !== 'index.js');
            
          for (const file of commandFiles) {
            try {
              const filePath = path.join(commandsDir, file);
              const commandModule = await import(pathToFileURL(filePath).href);
              
              if (commandModule.config) {
                const { name, description } = commandModule.config;
                if (name && description) {
                  slashCommands.push(`/${name} - ${description}`);
                }
              }
            } catch (error) {
              logger.error(`Error loading command from ${file} in package ${pkg.name}:`, error);
            }
          }
        }
      }
      
      // Only scan for prefix commands if we haven't already got them from the package manager
      if (shouldScanForPrefixCommands) {
        // Look for prefix commands in prefixCommands directory
        const prefixCommandsDir = path.join(packageDir, 'prefixCommands');
        if (fs.existsSync(prefixCommandsDir)) {
          const commandFiles = fs.readdirSync(prefixCommandsDir)
            .filter(file => file.endsWith('.js') && file !== 'index.js');
            
          for (const file of commandFiles) {
            try {
              const filePath = path.join(prefixCommandsDir, file);
              const commandModule = await import(pathToFileURL(filePath).href);
              
              if (commandModule.config) {
                const { name, description } = commandModule.config;
                if (name && description) {
                  prefixCommands.push(`${prefix}${name} - ${description}`);
                }
              }
            } catch (error) {
              logger.error(`Error loading prefix command from ${file} in package ${pkg.name}:`, error);
            }
          }
        }
      }
    } catch (error) {
      logger.error(`Error scanning commands for package ${pkg.name}:`, error);
    }
  }
  
  // Even if no slash commands found in normal locations, add some defaults for core functionality
  if (slashCommands.length === 0) {
    slashCommands.push('/help - Shows list of available commands');
    slashCommands.push('/ping - Check if the bot is responding');
    logger.info('No slash commands found, added default help and ping commands');
  }
  
  // Remove duplicates
  const uniqueSlashCommands = [...new Set(slashCommands)];
  const uniquePrefixCommands = [...new Set(prefixCommands)];
  
  logger.info(`Total commands found: ${uniqueSlashCommands.length} slash commands, ${uniquePrefixCommands.length} prefix commands`);
  
  return { 
    slashCommands: uniqueSlashCommands, 
    prefixCommands: uniquePrefixCommands 
  };
}
