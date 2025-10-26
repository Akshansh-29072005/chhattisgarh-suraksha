import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { createClient } from 'redis';

// Create Redis client for rate limiting (separate from main cache)
let rateLimitRedisClient = null;
let useRedisStore = false;

const initRateLimitRedis = async () => {
  try {
    rateLimitRedisClient = createClient({
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379
      },
      password: process.env.REDIS_PASSWORD || undefined
    });

    await rateLimitRedisClient.connect();
    useRedisStore = true;
    console.log('✅ Rate limiter: Connected to Redis');
  } catch (error) {
    console.warn('⚠️  Rate limiter: Redis not available, using memory store');
    useRedisStore = false;
  }
};

// Initialize on module load
initRateLimitRedis();

// General API rate limiter - 100 requests per 15 minutes
export const generalRateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    status: 429,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  store: useRedisStore
    ? new RedisStore({
        client: rateLimitRedisClient,
        prefix: 'ratelimit:general:',
      })
    : undefined, // Uses default memory store if Redis not available
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health' || req.path === '/api/status';
  },
});

// Strict rate limiter for OTP sending - 5 requests per 15 minutes
export const otpSendRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    status: 429,
    message: 'Too many OTP requests. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: useRedisStore
    ? new RedisStore({
        client: rateLimitRedisClient,
        prefix: 'ratelimit:otp:send:',
      })
    : undefined,
  keyGenerator: (req) => {
    // Rate limit by phone number if provided, otherwise by IP
    return req.body.phoneNumber || req.ip;
  },
});

// Rate limiter for OTP verification - 10 requests per 15 minutes
export const otpVerifyRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: {
    status: 429,
    message: 'Too many verification attempts. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: useRedisStore
    ? new RedisStore({
        client: rateLimitRedisClient,
        prefix: 'ratelimit:otp:verify:',
      })
    : undefined,
  keyGenerator: (req) => {
    // Rate limit by phone number if provided, otherwise by IP
    return req.body.phoneNumber || req.ip;
  },
});

// Rate limiter for report submission - 20 requests per 15 minutes
export const reportSubmitRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: {
    status: 429,
    message: 'Too many report submissions. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: useRedisStore
    ? new RedisStore({
        client: rateLimitRedisClient,
        prefix: 'ratelimit:reports:',
      })
    : undefined,
});

// Rate limiter for forum post creation - 30 requests per 15 minutes
export const forumPostRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,
  message: {
    status: 429,
    message: 'Too many posts created. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: useRedisStore
    ? new RedisStore({
        client: rateLimitRedisClient,
        prefix: 'ratelimit:forum:post:',
      })
    : undefined,
});

// Export Redis client close function
export const closeRateLimitRedis = async () => {
  if (rateLimitRedisClient) {
    try {
      await rateLimitRedisClient.quit();
      console.log('✅ Rate limiter Redis: Connection closed');
    } catch (error) {
      console.error('❌ Rate limiter Redis close error:', error.message);
    }
  }
};

export default {
  generalRateLimiter,
  otpSendRateLimiter,
  otpVerifyRateLimiter,
  reportSubmitRateLimiter,
  forumPostRateLimiter,
  closeRateLimitRedis
};
