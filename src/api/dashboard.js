import express from 'express';
const router = express.Router();

// API endpoint replacing dashboard rendering
router.get('/api/dashboard', (req, res) => {
  const packages = req.packageManager.getAllPackages();
  
  res.json({
    packages: packages,
    botStatus: {
      uptime: req.discordClient.uptime,
      serverCount: req.discordClient.guilds.cache.size,
      status: req.discordClient.user.presence.status
    }
  });
});

export default router;
