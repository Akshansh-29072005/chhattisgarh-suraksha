import { createClient } from 'redis';

let redisClient = null;
let isConnected = false;

// Initialize Redis client
const initRedis = async () => {
  try {
    redisClient = createClient({
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379
      },
      password: process.env.REDIS_PASSWORD || undefined,
      // Reconnection strategy
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            console.error('❌ Redis: Max reconnection attempts reached');
            return new Error('Max reconnection attempts reached');
          }
          // Exponential backoff: 100ms, 200ms, 400ms, etc.
          const delay = Math.min(retries * 100, 3000);
          console.log(`🔄 Redis: Reconnecting in ${delay}ms (attempt ${retries})`);
          return delay;
        }
      }
    });

    // Error handling
    redisClient.on('error', (err) => {
      console.error('❌ Redis Client Error:', err.message);
      isConnected = false;
    });

    redisClient.on('connect', () => {
      console.log('🔗 Redis: Connecting...');
    });

    redisClient.on('ready', () => {
      console.log('✅ Redis: Connected and ready');
      isConnected = true;
    });

    redisClient.on('reconnecting', () => {
      console.log('🔄 Redis: Reconnecting...');
      isConnected = false;
    });

    redisClient.on('end', () => {
      console.log('❌ Redis: Connection closed');
      isConnected = false;
    });

    // Connect to Redis
    await redisClient.connect();

    return redisClient;
  } catch (error) {
    console.error('❌ Redis initialization failed:', error.message);
    console.log('⚠️  Application will continue without Redis caching');
    isConnected = false;
    return null;
  }
};

// Get value from Redis cache
export const getCache = async (key) => {
  if (!isConnected || !redisClient) {
    return null;
  }

  try {
    const value = await redisClient.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error(`Redis getCache error for key ${key}:`, error.message);
    return null;
  }
};

// Set value in Redis cache with optional TTL (in seconds)
export const setCache = async (key, value, ttl = 3600) => {
  if (!isConnected || !redisClient) {
    return false;
  }

  try {
    const stringValue = JSON.stringify(value);
    if (ttl) {
      await redisClient.setEx(key, ttl, stringValue);
    } else {
      await redisClient.set(key, stringValue);
    }
    return true;
  } catch (error) {
    console.error(`Redis setCache error for key ${key}:`, error.message);
    return false;
  }
};

// Delete value from Redis cache
export const deleteCache = async (key) => {
  if (!isConnected || !redisClient) {
    return false;
  }

  try {
    await redisClient.del(key);
    return true;
  } catch (error) {
    console.error(`Redis deleteCache error for key ${key}:`, error.message);
    return false;
  }
};

// Delete multiple keys matching a pattern
export const deleteCachePattern = async (pattern) => {
  if (!isConnected || !redisClient) {
    return false;
  }

  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
    return true;
  } catch (error) {
    console.error(`Redis deleteCachePattern error for pattern ${pattern}:`, error.message);
    return false;
  }
};

// Check if Redis is connected
export const isRedisConnected = () => {
  return isConnected && redisClient !== null;
};

// Close Redis connection
export const closeRedis = async () => {
  if (redisClient) {
    try {
      await redisClient.quit();
      console.log('✅ Redis: Connection closed gracefully');
    } catch (error) {
      console.error('❌ Redis close error:', error.message);
    }
  }
};

// Export the init function
export { initRedis };

export default {
  initRedis,
  getCache,
  setCache,
  deleteCache,
  deleteCachePattern,
  isRedisConnected,
  closeRedis
};
