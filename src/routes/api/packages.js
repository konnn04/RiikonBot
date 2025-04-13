import express from 'express';
import logger from '../../utils/logger.js';
import * as db from '../../database/db.js';
import { isAuthenticated } from './middleware.js';

const router = express.Router();

// API lấy danh sách packages
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

// API bật/tắt package
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

// API lấy cấu hình package
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

// API cập nhật cấu hình package
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

export default router;
