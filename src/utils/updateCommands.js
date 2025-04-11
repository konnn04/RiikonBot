import dotenv from 'dotenv';
import { REST, Routes } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import logger from './logger.js';
import { Package } from '../database/db.js';
import { setupDatabase } from '../database/db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PACKAGES_DIR = path.join(__dirname, '..', 'packages', 'available');

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
  const enabledPackages = await Package.findAll({ where: { enabled: true } });
  const enabledPackageNames = enabledPackages.map(pkg => pkg.name);
  
  logger.info(`Found ${enabledPackageNames.length} enabled packages: ${enabledPackageNames.join(', ')}`);
  
  // Read all package directories
  const packageDirs = fs.readdirSync(PACKAGES_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory() && enabledPackageNames.includes(dirent.name))
    .map(dirent => path.join(PACKAGES_DIR, dirent.name));
  
  // Process each package
  for (const packageDir of packageDirs) {
    const packageName = path.basename(packageDir);
    logger.info(`Processing package: ${packageName}`);
    
    try {
      // Look for slashCommands.js file in the package
      const slashCommandsPath = path.join(packageDir, 'slashCommands.js');
      
      if (fs.existsSync(slashCommandsPath)) {
        // Import the slash commands file
        const { getCommands } = await import(pathToFileURL(slashCommandsPath).href);
        const packageCommands = await getCommands();
        
        if (Array.isArray(packageCommands) && packageCommands.length > 0) {
          commands.push(...packageCommands);
          logger.info(`Added ${packageCommands.length} commands from ${packageName}`);
        }
      } else {
        logger.info(`No slashCommands.js found in ${packageName}`);
      }
    } catch (error) {
      logger.error(`Error processing commands from ${packageName}:`, error);
    }
  }
  
  return commands;
}

/**
 * Registers all commands with Discord API
 */
async function registerCommands() {
  const commands = await collectCommands();
  
  if (commands.length === 0) {
    logger.warn('No commands found to register.');
    return;
  }
  
  logger.info(`Registering ${commands.length} slash commands with Discord...`);
  
  const token = process.env.DISCORD_TOKEN;
  const clientId = process.env.DISCORD_CLIENT_ID;
  
  if (!token || !clientId) {
    logger.error('Missing DISCORD_TOKEN or DISCORD_CLIENT_ID in .env file');
    process.exit(1);
  }
  
  // Create REST instance
  const rest = new REST({ version: '10' }).setToken(token);
  
  try {
    logger.info('Started refreshing application (/) commands.');
    
    await rest.put(
      Routes.applicationCommands(clientId),
      { body: commands },
    );
    
    logger.info(`Successfully registered ${commands.length} application commands.`);
  } catch (error) {
    logger.error('Error registering slash commands:', error);
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
