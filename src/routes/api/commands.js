import express from 'express';
import logger from '../../utils/logger.js';
import prisma from '../../utils/prisma.js';
import { isAuthenticated } from './middleware.js';

const router = express.Router();

// API lấy danh sách lệnh
router.get('/commands', isAuthenticated, async (req, res) => {
  try {
    const client = req.discordClient;
    const packageManager = req.packageManager;
    
    if (!client) {
      logger.warn('Discord client not available when fetching commands');
      return res.status(500).json({ error: 'Discord client not initialized' });
    }

    // Initialize empty arrays
    let slashCommands = [];
    let prefixCommands = [];
    
    // Safely retrieve slash commands if they exist
    if (client.commands && typeof client.commands.values === 'function') {
      slashCommands = Array.from(client.commands.values())
        .filter(cmd => cmd && cmd.config)
        .map(cmd => ({
          name: cmd.config.name,
          description: cmd.config.description || 'No description',
          type: 'SLASH',
          category: cmd.config.category || 'Uncategorized',
          enabled: true, // Default status
          package: cmd.config.package || 'unknown'
        }));
    } else {
      logger.warn('No commands collection found on Discord client');
    }
    
    // Safely retrieve prefix commands if they exist
    if (client.prefixCommands && typeof client.prefixCommands.values === 'function') {
      prefixCommands = Array.from(client.prefixCommands.values())
        .filter(cmd => cmd && cmd.config)
        .map(cmd => ({
          name: cmd.config.name,
          description: cmd.config.description || 'No description',
          type: 'PREFIX',
          category: cmd.config.category || 'Uncategorized',
          enabled: true, // Default status
          package: cmd.config.package || 'unknown'
        }));
    } else if (packageManager && packageManager.getAllPrefixCommands) {
      
      // Try to get prefix commands from package manager as an alternative
      try {
        
        prefixCommands = packageManager.getAllPrefixCommands()
          .map(cmd => ({
            name: cmd.name,
            description: cmd.description || 'No description',
            type: 'PREFIX',
            category: cmd.category || 'Uncategorized',
            enabled: true, // Default status
            package: cmd.package || 'unknown'
          }));
      } catch (prefixError) {
        logger.warn('Failed to get prefix commands from package manager:', prefixError);
      }
    }
    
    // Add command status from database if available
    try {
      const dbCommands = await prisma.command.findMany();
      const commandMap = new Map();
      
      // Create a map of command status by name and type
      dbCommands.forEach(cmd => {
        commandMap.set(`${cmd.type}-${cmd.name}`, cmd.enabled);
      });
      
      // Update status for slash commands
      slashCommands = slashCommands.map(cmd => {
        const key = `SLASH-${cmd.name}`;
        if (commandMap.has(key)) {
          cmd.enabled = commandMap.get(key);
        }
        return cmd;
      });
      
      // Update status for prefix commands
      prefixCommands = prefixCommands.map(cmd => {
        const key = `PREFIX-${cmd.name}`;
        if (commandMap.has(key)) {
          cmd.enabled = commandMap.get(key);
        }
        return cmd;
      });
    } catch (statusError) {
      logger.warn('Failed to get command status from database:', statusError);
    }
    
    // Combine and return commands
    const commands = [...slashCommands, ...prefixCommands];
    
    res.json(commands);
  } catch (error) {
    logger.error('Error fetching commands:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API bật/tắt lệnh
router.patch('/commands/:guildId/:commandName', isAuthenticated, async (req, res) => {
  try {
    const { guildId, commandName } = req.params;
    const { enabled, type = 'SLASH' } = req.body;
    
    if (enabled === undefined) {
      return res.status(400).json({ error: 'Enabled status is required' });
    }
    
    // Tìm lệnh trong database
    let command = await prisma.command.findFirst({
      where: {
        name: commandName,
        guildId,
        type
      }
    });
    
    // Nếu chưa có, tạo mới
    if (!command) {
      command = await prisma.command.create({
        data: {
          name: commandName,
          type,
          enabled,
          guild: {
            connect: {
              id: guildId
            }
          }
        }
      });
    } else {
      // Nếu đã có, cập nhật
      command = await prisma.command.update({
        where: { id: command.id },
        data: { enabled }
      });
    }
    
    res.json(command);
  } catch (error) {
    logger.error(`Error updating command:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
