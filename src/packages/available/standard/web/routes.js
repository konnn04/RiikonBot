import express from 'express';
import logger from '../../../../utils/logger.js';

// Create router
const router = express.Router();

// Standard package dashboard
router.get('/', (req, res) => {
  try {
    res.render('dashboard', { // No longer use 'package-standard', use 'dashboard' instead
      user: req.user,
      package: req.packageManager.packages.get('standard'),
      botClient: req.discordClient
    });
  } catch (error) {
    logger.error('Error rendering standard package dashboard:', error);
    res.status(500).render('error', {
      error: 'Server Error',
      message: 'Failed to render standard package dashboard'
    });
  }
});

// Additional routes for standard package functionality
router.get('/commands', (req, res) => {
  try {
    const commandList = Array.from(req.discordClient.commands.values())
      .map(cmd => ({
        name: cmd.config?.name,
        description: cmd.config?.description,
        category: cmd.config?.category
      }))
      .filter(cmd => cmd.name); // Filter out any undefined commands
      
    res.render('commands', { // Use 'commands' instead of 'package-commands'
      user: req.user,
      commands: commandList,
      package: req.packageManager.packages.get('standard')
    });
  } catch (error) {
    logger.error('Error rendering standard package commands:', error);
    res.status(500).render('error', {
      error: 'Server Error',
      message: 'Failed to load command list'
    });
  }
});

export default router;
