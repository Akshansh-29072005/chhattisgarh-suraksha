import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import { errorHandler } from './middleware/error.middleware.js';
import { dbConnect } from './config/database.js';
import { initRedis, closeRedis, isRedisConnected } from './config/redis.js';
import reportsRoutes from './routes/reports.routes.js';
import * as blockchain from './services/blockchain.service.js';
import logger, { logRequest } from './utils/logger.js';
import { generalRateLimiter, otpSendRateLimiter, otpVerifyRateLimiter, reportSubmitRateLimiter } from './middleware/rate-limiter.js';

// Import routes
import authRoutes from './routes/auth.routes.js';
import statusRoutes from './routes/status.routes.js';
import userRoutes from './routes/users.routes.js';
import metricsRoutes from './routes/metrics.routes.js';

// Load environment variables
dotenv.config();

// Validate critical environment variables on startup
const requiredEnvVars = ['DB_PASSWORD', 'JWT_SECRET'];
const missingVars = requiredEnvVars.filter(v => !process.env[v]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars.join(', '));
  console.error('   Please check your .env file. See .env.example for required variables.');
  process.exit(1);
}

// Warn about optional but recommended environment variables
const optionalVars = ['WAQI_API_KEY', 'TWILIO_ACCOUNT_SID', 'REDIS_HOST'];
optionalVars.forEach(v => {
  if (!process.env[v]) {
    console.warn(`⚠️  Optional env var ${v} not set - some features may be limited`);
  }
});

logger.info('🚀 Starting Chhattisgarh Suraksha API Server...');
logger.info(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);

// Create Express app
const app = express();

// Security headers with Helmet
app.use(helmet());

// Request logging middleware (only verbose logging in development)
if (process.env.NODE_ENV === 'development') {
  // Enhanced debugging middleware with colors and symbols
  app.use((req, res, next) => {
  const start = Date.now();
  console.log('\n🚀 Incoming Request');
  console.log('──────────────────────────────────');
  console.log(`📡 ${req.method} ${req.originalUrl}`);
  console.log(`🕒 Time: ${new Date().toISOString()}`);
  console.log(`📍 Base URL: ${req.baseUrl || '/'}`);
  console.log(`🛣️  Path: ${req.path}`);
  
  // Log request body if present
  if (Object.keys(req.body || {}).length > 0) {
    console.log('📦 Request Body:', JSON.stringify(req.body, null, 2));
  }
  
  // Override send to log response
  const oldSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - start;
    console.log('\n📤 Response');
    console.log('──────────────────────────────────');
    console.log(`⏱️  Duration: ${duration}ms`);
    console.log(`📊 Status: ${res.statusCode}`);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        console.log('📦 Response Data:', JSON.stringify(parsed, null, 2));
      } catch (e) {
        console.log('� Response Data:', data);
      }
    }
    console.log('──────────────────────────────────\n');
    oldSend.apply(res, arguments);
  };


    next();
  });
} else {
  // Production: use winston logger for structured logging
  app.use(logRequest);
}

// CORS configuration from environment variables
const corsOptions = {
  origin: function (origin, callback) {
    // Get allowed origins from environment variable (comma-separated)
    const allowedOrigins = process.env.CORS_ORIGINS
      ? process.env.CORS_ORIGINS.split(',').map(o => o.trim())
      : [
          'http://localhost:3000',
          'http://localhost:5173',
          'http://127.0.0.1:5173',
          'http://localhost:4173',
          'http://localhost:4028'
        ];

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      logger.warn(`CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Length', 'Content-Type']
};

app.use(cors(corsOptions));

// Body parsing middleware with error handling
app.use(express.json({
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      res.status(400).json({ 
        message: 'Invalid JSON in request body',
        error: e.message 
      });
      throw new Error('Invalid JSON');
    }
  }
}));
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.json({
    name: 'Chhattisgarh Suraksha API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      auth: '/api/auth',
      status: '/api/status',
      users: '/api/users',
      metrics: '/api/metrics'
    }
  });
});


app.use('/api/auth', authRoutes);
app.use('/api/status', statusRoutes);
app.use('/api/users', userRoutes);
app.use('/api/metrics', metricsRoutes);
app.use('/api/reports', reportsRoutes);

// Catch-all route for debugging
app.use((req, res) => {
  console.log('\n⚠️ 404 - Route not found:', req.originalUrl);
  res.status(404).json({
    message: 'Route not found',
    requestedPath: req.originalUrl,
    availableEndpoints: {
      auth: [
        '/api/auth/send-otp',
        '/api/auth/verify-otp',
        '/api/auth/register'
      ],
      status: ['/api/status'],
      users: ['/api/users/profile'],
      metrics: [
        '/api/metrics/current',
        '/api/metrics/alerts'
      ]
    },
    docs: 'Visit /api-docs for complete API documentation'
  });
});

// Error handling
app.use(errorHandler);

// Connect to database and start server
const PORT = process.env.PORT || 5000;

import http from 'http';

dbConnect().then(async () => {
  console.log('✅ Database connected');
  
  const server = http.createServer(app);
  
  // Start server first
  server.listen(PORT, '0.0.0.0', async () => {
    const address = server.address();
    console.log(`🚀 Server is running on ${typeof address === 'string' ? address : `${address.address}:${address.port}`}`);
    
    // Then try to initialize blockchain
    try {
      console.log('Initializing blockchain...');
      const contractAddress = await blockchain.initBlockchain();
      console.log('✅ Blockchain contract deployed at:', contractAddress);
    } catch (err) {
      console.error('⚠️ Blockchain initialization failed:', err.message);
      console.log('👉 Make sure Hardhat node is running with: npx hardhat node');
      // Don't exit - let the server run without blockchain for development
    }
  });

  server.on('error', (error) => {
    console.error('Server error:', error);
  });
}).catch(err => {
  console.error('Failed to connect to database:', err);
  process.exit(1);
});