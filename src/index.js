import dotenv from 'dotenv';
import { startBot } from './bot/bot.js';
import { startWeb } from './web/server.js';
import { setupDatabase } from './database/db.js';
import { loadPackages } from './packages/packageManager.js';
import logger from './utils/logger.js';

// Load environment variables
dotenv.config();

async function initialize() {
  try {
    logger.info("Starting RiikonBot...");
    
    // 1. Setup database first
    logger.info("Setting up database...");
    await setupDatabase();
    
    // 2. Load and initialize all packages
    logger.info("Loading packages...");
    const packageManager = await loadPackages();
    
    // 3. Start Discord bot
    logger.info("Starting Discord bot...");
    const client = await startBot(packageManager);
    
    // 4. Start web server
    logger.info("Starting web server...");
    await startWeb(client, packageManager);
    
    logger.info('RiikonBot successfully initialized');
  } catch (error) {
    logger.error('Failed to initialize RiikonBot:', error);
    process.exit(1);
  }
}

// Run the initialization process
initialize();
