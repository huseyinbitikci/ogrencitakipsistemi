const Redis = require('ioredis');
const logger = require('../config/logger');

class RedisClient {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  /**
   * Connect to Redis
   */
  connect() {
    try {
      const redisConfig = {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
        db: process.env.REDIS_DB || 0,
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        maxRetriesPerRequest: 3,
      };

      // Optional: Enable Redis in production only
      if (process.env.REDIS_ENABLED === 'false') {
        logger.warn('Redis is disabled via REDIS_ENABLED environment variable');
        return null;
      }

      this.client = new Redis(redisConfig);

      this.client.on('connect', () => {
        this.isConnected = true;
        logger.info('Redis connected successfully');
      });

      this.client.on('ready', () => {
        logger.info('Redis is ready to accept commands');
      });

      this.client.on('error', (err) => {
        this.isConnected = false;
        logger.error('Redis connection error:', { error: err.message });
      });

      this.client.on('close', () => {
        this.isConnected = false;
        logger.warn('Redis connection closed');
      });

      this.client.on('reconnecting', () => {
        logger.info('Redis reconnecting...');
      });

      return this.client;
    } catch (error) {
      logger.error('Failed to initialize Redis client:', { error: error.message });
      return null;
    }
  }

  /**
   * Get Redis client instance
   */
  getClient() {
    if (!this.client) {
      logger.warn('Redis client not initialized. Call connect() first.');
      return null;
    }
    return this.client;
  }

  /**
   * Check if Redis is connected
   */
  isReady() {
    return this.isConnected && this.client && this.client.status === 'ready';
  }

  /**
   * Get cached value
   */
  async get(key) {
    try {
      if (!this.isReady()) return null;
      
      const value = await this.client.get(key);
      if (value) {
        logger.debug(`Cache HIT for key: ${key}`);
        return JSON.parse(value);
      }
      logger.debug(`Cache MISS for key: ${key}`);
      return null;
    } catch (error) {
      logger.error(`Redis GET error for key ${key}:`, { error: error.message });
      return null;
    }
  }

  /**
   * Set cached value with expiration (in seconds)
   */
  async set(key, value, expirationInSeconds = 300) {
    try {
      if (!this.isReady()) return false;
      
      await this.client.setex(key, expirationInSeconds, JSON.stringify(value));
      logger.debug(`Cache SET for key: ${key} (TTL: ${expirationInSeconds}s)`);
      return true;
    } catch (error) {
      logger.error(`Redis SET error for key ${key}:`, { error: error.message });
      return false;
    }
  }

  /**
   * Delete cached value
   */
  async del(key) {
    try {
      if (!this.isReady()) return false;
      
      await this.client.del(key);
      logger.debug(`Cache DELETE for key: ${key}`);
      return true;
    } catch (error) {
      logger.error(`Redis DEL error for key ${key}:`, { error: error.message });
      return false;
    }
  }

  /**
   * Delete all keys matching a pattern
   */
  async delPattern(pattern) {
    try {
      if (!this.isReady()) return false;
      
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
        logger.debug(`Cache DELETE pattern: ${pattern} (${keys.length} keys)`);
      }
      return true;
    } catch (error) {
      logger.error(`Redis DEL pattern error for ${pattern}:`, { error: error.message });
      return false;
    }
  }

  /**
   * Flush all cache
   */
  async flushAll() {
    try {
      if (!this.isReady()) return false;
      
      await this.client.flushdb();
      logger.warn('Redis cache FLUSHED');
      return true;
    } catch (error) {
      logger.error('Redis FLUSH error:', { error: error.message });
      return false;
    }
  }

  /**
   * Close Redis connection
   */
  async disconnect() {
    try {
      if (this.client) {
        await this.client.quit();
        this.isConnected = false;
        logger.info('Redis disconnected');
      }
    } catch (error) {
      logger.error('Redis disconnect error:', { error: error.message });
    }
  }
}

// Export singleton instance
module.exports = new RedisClient();
