import express from 'express';
import logger from '../../utils/logger.js';

const router = express.Router();

// Main dashboard page
router.get('/', (req, res) => {
  const packages = req.packageManager.getAllPackages();
  
  res.render('dashboard', {
    user: req.user,
    packages: packages,
    botStatus: {
      uptime: req.discordClient.uptime,
      serverCount: req.discordClient.guilds.cache.size,
      status: req.discordClient.user.presence.status
    }
  });
});

// Package details page
router.get('/packages/:name', async (req, res) => {
  const { name } = req.params;
  const packageManager = req.packageManager;
  const packageData = packageManager.packages.get(name);
  
  if (!packageData) {
    return res.status(404).render('error', {
      error: 'Package not found',
      message: `The package "${name}" does not exist.`
    });
  }
  
  res.render('package-details', {
    user: req.user,
    package: packageData
  });
});

// Package configuration page (admin only)
router.get('/packages/:name/config', (req, res, next) => {
  // Check if user is admin
  if (!req.user.isAdmin) {
    return res.status(403).render('error', {
      error: 'Access denied',
      message: 'You need admin permissions to access this page.'
    });
  }
  
  const { name } = req.params;
  const packageManager = req.packageManager;
  const packageData = packageManager.packages.get(name);
  
  if (!packageData) {
    return res.status(404).render('error', {
      error: 'Package not found',
      message: `The package "${name}" does not exist.`
    });
  }
  
  res.render('package-config', {
    user: req.user,
    package: packageData
  });
});

export default router;
