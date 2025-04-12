import express from 'express';
import logger from '../../utils/logger.js';
import { isAuthenticated } from './middleware.js';

const router = express.Router();

// API lấy thống kê tổng quan
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
      packagesStatus: `${enabledPackages} / ${packages.length}`,
      commands: commandCount,
      uptime: uptimeFormatted,
      startedTimestamp: client.readyTimestamp,
      startedAt: new Date(client.readyTimestamp).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
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

export default router;
