const redisClient = require('../database/redisUtil');
const logger = require('../config/logger');

/**
 * Cache middleware for Express routes
 * Usage: router.get('/path', cacheMiddleware(300), controller)
 */
const cacheMiddleware = (expirationInSeconds = 300) => {
  return async (req, res, next) => {
    // Skip caching if Redis is not available
    if (!redisClient.isReady()) {
      logger.debug('Redis not available, skipping cache');
      return next();
    }

    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Skip caching if user is authenticated (personalized data)
    if (req.user) {
      logger.debug('Authenticated request, skipping cache');
      return next();
    }

    try {
      // Generate cache key from URL and query params
      const cacheKey = `cache:${req.originalUrl}`;
      
      // Try to get cached response
      const cachedResponse = await redisClient.get(cacheKey);
      
      if (cachedResponse) {
        logger.info(`Cache HIT: ${cacheKey}`);
        return res.status(200).json(cachedResponse);
      }

      // Cache MISS - store the response
      logger.debug(`Cache MISS: ${cacheKey}`);
      
      // Override res.json to cache the response
      const originalJson = res.json.bind(res);
      res.json = (body) => {
        // Only cache successful responses (2xx status codes)
        if (res.statusCode >= 200 && res.statusCode < 300) {
          redisClient.set(cacheKey, body, expirationInSeconds)
            .then(() => logger.debug(`Cached response for: ${cacheKey}`))
            .catch(err => logger.error(`Failed to cache response: ${err.message}`));
        }
        return originalJson(body);
      };

      next();
    } catch (error) {
      logger.error(`Cache middleware error: ${error.message}`, { error });
      // Don't break the request if caching fails
      next();
    }
  };
};

/**
 * Clear cache for specific pattern
 */
const clearCache = (pattern = '*') => {
  return async (req, res, next) => {
    try {
      if (redisClient.isReady()) {
        await redisClient.delPattern(`cache:${pattern}`);
        logger.info(`Cache cleared for pattern: ${pattern}`);
      }
      next();
    } catch (error) {
      logger.error(`Clear cache error: ${error.message}`, { error });
      next();
    }
  };
};

/**
 * Invalidate cache after mutations (POST, PUT, PATCH, DELETE)
 */
const invalidateCacheMiddleware = (patterns = []) => {
  return async (req, res, next) => {
    // Store original send/json methods
    const originalSend = res.send.bind(res);
    const originalJson = res.json.bind(res);

    // Override to invalidate cache after successful response
    const invalidateCache = async () => {
      if (res.statusCode >= 200 && res.statusCode < 300 && redisClient.isReady()) {
        try {
          for (const pattern of patterns) {
            await redisClient.delPattern(`cache:${pattern}`);
            logger.info(`Cache invalidated for pattern: ${pattern}`);
          }
        } catch (error) {
          logger.error(`Cache invalidation error: ${error.message}`, { error });
        }
      }
    };

    res.send = function (body) {
      invalidateCache();
      return originalSend(body);
    };

    res.json = function (body) {
      invalidateCache();
      return originalJson(body);
    };

    next();
  };
};

module.exports = {
  cacheMiddleware,
  clearCache,
  invalidateCacheMiddleware,
};
