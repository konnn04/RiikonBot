import logger from '../../../../utils/logger.js';
import { EmbedBuilder } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

export async function handleCommand(interaction, client, packageManager) {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== 'help') return;
  
  // Check if the command is registered in the client.commands collection
  // If it is, we'll let the main command handler take care of it
  if (client.commands && client.commands.has('help')) {
    return;
  }
  
  try {
    // Get all enabled packages
    const packages = packageManager.getAllPackages().filter(pkg => pkg.enabled);
    
    // Get commands
    const { slashCommands, prefixCommands } = await scanPackagesForCommands(packages);
    
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
    
    await interaction.reply({ embeds: [embed] });
    logger.debug(`Replied to help command from ${interaction.user.tag}`);
  } catch (error) {
    logger.error('Error responding to help command:', error);
    await interaction.reply('Sorry, there was an error processing your command.');
  }
}

/**
 * Scans all packages for available commands
 * @param {Array} packages - List of enabled packages
 * @returns {Object} Object containing slash and prefix commands
 */
async function scanPackagesForCommands(packages) {
  const slashCommands = [];
  const prefixCommands = [];
  const processedPackages = new Set();
  
  // Get the packages directory
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const PACKAGES_DIR = path.join(__dirname, '../../../../packages/available');
  
  for (const pkg of packages) {
    // Skip packages already processed or Telegram-only packages
    if (processedPackages.has(pkg.name) || 
        pkg.name === 'telegram-logger' ||
        pkg.description.toLowerCase().includes('telegram')) {
      continue;
    }
    
    processedPackages.add(pkg.name);
    
    try {
      // Process package
      const packageDir = path.join(PACKAGES_DIR, pkg.name);
      
      // Get prefix (from config or default)
      const prefix = pkg.config && pkg.config.prefix ? pkg.config.prefix : '!';
      
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
    } catch (error) {
      logger.error(`Error scanning commands for package ${pkg.name}:`, error);
    }
  }
  
  return { slashCommands, prefixCommands };
}
