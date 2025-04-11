import express from 'express';
import session from 'express-session';
import passport from 'passport';
import { Strategy as DiscordStrategy } from 'passport-discord';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import helmet from 'helmet';
import { User } from '../database/db.js';
import logger from '../utils/logger.js';
import apiRoutes from './routes/api.js';
import authRoutes from './routes/auth.js';
import dashboardRoutes from './routes/dashboard.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function startWeb(client, packageManager) {
  const app = express();
  const PORT = process.env.PORT || 3000;
  
  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", 'cdn.jsdelivr.net'],
        styleSrc: ["'self'", "'unsafe-inline'", 'cdn.jsdelivr.net'],
        imgSrc: ["'self'", 'cdn.discordapp.com', 'data:'],
      },
    }
  }));
  app.use(cors({ origin: process.env.CORS_ORIGIN || true, credentials: true }));
  
  // Setup view engine
  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'views'));
  
  // Body parser middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // Static files
  app.use(express.static(path.join(__dirname, 'public')));
  
  // Session middleware
  app.use(session({
    secret: process.env.SESSION_SECRET || 'your_session_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
  }));
  
  // Setup passport
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Configure Discord strategy
  passport.use(new DiscordStrategy({
    clientID: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL || `http://localhost:${process.env.PORT}/auth/discord/callback`,
    scope: ['identify']
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Find or create user
      const [user] = await User.findOrCreate({
        where: { discordId: profile.id },
        defaults: {
          username: profile.username,
          avatar: profile.avatar,
          isAdmin: false
        }
      });
      
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }));
  
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findByPk(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
  
  // Authentication middleware
  const checkAuth = (req, res, next) => {
    // Allow direct access from localhost without login
    const isLocalhost = req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === '::ffff:127.0.0.1';
    
    if (isLocalhost) {
      // For localhost, create a mock admin user if not authenticated
      if (!req.isAuthenticated()) {
        req.user = {
          id: 0,
          discordId: 'localhost',
          username: 'LocalAdmin',
          isAdmin: true
        };
      }
      return next();
    }
    
    // For non-localhost, require authentication
    if (!req.isAuthenticated()) {
      return res.redirect('/auth/login');
    }
    
    next();
  };
  
  // Admin middleware
  const checkAdmin = (req, res, next) => {
    if (!req.user.isAdmin) {
      return res.status(403).render('error', {
        error: 'Access denied',
        message: 'You need admin permissions to access this page.'
      });
    }
    next();
  };
  
  // Add bot client and package manager to request object
  app.use((req, res, next) => {
    req.discordClient = client;
    req.packageManager = packageManager;
    next();
  });
  
  // Routes
  app.use('/auth', authRoutes);
  app.use('/api', apiRoutes);
  app.use('/dashboard', checkAuth, dashboardRoutes);
  
  // Admin routes
  app.use('/admin', checkAuth, checkAdmin, (req, res) => {
    res.render('admin', {
      user: req.user,
      packages: packageManager.getAllPackages()
    });
  });
  
  // Root route
  app.get('/', (req, res) => {
    res.render('index', {
      user: req.user,
      isAuthenticated: req.isAuthenticated()
    });
  });
  
  // Error handling
  app.use((err, req, res, next) => {
    logger.error('Server error:', err);
    res.status(500).render('error', {
      error: 'Server Error',
      message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
    });
  });
  
  // Start server
  return new Promise((resolve, reject) => {
    try {
      const server = app.listen(PORT, () => {
        logger.info(`Web server running on port ${PORT}`);
        resolve(server);
      });
    } catch (error) {
      reject(error);
    }
  });
}
