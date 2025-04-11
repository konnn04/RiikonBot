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
const REACT_BUILD_PATH = path.join(__dirname, '../../client/build');

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
        connectSrc: ["'self'", 'discord.com']
      },
    }
  }));
  app.use(cors({ origin: process.env.CORS_ORIGIN || true, credentials: true }));
  
  // Body parser middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // Set up view engine - THIS IS THE CRITICAL ADDITION
  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'views'));
  
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
    callbackURL: process.env.CALLBACK_URL || `http://localhost:${PORT}/auth/discord/callback`,
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
  
  // Add root route handler
  app.get('/', (req, res) => {
    res.render('home', {
      user: req.user
    });
  });
  
  // Admin routes
  app.use('/admin', checkAuth, checkAdmin, (req, res) => {
    res.render('admin', {
      user: req.user,
      packages: packageManager.getAllPackages()
    });
  });
  
  // Register package web routes
  const webRoutes = packageManager.getWebRoutes();
  webRoutes.forEach((routeInfo, packageName) => {
    const pkg = packageManager.packages.get(packageName);
    if (pkg && pkg.enabled) {
      // For API routes
      const apiBasePath = `/api/packages/${packageName}`;
      app.use(apiBasePath, checkAuth, routeInfo.handler);
      logger.info(`Registered API route for package ${packageName} at ${apiBasePath}`);
      
      // For package-specific web routes
      if (routeInfo.views) {
        const webBasePath = `/packages/${packageName}`;
        // Create a new router for the package's web routes
        const packageRouter = express.Router();
        
        // Add middleware to use package-specific views
        packageRouter.use((req, res, next) => {
          const originalRender = res.render;
          res.render = function(view, options, callback) {
            const opts = { ...options };
            // Set package-specific views folder
            const originalViewPath = app.get('views');
            app.set('views', routeInfo.views);
            
            originalRender.call(this, view, opts, (err, html) => {
              // Restore original views path
              app.set('views', originalViewPath);
              
              if (err) {
                logger.error(`Error rendering package view ${view}:`, err);
                // Try fallback to default views
                originalRender.call(this, view, opts, callback);
              } else if (callback) {
                callback(null, html);
              } else {
                this.send(html);
              }
            });
          };
          next();
        });
        
        // Use the package's routes with the package router
        packageRouter.use(routeInfo.handler);
        
        // Mount the package router
        app.use(webBasePath, checkAuth, packageRouter);
        logger.info(`Registered web route for package ${packageName} at ${webBasePath}`);
      }
    }
  });

  // Serve React static files in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(REACT_BUILD_PATH));
    
    // All other GET requests not handled before will return the React app
    app.get('*', (req, res) => {
      res.sendFile(path.join(REACT_BUILD_PATH, 'index.html'));
    });
  }
  
  // Error handling
  app.use((err, req, res, next) => {
    logger.error('Server error:', err);
    res.status(500).json({
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
