import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { Package } from '../database/db.js';
import logger from '../utils/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PACKAGES_DIR = path.join(__dirname, 'available');

class PackageManager {
  constructor() {
    this.packages = new Map();
    this.events = new Map();
  }
  
  // Register an event listener from a package
  registerEventListener(eventName, callback, packageName) {
    if (!this.events.has(eventName)) {
      this.events.set(eventName, []);
    }
    
    this.events.get(eventName).push({
      callback,
      packageName
    });
    
    logger.debug(`Package ${packageName} registered event listener for ${eventName}`);
  }
  
  // Emit an event to all registered listeners
  async emitEvent(eventName, ...args) {
    if (!this.events.has(eventName)) return;
    
    const listeners = this.events.get(eventName);
    
    for (const listener of listeners) {
      try {
        // Check if the package is enabled before processing the event
        const pkg = this.packages.get(listener.packageName);
        if (pkg && pkg.enabled) {
          await listener.callback(...args);
        }
      } catch (error) {
        logger.error(`Error in package ${listener.packageName} handling event ${eventName}:`, error);
      }
    }
  }
  
  // Load a package from its directory
  async loadPackage(packageDir) {
    try {
      const packageJson = JSON.parse(fs.readFileSync(path.join(packageDir, 'package.json'), 'utf8'));
      const packageName = packageJson.name;
      
      // Check if package exists in database, create if not
      let [pkgEntity] = await Package.findOrCreate({
        where: { name: packageName },
        defaults: {
          version: packageJson.version,
          enabled: true,
          config: packageJson.defaultConfig || {}
        }
      });
      
      // Import the package's main file - Convert Windows path to file:// URL
      const mainFilePath = path.join(packageDir, packageJson.main);
      const packageModule = await import(pathToFileURL(mainFilePath).href);
      
      // Store the package in our map
      this.packages.set(packageName, {
        name: packageName,
        version: packageJson.version,
        enabled: pkgEntity.enabled,
        config: pkgEntity.config,
        module: packageModule,
        manifest: packageJson
      });
      
      logger.info(`Loaded package: ${packageName} v${packageJson.version}`);
      return packageName;
    } catch (error) {
      logger.error(`Failed to load package from ${packageDir}:`, error);
      return null;
    }
  }
  
  // Initialize all loaded packages
  async initializePackages(client) {
    for (const [name, pkg] of this.packages) {
      if (pkg.enabled && pkg.module.initialize) {
        try {
          await pkg.module.initialize(client, this, pkg.config);
          logger.info(`Initialized package: ${name}`);
        } catch (error) {
          logger.error(`Failed to initialize package ${name}:`, error);
        }
      }
    }
  }
  
  // Enable or disable a package
  async togglePackage(packageName, enabled) {
    const pkg = this.packages.get(packageName);
    if (!pkg) return false;
    
    try {
      // Update database
      await Package.update({ enabled }, { where: { name: packageName } });
      
      // Update local cache
      pkg.enabled = enabled;
      
      // Call lifecycle hooks if they exist
      if (enabled && pkg.module.onEnable) {
        await pkg.module.onEnable();
      } else if (!enabled && pkg.module.onDisable) {
        await pkg.module.onDisable();
      }
      
      logger.info(`Package ${packageName} ${enabled ? 'enabled' : 'disabled'}`);
      return true;
    } catch (error) {
      logger.error(`Failed to ${enabled ? 'enable' : 'disable'} package ${packageName}:`, error);
      return false;
    }
  }
  
  // Get all packages
  getAllPackages() {
    return Array.from(this.packages.values()).map(pkg => ({
      name: pkg.name,
      version: pkg.version,
      enabled: pkg.enabled,
      description: pkg.manifest.description,
      author: pkg.manifest.author
    }));
  }
}

// Create and load all packages
export async function loadPackages() {
  const packageManager = new PackageManager();
  
  // Ensure packages directory exists
  if (!fs.existsSync(PACKAGES_DIR)) {
    fs.mkdirSync(PACKAGES_DIR, { recursive: true });
  }
  
  // Load each package in the directory
  const packageDirs = fs.readdirSync(PACKAGES_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => path.join(PACKAGES_DIR, dirent.name));
  
  for (const packageDir of packageDirs) {
    await packageManager.loadPackage(packageDir);
  }
  
  return packageManager;
}

export default PackageManager;
