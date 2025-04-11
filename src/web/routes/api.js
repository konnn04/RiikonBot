import express from 'express';
import { Package } from '../../database/db.js';
import logger from '../../utils/logger.js';

const router = express.Router();

// Authentication middleware for API
const authAPI = (req, res, next) => {
  const isLocalhost = req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === '::ffff:127.0.0.1';
  
  if (isLocalhost || req.isAuthenticated()) {
    return next();
  }
  
  return res.status(401).json({ error: 'Unauthorized' });
};

// Admin middleware for API
const adminAPI = (req, res, next) => {
  if (req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === '::ffff:127.0.0.1' || req.user.isAdmin) {
    return next();
  }
  
  return res.status(403).json({ error: 'Forbidden' });
};

// Get all packages
router.get('/packages', authAPI, (req, res) => {
  try {
    const packages = req.packageManager.getAllPackages();
    res.json(packages);
  } catch (error) {
    logger.error('Error fetching packages:', error);
    res.status(500).json({ error: 'Failed to fetch packages' });
  }
});

// Toggle package enabled state
router.post('/packages/:name/toggle', authAPI, adminAPI, async (req, res) => {
  const { name } = req.params;
  const { enabled } = req.body;
  
  try {
    const success = await req.packageManager.togglePackage(name, enabled);
    
    if (success) {
      res.json({ success: true, name, enabled });
    } else {
      res.status(404).json({ error: 'Package not found' });
    }
  } catch (error) {
    logger.error(`Error toggling package ${name}:`, error);
    res.status(500).json({ error: 'Failed to toggle package' });
  }
});

// Update package configuration
router.post('/packages/:name/config', authAPI, adminAPI, async (req, res) => {
  const { name } = req.params;
  const { config } = req.body;
  
  try {
    const pkg = await Package.findOne({ where: { name } });
    
    if (!pkg) {
      return res.status(404).json({ error: 'Package not found' });
    }
    
    await pkg.update({ config });
    
    // Update the package in memory
    const memoryPackage = req.packageManager.packages.get(name);
    if (memoryPackage) {
      memoryPackage.config = config;
      
      // Call onConfigUpdate if it exists
      if (memoryPackage.module.onConfigUpdate) {
        await memoryPackage.module.onConfigUpdate(config);
      }
    }
    
    res.json({ success: true, name, config });
  } catch (error) {
    logger.error(`Error updating package config for ${name}:`, error);
    res.status(500).json({ error: 'Failed to update package configuration' });
  }
});

// Get bot status
router.get('/status', authAPI, (req, res) => {
  const client = req.discordClient;
  
  res.json({
    uptime: client.uptime,
    serverCount: client.guilds.cache.size,
    status: client.user.presence.status
  });
});

export default router;
