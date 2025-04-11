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
    // Setup database first
    await setupDatabase();
    
    // Load and initialize all packages
    const packages = await loadPackages();
    
    // Start Discord bot
    const client = await startBot(packages);
    
    // Start web server
    await startWeb(client, packages);
    
    logger.info('RiikonBot successfully initialized');
  } catch (error) {
    logger.error('Failed to initialize RiikonBot:', error);
    process.exit(1);
  }
}

initialize();
