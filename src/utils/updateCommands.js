import dotenv from 'dotenv';
import { REST, Routes, SlashCommandBuilder } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import logger from './logger.js';
import prisma, { setupDatabase } from '../database/db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PACKAGES_DIR = path.join(__dirname, '..', 'packages');

// Load environment variables
dotenv.config();

/**
 * Collects slash commands from all enabled packages
 */
async function collectCommands() {
  // Initialize database to access packages table
  await setupDatabase();
  
  const commands = [];
  logger.info('Collecting slash commands from enabled packages...');
  
  // Get all enabled packages from the database
  const enabledPackages = await prisma.package.findMany({ 
    where: { enabled: true } 
  });
  const enabledPackageNames = enabledPackages.map(pkg => pkg.name);
  
  logger.info(`Found ${enabledPackageNames.length} enabled packages: ${enabledPackageNames.join(', ')}`);
  
  // Check if packages directory exists
  if (!fs.existsSync(PACKAGES_DIR)) {
    logger.error(`Cannot find packages directory at: ${PACKAGES_DIR}`);
    return commands;
  }
  
  logger.info(`Using packages directory: ${PACKAGES_DIR}`);
  
  // Read packages directory
  const dirContents = fs.readdirSync(PACKAGES_DIR, { withFileTypes: true });
  logger.debug(`Found ${dirContents.length} items in packages directory`);
  
  const availablePackages = dirContents
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  logger.debug(`Available package directories: ${availablePackages.join(', ')}`);
  
  // Check if enabled packages exist in the directory
  const missingPackages = enabledPackageNames.filter(name => !availablePackages.includes(name));
  if (missingPackages.length > 0) {
    logger.warn(`These enabled packages are missing from the packages directory: ${missingPackages.join(', ')}`);
  }
  
  // Normalize package names
  const normalizedNames = {
    'youtube-music-bot': 'ytmusic',
    'ytmusic': 'ytmusic'
  };
  
  // Process each enabled package
  for (const pkgName of enabledPackageNames) {
    const normalizedName = normalizedNames[pkgName] || pkgName;
    
    // Find package directory
    const possibleNames = [pkgName, normalizedName];
    let packageDir = null;
    
    for (const name of possibleNames) {
      const packagePath = path.join(PACKAGES_DIR, name);
      if (fs.existsSync(packagePath)) {
        packageDir = packagePath;
        logger.debug(`Found package directory for ${pkgName} at ${packagePath}`);
        break;
      }
    }
    
    if (!packageDir) {
      logger.warn(`Could not find directory for package: ${pkgName}`);
      continue;
    }
    
    // Look for commands directory
    const commandsDir = path.join(packageDir, 'commands');
    if (!fs.existsSync(commandsDir) || !fs.statSync(commandsDir).isDirectory()) {
      logger.info(`No commands directory found in package ${pkgName}`);
      continue;
    }
    
    logger.info(`Processing commands from ${pkgName}`);
    
    try {
      // Get all JS files in the commands directory
      const commandFiles = fs.readdirSync(commandsDir)
        .filter(file => file.endsWith('.js') && file !== 'index.js');
      
      logger.debug(`Found ${commandFiles.length} command files in ${pkgName}`);
      
      // Process each command file
      for (const file of commandFiles) {
        try {
          const filePath = path.join(commandsDir, file);
          const commandModule = await import(pathToFileURL(filePath).href);
          
          // Check if module has required config
          if (!commandModule.config || !commandModule.execute) {
            logger.warn(`Command file ${file} in ${pkgName} is missing config or execute function`);
            continue;
          }
          
          const { name, description, options = [] } = commandModule.config;
          
          if (!name || !description) {
            logger.warn(`Command file ${file} in ${pkgName} has invalid config (missing name or description)`);
            continue;
          }
          
          // Build command using SlashCommandBuilder
          const command = new SlashCommandBuilder()
            .setName(name)
            .setDescription(description);
          
          // Add options based on their types
          if (options && Array.isArray(options)) {
            for (const option of options) {
              if (!option.name || !option.description || !option.type) {
                logger.warn(`Option in command ${name} (${pkgName}) is missing required properties`);
                continue;
              }
              
              const optionType = option.type.toLowerCase();
              
              // Handle different option types
              switch (optionType) {
                case 'string':
                  command.addStringOption(opt => 
                    opt.setName(option.name)
                       .setDescription(option.description)
                       .setRequired(option.required === true));
                  break;
                  
                case 'integer':
                  command.addIntegerOption(opt => 
                    opt.setName(option.name)
                       .setDescription(option.description)
                       .setRequired(option.required === true));
                  break;
                  
                case 'boolean':
                  command.addBooleanOption(opt => 
                    opt.setName(option.name)
                       .setDescription(option.description)
                       .setRequired(option.required === true));
                  break;
                  
                case 'user':
                  command.addUserOption(opt => 
                    opt.setName(option.name)
                       .setDescription(option.description)
                       .setRequired(option.required === true));
                  break;
                  
                case 'channel':
                  command.addChannelOption(opt => 
                    opt.setName(option.name)
                       .setDescription(option.description)
                       .setRequired(option.required === true));
                  break;
                  
                case 'role':
                  command.addRoleOption(opt => 
                    opt.setName(option.name)
                       .setDescription(option.description)
                       .setRequired(option.required === true));
                  break;
                  
                case 'mentionable':
                  command.addMentionableOption(opt => 
                    opt.setName(option.name)
                       .setDescription(option.description)
                       .setRequired(option.required === true));
                  break;
                  
                case 'number':
                  command.addNumberOption(opt => 
                    opt.setName(option.name)
                       .setDescription(option.description)
                       .setRequired(option.required === true));
                  break;
                  
                case 'attachment':
                  command.addAttachmentOption(opt => 
                    opt.setName(option.name)
                       .setDescription(option.description)
                       .setRequired(option.required === true));
                  break;
                  
                default:
                  logger.warn(`Unknown option type "${optionType}" in command ${name} (${pkgName})`);
                  continue;
              }
            }
          }
          
          // Add command to the list
          commands.push(command.toJSON());
          logger.debug(`Added command ${name} from ${pkgName}`);
          
        } catch (error) {
          logger.error(`Error processing command file ${file} in ${pkgName}:`, error);
        }
      }
    } catch (error) {
      logger.error(`Error reading commands directory for ${pkgName}:`, error);
    }
  }
  
  if (commands.length === 0) {
    logger.warn('No commands were found in any package. Check package structure and command exports.');
  } else {
    logger.info(`Total commands collected: ${commands.length}`);
  }
  
  return commands;
}

/**
 * Registers all commands with Discord API
 */
async function registerCommands() {
  // Get application ID and token from environment
  const token = process.env.DISCORD_TOKEN;
  const applicationId = process.env.DISCORD_CLIENT_ID;
  
  if (!token || !applicationId) {
    logger.error('Missing DISCORD_TOKEN or DISCORD_CLIENT_ID in environment variables');
    process.exit(1);
  }
  
  // Initialize the REST API
  const rest = new REST({ version: '10' }).setToken(token);
  
  try {
    const commands = await collectCommands();
    
    if (commands.length === 0) {
      logger.warn('No commands found to register');
      return;
    }
    
    logger.info(`Registering ${commands.length} application commands...`);
    
    // Register the commands
    const data = await rest.put(
      Routes.applicationCommands(applicationId),
      { body: commands }
    );
    
    logger.info(`Successfully registered ${data.length} application commands`);
  } catch (error) {
    logger.error('Error registering commands:', error);
    throw error;
  }
}

// Run the registration process
registerCommands().then(() => {
  logger.info('Command registration complete!');
  process.exit(0);
}).catch(error => {
  logger.error('Fatal error during command registration:', error);
  process.exit(1);
});