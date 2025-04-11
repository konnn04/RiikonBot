import { Sequelize } from 'sequelize';
import fs from 'fs';
import path from 'path';
import logger from '../utils/logger.js';

const dbPath = process.env.DB_PATH || './data/database.sqlite';

// Ensure the directory exists
const dir = path.dirname(dbPath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

// Initialize Sequelize with SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: msg => logger.debug(msg),
});

// Define models
export const Package = sequelize.define('Package', {
  name: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  },
  enabled: {
    type: Sequelize.BOOLEAN,
    defaultValue: true
  },
  version: {
    type: Sequelize.STRING
  },
  config: {
    type: Sequelize.JSON,
    defaultValue: {}
  }
});

export const User = sequelize.define('User', {
  discordId: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  },
  username: {
    type: Sequelize.STRING
  },
  avatar: {
    type: Sequelize.STRING
  },
  isAdmin: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  }
});

export const Permission = sequelize.define('Permission', {
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  value: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  }
});

// Define relationships
User.hasMany(Permission);
Permission.belongsTo(User);
Package.hasMany(Permission);
Permission.belongsTo(Package);

export async function setupDatabase() {
  try {
    // Test connection
    await sequelize.authenticate();
    logger.info('Database connection established successfully');
    
    // Sync models with database
    await sequelize.sync();
    logger.info('Database models synchronized');
    
    return sequelize;
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
    throw error;
  }
}

export default sequelize;
