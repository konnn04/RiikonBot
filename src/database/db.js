import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// Get directory path
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_DIR = path.resolve(__dirname, '../../data');
const PRISMA_SCHEMA_PATH = path.resolve(__dirname, '../../prisma/schema.prisma');

// Initialize Prisma client
const prisma = new PrismaClient({
  log: [
    { level: 'warn', emit: 'event' },
    { level: 'error', emit: 'event' }
  ]
});

// Set up logging
prisma.$on('warn', (e) => {
  logger.warn(`Prisma warning: ${e.message}`);
});

prisma.$on('error', (e) => {
  logger.error(`Prisma error: ${e.message}`);
});

// Setup database function
export async function setupDatabase() {
  try {
    // Ensure database directory exists
    if (!fs.existsSync(DB_DIR)) {
      logger.info(`Creating database directory: ${DB_DIR}`);
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    
    // Check if schema.prisma file exists
    if (!fs.existsSync(PRISMA_SCHEMA_PATH)) {
      logger.error('Prisma schema file not found. Please create one at prisma/schema.prisma');
      throw new Error('Missing Prisma schema file');
    }
    
    // If database doesn't exist yet, initialize it with prisma
    const dbFilePath = path.join(DB_DIR, 'database.db');
    if (!fs.existsSync(dbFilePath)) {
      logger.info('Database file not found, running prisma migration deploy');
      try {
        execSync('npx prisma migrate dev --name init', { stdio: 'inherit' });
      } catch (error) {
        logger.warn('Could not run migrations, attempting to generate client only');
        execSync('npx prisma generate', { stdio: 'inherit' });
      }
    }
    
    // Test connection
    await prisma.$connect();
    logger.info('Database connection established successfully');
    return prisma;
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
    throw error;
  }
}

// Helper functions for database access

// Package operations
export async function getPackages() {
  return prisma.package.findMany();
}

export async function getPackageByName(name) {
  return prisma.package.findUnique({ where: { name } });
}

export async function createPackage(data) {
  return prisma.package.create({ data });
}

export async function updatePackage(name, data) {
  return prisma.package.update({
    where: { name },
    data
  });
}

export async function togglePackage(name, enabled) {
  return prisma.package.update({
    where: { name },
    data: { enabled }
  });
}

// User operations
export async function getUserByDiscordId(discordId) {
  return prisma.user.findUnique({ 
    where: { discordId },
    include: { permissions: true }
  });
}

export async function createUser(data) {
  return prisma.user.create({ data });
}

export async function updateUser(id, data) {
  return prisma.user.update({
    where: { id },
    data
  });
}

// Config operations
export async function getConfig(key) {
  const entry = await prisma.config.findUnique({ where: { key } });
  return entry ? entry.value : null;
}

export async function setConfig(key, value) {
  return prisma.config.upsert({
    where: { key },
    update: { value },
    create: { key, value }
  });
}

export default prisma;
