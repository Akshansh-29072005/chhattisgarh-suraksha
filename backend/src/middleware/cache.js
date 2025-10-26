import { getCache, setCache, isRedisConnected } from '../config/redis.js';

/**
 * Redis caching middleware
 * @param {number} ttl - Time to live in seconds (default: 1800 = 30 minutes)
 * @param {function} keyGenerator - Optional function to generate cache key from req
 */
export const cacheMiddleware = (ttl = 1800, keyGenerator = null) => {
  return async (req, res, next) => {
    // Skip caching if Redis is not connected
    if (!isRedisConnected()) {
      return next();
    }

    // Generate cache key
    const cacheKey = keyGenerator
      ? keyGenerator(req)
      : `cache:${req.method}:${req.originalUrl}`;

    try {
      // Try to get cached data
      const cachedData = await getCache(cacheKey);

      if (cachedData) {
        // Cache hit - return cached data
        return res.status(200).json({
          ...cachedData,
          _cached: true,
          _cacheTimestamp: Date.now()
        });
      }

      // Cache miss - continue to route handler
      // Intercept res.json to cache the response
      const originalJson = res.json.bind(res);
      res.json = function (data) {
        // Only cache successful responses (2xx status codes)
        if (res.statusCode >= 200 && res.statusCode < 300) {
          // Cache the response asynchronously (don't wait)
          setCache(cacheKey, data, ttl).catch(err => {
            console.error('Cache set error:', err.message);
          });
        }
        return originalJson(data);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error.message);
      // Continue without caching on error
      next();
    }
  };
};

/**
 * Cache metrics data (30 minute TTL)
 */
export const cacheMetrics = cacheMiddleware(1800, (req) => {
  return 'cache:metrics:current';
});

/**
 * Cache user session data (24 hour TTL)
 */
export const cacheUserSession = (userId) => {
  return cacheMiddleware(86400, () => `cache:user:session:${userId}`);
};

/**
 * Cache user preferences (1 hour TTL)
 */
export const cacheUserPreferences = cacheMiddleware(3600, (req) => {
  const userId = req.user?.userId || req.params.userId;
  return `cache:user:preferences:${userId}`;
});

/**
 * Cache analytics insights (1 hour TTL)
 */
export const cacheAnalyticsInsights = cacheMiddleware(3600, (req) => {
  return 'cache:analytics:insights';
});

/**
 * Cache forum topics list (5 minutes TTL)
 */
export const cacheForumTopics = cacheMiddleware(300, (req) => {
  const category = req.query.category || 'all';
  const page = req.query.page || 1;
  const sortBy = req.query.sortBy || 'recent';
  return `cache:forum:topics:${category}:${sortBy}:${page}`;
});

/**
 * Cache map data (10 minutes TTL)
 */
export const cacheMapData = cacheMiddleware(600, (req) => {
  const bounds = req.query.bounds || 'default';
  return `cache:map:data:${bounds}`;
});

/**
 * Cache user impact stats (1 hour TTL)
 */
export const cacheUserImpact = cacheMiddleware(3600, (req) => {
  const userId = req.user?.userId || req.params.userId;
  return `cache:user:impact:${userId}`;
});

export default {
  cacheMiddleware,
  cacheMetrics,
  cacheUserSession,
  cacheUserPreferences,
  cacheAnalyticsInsights,
  cacheForumTopics,
  cacheMapData,
  cacheUserImpact
};
