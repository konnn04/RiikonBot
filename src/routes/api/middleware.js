import logger from '../../utils/logger.js';

// Authentication middleware
export const isAuthenticated = (req, res, next) => {
  next();
};
