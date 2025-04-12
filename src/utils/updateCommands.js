import dotenv from 'dotenv';
import { REST, Routes } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import logger from './logger.js';
import prisma, { setupDatabase } from '../database/db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Sửa lại đường dẫn đến thư mục packages cho đúng với thực tế
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
  
  // Kiểm tra thư mục packages có tồn tại không
  if (!fs.existsSync(PACKAGES_DIR)) {
    logger.error(`Cannot find packages directory at: ${PACKAGES_DIR}`);
    return commands;
  }
  
  logger.info(`Using packages directory: ${PACKAGES_DIR}`);
  
  // Đọc thư mục packages
  const dirContents = fs.readdirSync(PACKAGES_DIR, { withFileTypes: true });
  logger.debug(`Found ${dirContents.length} items in packages directory`);
  
  const availablePackages = dirContents
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  logger.debug(`Available package directories: ${availablePackages.join(', ')}`);
  
  // Kiểm tra các package được bật có tồn tại trong thư mục không
  const missingPackages = enabledPackageNames.filter(name => !availablePackages.includes(name));
  if (missingPackages.length > 0) {
    logger.warn(`These enabled packages are missing from the packages directory: ${missingPackages.join(', ')}`);
  }
  
  // Chuẩn hóa tên package - xử lý trường hợp youtube-music-bot vs ytmusic
  const normalizedNames = {
    'youtube-music-bot': 'ytmusic',
    'ytmusic': 'ytmusic'
  };
  
  const packageDirs = [];
  for (const pkgName of enabledPackageNames) {
    const normalizedName = normalizedNames[pkgName] || pkgName;
    
    // Tìm kiếm package với tên gốc hoặc tên chuẩn hóa
    const possibleNames = [pkgName, normalizedName];
    let found = false;
    
    for (const name of possibleNames) {
      const packagePath = path.join(PACKAGES_DIR, name);
      if (fs.existsSync(packagePath)) {
        packageDirs.push(packagePath);
        logger.debug(`Found package directory for ${pkgName} at ${packagePath}`);
        found = true;
        break;
      }
    }
    
    if (!found) {
      logger.warn(`Could not find directory for package: ${pkgName}`);
    }
  }
  
  // Process each package
  for (const packageDir of packageDirs) {
    const packageName = path.basename(packageDir);
    logger.info(`Processing package: ${packageName}`);
    
    try {
      // Các vị trí có thể chứa lệnh slash
      const possibleCommandPaths = [
        path.join(packageDir, 'slashCommands.js'),
        path.join(packageDir, 'commands', 'slashCommands.js'),
        path.join(packageDir, 'commands', 'index.js')
      ];
      
      let slashCommandsPath = null;
      for (const cmdPath of possibleCommandPaths) {
        if (fs.existsSync(cmdPath)) {
          slashCommandsPath = cmdPath;
          logger.debug(`Found commands at ${cmdPath}`);
          break;
        }
      }
      
      if (slashCommandsPath) {
        // Import the slash commands file
        logger.debug(`Importing commands from ${slashCommandsPath}`);
        const commandModule = await import(pathToFileURL(slashCommandsPath).href);
        
        // Kiểm tra các hàm có thể trả về lệnh
        const possibleFunctions = ['getCommands', 'registerSlashCommands', 'getSlashCommands'];
        let packageCommands = [];
        
        for (const funcName of possibleFunctions) {
          if (typeof commandModule[funcName] === 'function') {
            try {
              const result = await commandModule[funcName]();
              if (Array.isArray(result) && result.length > 0) {
                packageCommands = result;
                logger.debug(`Got ${result.length} commands from ${funcName}()`);
                break;
              }
            } catch (funcError) {
              logger.warn(`Error calling ${funcName} in ${packageName}: ${funcError.message}`);
            }
          }
        }
        
        if (packageCommands.length > 0) {
          commands.push(...packageCommands);
          logger.info(`Added ${packageCommands.length} commands from ${packageName}`);
        } else {
          logger.warn(`No commands returned from ${packageName}`);
        }
      } else {
        logger.info(`No command files found in ${packageName}`);
      }
    } catch (error) {
      logger.error(`Error processing commands from ${packageName}:`, error);
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
