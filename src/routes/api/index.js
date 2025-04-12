import express from 'express';
import botRoutes from './bot.js';
import guildRoutes from './guilds.js';
import commandRoutes from './commands.js';
import packageRoutes from './packages.js';
import statsRoutes from './stats.js';

const router = express.Router();

// Mount all route files
router.use('/', botRoutes);
router.use('/', guildRoutes);
router.use('/', commandRoutes);
router.use('/', packageRoutes);
router.use('/', statsRoutes);

export default router;
