import express from 'express';
import passport from 'passport';
import logger from '../../utils/logger.js';

const router = express.Router();

// Login route - redirects to Discord OAuth
router.get('/login', (req, res, next) => {
  // Check if this is a request from localhost, which already has admin access
  const isLocalhost = req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === '::ffff:127.0.0.1';
  if (isLocalhost) {
    return res.redirect('/dashboard');
  }
  
  passport.authenticate('discord', {
    scope: ['identify']
  })(req, res, next);
});

// Discord OAuth callback route
router.get('/discord/callback',
  passport.authenticate('discord', {
    failureRedirect: '/auth/login-failed'
  }),
  (req, res) => {
    // Successful authentication, redirect to dashboard
    logger.info(`User ${req.user.username} (${req.user.discordId}) successfully logged in`);
    res.redirect('/dashboard');
  }
);

// Login failed route
router.get('/login-failed', (req, res) => {
  res.render('login-failed', {
    error: 'Authentication failed',
    message: 'There was a problem logging in with Discord.'
  });
});

// Logout route
router.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) { 
      logger.error('Error during logout:', err);
      return next(err); 
    }
    res.redirect('/');
  });
});

export default router;
