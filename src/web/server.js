import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import logger from '../utils/logger.js'
import apiRoutes from '../routes/api.js';
import viewRoutes from '../routes/views.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function startWebServer(client, packageManager) {
  const app = express();
  const PORT = process.env.WEB_PORT || 3100;
  
  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // Set proper MIME types for JavaScript modules
  app.use((req, res, next) => {
    if (req.path.endsWith('.js')) {
      res.type('application/javascript');
    }
    next();
  });
  
  // Check and log available directories
  const staticPath = path.join(__dirname, '..', 'static');
  const staticAppPath = path.join(__dirname, '..', 'static', 'app');

  
  logger.info(`Checking for static files in: ${staticPath}`);
  
  // Ensure static directories exist
  if (!fs.existsSync(staticPath)) {
    logger.warn(`Static directory not found: ${staticPath}`);
    fs.mkdirSync(staticPath, { recursive: true });
    logger.info(`Created static directory: ${staticPath}`);
  }


  if (!fs.existsSync(staticAppPath)) {
    logger.warn(`App static directory not found: ${staticAppPath}`);
    fs.mkdirSync(staticAppPath, { recursive: true });
    logger.info(`Created app static directory: ${staticAppPath}`);
  }
     
  // Setup static file serving
  logger.info(`Serving static files from: ${staticPath}`);
  app.use(express.static(staticPath, {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.js')) {
        // Ensure JS files are served with the correct MIME type
        res.setHeader('Content-Type', 'application/javascript');
      }
    }
  }));

  // Serve static assets from /app directory but not for routes that should be handled by SPA
  app.use('/app', (req, res, next) => {
    // If the request is for an actual file (asset), serve it
    if (req.path.includes('.')) {
      express.static(staticAppPath, {
        setHeaders: (res, filePath) => {
          if (filePath.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
          }
        }
      })(req, res, next);
    } else {
      // If it's a route (not a file), pass to the SPA handler
      next();
    }
  });

  app.use('/app/*', (req, res) => {
    // Serve the SPA index.html for all /app routes
    const indexPath = path.join(staticAppPath, 'index.html');
    res.sendFile(indexPath, (err) => {
      if (err) {
        logger.error('Error serving index.html:', err);
        res.status(err.status).end();
      }
    });
  });

  // Add request logging middleware
  app.use((req, res, next) => {
    // Add request logging
    logger.info(`Request: ${req.method} ${req.path}`);
    next();
  });
  
  // Add validation for client and packageManager
  if (!client) {
    logger.error('Discord client is undefined when starting web server');
  }
  
  if (!packageManager) {
    logger.error('Package manager is undefined when starting web server');
  } else {
    logger.info('Available packages: ' + 
      (packageManager.getPackages ? 
        JSON.stringify(Object.keys(packageManager.getPackages())) : 
        'getPackages method not available'));
  }
  
  // Store client and packageManager in app for access in routes
  app.set('client', client); 
  app.set('packageManager', packageManager);
  
  // Setup route middleware to make client and packageManager available in requests
  app.use((req, res, next) => {
    req.discordClient = client;
    req.packageManager = packageManager;
    next();
  });
  
  // Register API routes
  app.use('/api', apiRoutes);
  
  // Register view routes (only for specific routes, not catch-all)
  app.use('/', viewRoutes);
  
  
  // Handle 404 errors
  app.use((req, res) => {
    // If API request, return JSON
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ error: 'Route not found' });
    }
    return res.status(404).send(`
      <h1>Route not found</h1>
      <p>The requested route ${req.path} does not exist.</p>
      <p>If you're trying to access the dashboard, make sure you've built it with "npm run build".</p>
    `);
  });
  
  // Error handler
  app.use((err, req, res, next) => {
    logger.error('Web server error:', err);
    if (req.path.startsWith('/api')) {
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.status(500).send('Internal Server Error');
  });
  
  // Start server
  app.listen(PORT, () => {
    logger.info(`WEB: http://localhost:${PORT}`);
  });
  
  return app;
}