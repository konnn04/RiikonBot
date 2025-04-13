import express from 'express';
import logger from '../utils/logger.js';
import prisma from '../utils/prisma.js';
import * as db from '../database/db.js';

const router = express.Router();

// Middleware kiểm tra xác thực
const isAuthenticated = (req, res, next) => {
  next();
};

// API get thông tin bot
router.get('/bot', isAuthenticated, async (req, res) => {
  try {
    const client = req.app.get('client');
    
    res.json({
      username: client.user.username,
      id: client.user.id,
      guilds: client.guilds.cache.size,
      users: client.users.cache.size
    });
  } catch (error) {
    logger.error('Error fetching bot info:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API lấy danh sách servers
router.get('/guilds', isAuthenticated, async (req, res) => {
  try {
    const client = req.app.get('client');
    
    // Lấy danh sách guilds từ Discord API
    const discordGuilds = client.guilds.cache.map(guild => ({
      id: guild.id,
      name: guild.name,
      memberCount: guild.memberCount,
      icon: guild.iconURL()
    }));
    
    // Lấy thông tin từ database
    const dbGuilds = await prisma.guild.findMany({
      select: {
        id: true,
        prefix: true
      }
    });
    
    // Gộp thông tin
    const guildsMap = new Map();
    dbGuilds.forEach(guild => guildsMap.set(guild.id, guild));
    
    const guilds = discordGuilds.map(guild => ({
      ...guild,
      prefix: guildsMap.has(guild.id) ? guildsMap.get(guild.id).prefix : '!'
    }));
    
    // Đồng bộ guilds vào database nếu chưa có
    for (const guild of discordGuilds) {
      if (!guildsMap.has(guild.id)) {
        await prisma.guild.upsert({
          where: { id: guild.id },
          update: { name: guild.name },
          create: {
            id: guild.id,
            name: guild.name,
            prefix: '!'
          }
        });
      }
    }
    
    res.json(guilds);
  } catch (error) {
    logger.error('Error fetching guilds:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API lấy chi tiết server
router.get('/guilds/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const client = req.app.get('client');
    
    // Kiểm tra guild trong Discord
    const discordGuild = client.guilds.cache.get(id);
    if (!discordGuild) {
      return res.status(404).json({ error: 'Guild not found' });
    }
    
    // Lấy thông tin từ database
    let dbGuild = await prisma.guild.findUnique({
      where: { id },
      include: {
        commands: true
      }
    });
    
    // Tạo guild trong database nếu chưa có
    if (!dbGuild) {
      dbGuild = await prisma.guild.create({
        data: {
          id,
          name: discordGuild.name,
          prefix: '!'
        },
        include: {
          commands: true
        }
      });
    }
    
    // Gộp thông tin
    const guild = {
      id: discordGuild.id,
      name: discordGuild.name,
      memberCount: discordGuild.memberCount,
      icon: discordGuild.iconURL(),
      prefix: dbGuild.prefix,
      commands: dbGuild.commands
    };
    
    res.json(guild);
  } catch (error) {
    logger.error(`Error fetching guild ${req.params.id}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API cập nhật prefix của server
router.patch('/guilds/:id/prefix', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const { prefix } = req.body;
    
    if (!prefix) {
      return res.status(400).json({ error: 'Prefix is required' });
    }
    
    // Cập nhật trong database
    const guild = await prisma.guild.update({
      where: { id },
      data: { prefix }
    });
    
    res.json(guild);
  } catch (error) {
    logger.error(`Error updating guild ${req.params.id} prefix:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

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

// NEW: API lấy danh sách packages
router.get('/packages', isAuthenticated, async (req, res) => {
  try {
    const packageManager = req.packageManager;
    
    if (!packageManager) {
      logger.warn('Package manager not available when fetching packages');
      return res.status(500).json({ error: 'Package manager not initialized' });
    }
    
    // Get all packages from package manager
    const packages = packageManager.getAllPackages();
    
    res.json(packages);
  } catch (error) {
    logger.error('Error fetching packages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// NEW: API bật/tắt package
router.patch('/packages/:name', isAuthenticated, async (req, res) => {
  try {
    const { name } = req.params;
    const { enabled } = req.body;
    const packageManager = req.packageManager;
    
    if (!packageManager) {
      logger.warn('Package manager not available when updating package');
      return res.status(500).json({ error: 'Package manager not initialized' });
    }
    
    if (enabled === undefined) {
      return res.status(400).json({ error: 'Enabled status is required' });
    }
    
    // Toggle package status
    const success = await packageManager.togglePackage(name, enabled);
    
    if (!success) {
      return res.status(404).json({ error: 'Package not found or could not be updated' });
    }
    
    // Get the updated package
    const packages = packageManager.getAllPackages();
    const updatedPackage = packages.find(pkg => pkg.name === name);
    
    res.json(updatedPackage);
  } catch (error) {
    logger.error(`Error updating package ${req.params.name}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// NEW: API lấy cấu hình package
router.get('/packages/:name/config', isAuthenticated, async (req, res) => {
  try {
    const { name } = req.params;
    const packageManager = req.packageManager;
    
    if (!packageManager) {
      logger.warn('Package manager not available when fetching package config');
      return res.status(500).json({ error: 'Package manager not initialized' });
    }
    
    // Get package from package manager
    const packages = packageManager.getAllPackages();
    const packageData = packages.find(pkg => pkg.name === name);
    
    if (!packageData) {
      return res.status(404).json({ error: 'Package not found' });
    }
    
    res.json(packageData.config || {});
  } catch (error) {
    logger.error(`Error fetching package config for ${req.params.name}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// NEW: API cập nhật cấu hình package
router.patch('/packages/:name/config', isAuthenticated, async (req, res) => {
  try {
    const { name } = req.params;
    const { config } = req.body;
    
    if (!config) {
      return res.status(400).json({ error: 'Config is required' });
    }
    
    // Update package config in database
    await db.updatePackage(name, { config: JSON.stringify(config) });
    
    // Call onConfigUpdate if it exists for the package
    const packageManager = req.packageManager;
    if (packageManager) {
      const packageData = packageManager.packages.get(name);
      if (packageData && packageData.module && packageData.module.onConfigUpdate) {
        try {
          await packageData.module.onConfigUpdate(config);
          logger.info(`Config updated for package ${name}`);
        } catch (updateError) {
          logger.error(`Error in onConfigUpdate for package ${name}:`, updateError);
        }
      }
    }
    
    res.json({ success: true, config });
  } catch (error) {
    logger.error(`Error updating package config for ${req.params.name}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// NEW: API lấy thống kê tổng quan
router.get('/stats', isAuthenticated, async (req, res) => {
  try {
    const client = req.discordClient;
    const packageManager = req.packageManager;
    
    if (!client || !packageManager) {
      return res.status(500).json({ error: 'Required services not initialized' });
    }
    
    // Get total counts
    const guildCount = client.guilds.cache.size;
    const userCount = client.users.cache.size;
    const packages = packageManager.getAllPackages();
    const enabledPackages = packages.filter(pkg => pkg.enabled).length;
    
    // Get command counts
    let commandCount = 0;
    if (client.commands) {
      commandCount += client.commands.size;
    }
    if (client.prefixCommands) {
      commandCount += client.prefixCommands.size;
    }
    
    // Calculate uptime
    const uptime = client.uptime;
    const uptimeFormatted = formatUptime(uptime);
    
    res.json({
      guilds: guildCount,
      users: userCount,
      packages: {
        total: packages.length,
        enabled: enabledPackages
      },
      commands: commandCount,
      uptime: uptimeFormatted
    });
  } catch (error) {
    logger.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to format uptime
function formatUptime(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  return {
    days,
    hours: hours % 24,
    minutes: minutes % 60,
    seconds: seconds % 60,
    total: {
      days: days,
      hours: hours,
      minutes: minutes,
      seconds: seconds
    }
  };
}

import apiRoutes from './api/index.js';

export default apiRoutes;