import express from 'express';
import logger from '../../utils/logger.js';
import { isAuthenticated } from './middleware.js';

const router = express.Router();

// API get thông tin bot
router.get('/bot', isAuthenticated, async (req, res) => {
  try {
    const client = req.app.get('client');
    
    res.json({
      username: client.user.username,
      id: client.user.id,
      guilds: client.guilds.cache.size,
      users: client.users.cache.size,
      avatar: client.user.displayAvatarURL({ dynamic: true, size: 1024 }),
      status: client.user.presence?.status || 'offline',
      activity: client.user.presence?.activities[0] || null,
      createdAt: client.user.createdAt,
    });
  } catch (error) {
    logger.error('Error fetching bot info:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
