console.log('🚀 Starting server...');

console.log('📦 Loading basic modules...');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

console.log('📝 Setting up logger...');
// Simple console logger for now
const logger = {
  info: console.log,
  error: console.error,
  warn: console.warn,
  debug: console.log,
  stream: {
    write: (message) => console.log(message.trim())
  }
};

console.log('🗄️ Loading models...');
const { sequelize } = require('./models');

console.log('🛣️ Loading routes...');
console.log('Loading auth routes...');
const authRoutes = require('./routes/auth');
console.log('Loading dashboard routes...');
const dashboardRoutes = require('./routes/dashboard');
console.log('Loading sector routes...');
const sectorRoutes = require('./routes/sectors');
console.log('Loading incentive type routes...');
const incentiveTypeRoutes = require('./routes/incentiveTypes');
console.log('Loading document type routes...');
const documentTypeRoutes = require('./routes/documentTypes');
console.log('Loading incentive document routes...');
const incentiveDocumentRoutes = require('./routes/incentiveDocuments');
console.log('Loading notification routes...');
const notificationRoutes = require('./routes/notifications');
console.log('Loading admin routes...');
const adminRoutes = require('./routes/admin');
console.log('Loading application routes...');
let applicationRoutes;
try {
  applicationRoutes = require('./routes/applications');
  console.log('✅ Application routes loaded successfully');
} catch (error) {
  console.error('❌ Error loading application routes:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}
console.log('Loading incentive guides routes...');
const incentiveGuidesRouter = require('./routes/incentiveGuides');
console.log('Loading application message routes...');
const applicationMessageRoutes = require('./routes/applicationMessages');
console.log('Loading application room routes...');
const applicationRoomRoutes = require('./routes/applicationRooms');
console.log('Loading ticket routes...');
const ticketRoutes = require('./routes/ticketRoutes');
console.log('Loading incentive routes...');
const incentiveRoutes = require('./routes/incentives');
console.log('Loading user routes...');
const userRoutes = require('./routes/users');
console.log('Loading consultant routes...');
const consultantRoutes = require('./routes/consultantRoutes');
console.log('Loading document incentive mapping routes...');
const documentIncentiveMappingRoutes = require('./routes/documentIncentiveMappingRoutes');
console.log('Loading log routes...');
const logRoutes = require('./routes/logs');

console.log('🔧 Loading middleware...');
const errorHandler = require('./middleware/errorHandler');
const { notFound } = require('./middleware/notFound');

console.log('⚙️ Loading jobs...');
const documentArchiveJob = require('./jobs/documentArchiveJob');

console.log('✅ All modules loaded successfully');

const app = express();

// Add unhandled rejection listener
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { reason, promise });
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Optionally, exit the process
  // process.exit(1);
});

// Add uncaught exception listener
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { error });
  console.error('Uncaught Exception:', error);
  console.error('Stack:', error.stack);
  // Don't exit immediately, let's see the error first
  // process.exit(1);
});

const PORT = process.env.PORT || 5002;

// Enhanced rate limiting with different tiers
const createRateLimiter = (windowMs, max, message, skipSuccessfulRequests = false) => rateLimit({
  windowMs,
  max,
  message,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests,
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      originalUrl: req.originalUrl,
      method: req.method,
      limit: req.rateLimit?.limit,
      current: req.rateLimit?.current,
      remaining: req.rateLimit?.remaining
    });
    res.status(429).json({
      success: false,
      message,
      retryAfter: Math.round(windowMs / 1000)
    });
  }
});

// Different rate limiters for different endpoints
const generalLimiter = createRateLimiter(15 * 60 * 1000, 100, 'Too many requests, please try again later.');
const apiLimiter = createRateLimiter(1 * 60 * 1000, 60, 'API rate limit exceeded, please try again later.');

// Stricter rate limiting for authentication endpoints (temporarily relaxed for testing)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // increased from 5 to 50 for testing purposes
  message: {
    success: false,
    error: { 
      message: 'Too many authentication attempts, please try again later.',
      code: 'AUTH_RATE_LIMIT_EXCEEDED'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Auth rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      originalUrl: req.originalUrl,
      method: req.method
    });
    res.status(429).json({
      success: false,
      error: {
        message: 'Too many authentication attempts, please try again later.',
        code: 'AUTH_RATE_LIMIT_EXCEEDED',
        retryAfter: res.getHeader('Retry-After')
      }
    });
  }
});

// Rate limit dev toggle
// Completely disable rate limiting for testing
const RATE_LIMIT_DISABLED = true;
const passthrough = (req, res, next) => next();
const gl = RATE_LIMIT_DISABLED ? passthrough : generalLimiter;
const apl = RATE_LIMIT_DISABLED ? passthrough : apiLimiter;
const al = RATE_LIMIT_DISABLED ? passthrough : authLimiter;

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:3002',
    process.env.MOBILE_URL || 'http://localhost:19006'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Middleware
app.use(compression());
app.use(morgan('combined', { stream: logger.stream }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Enhanced security middleware - Input validation and sanitization
app.use((req, res, next) => {
  // Sanitize request body
  if (req.body && typeof req.body === 'object') {
    const sanitizeObject = (obj) => {
      for (const key in obj) {
        if (typeof obj[key] === 'string') {
          // Remove potential XSS patterns
          obj[key] = obj[key].replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
          // Remove SQL injection patterns
          obj[key] = obj[key].replace(/(\b(union|select|insert|update|delete|drop|create|alter|exec|execute|script|declare|truncate)\b|--|\/\*|\*\/)/gi, '');
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitizeObject(obj[key]);
        }
      }
    };
    sanitizeObject(req.body);
  }
  
  // Sanitize query parameters
  if (req.query && typeof req.query === 'object') {
    for (const key in req.query) {
      if (typeof req.query[key] === 'string') {
        req.query[key] = req.query[key].replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        req.query[key] = req.query[key].replace(/(\b(union|select|insert|update|delete|drop|create|alter|exec|execute|script|declare|truncate)\b|--|\/\*|\*\/)/gi, '');
      }
    }
  }
  
  next();
});

app.use(gl);

// Apply rate limiting to different routes
app.use('/api/auth', al, authRoutes);
app.use('/api/dashboard', gl, dashboardRoutes);
app.use('/api/sectors', gl, sectorRoutes);
app.use('/api/incentive-types', gl, incentiveTypeRoutes);
app.use('/api/document-types', gl, documentTypeRoutes);
app.use('/api/incentive-documents', apl, incentiveDocumentRoutes);
app.use('/api/notifications', apl, notificationRoutes);
app.use('/api/admin', apl, adminRoutes);
app.use('/api/applications', apl, applicationRoutes);
app.use('/api/application-rooms', apl, applicationRoomRoutes);
app.use('/api/incentive-guides', gl, incentiveGuidesRouter);
app.use('/api/application-messages', apl, applicationMessageRoutes);
app.use('/api/tickets', apl, ticketRoutes);
app.use('/api/incentives', apl, incentiveRoutes);
app.use('/api/users', gl, userRoutes);
app.use('/api/consultants', apl, consultantRoutes);
app.use('/api/document-incentive-mappings', apl, documentIncentiveMappingRoutes);
app.use('/api/logs', apl, logRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// 404 handler
app.use(notFound);

// CORS error handling
app.use((err, req, res, next) => {
  if (err.message === 'Not allowed by CORS') {
    logger.warn('CORS violation attempt', {
      ip: req.ip,
      origin: req.get('origin'),
      userAgent: req.get('User-Agent'),
      method: req.method,
      url: req.originalUrl
    });
    return res.status(403).json({
      success: false,
      message: 'Access denied from this origin'
    });
  }
  next(err);
});

// Serve static files from frontend build
const path = require('path');
app.use(express.static(path.join(__dirname, '../web/dist')));

// Serve React app for all other routes
app.get('*', (req, res) => {
  // Don't serve React app for API routes
  if (req.url.startsWith('/api/')) {
    return res.status(404).json({
      success: false,
      message: 'API endpoint not found'
    });
  }
  res.sendFile(path.join(__dirname, '../web/dist/index.html'));
});

// Error handler
app.use(errorHandler);

// Database connection and server start
async function startServer() {
  try {
    // Test database connection
    const { testConnection } = require('./config/database');
    const isConnected = await testConnection();
    
    if (!isConnected) {
      logger.warn('Starting server without database connection');
      console.log('⚠️  Starting server without database connection...');
    } else {
      if (process.env.NODE_ENV === 'development') {
        try {
          const {
            User,
            Sector,
            IncentiveCategory,
            IncentiveType,
            DocumentType,
            Incentive,
            Application,
            Document,
            IncentiveDocument,
            Notification,
            Ticket,
            TicketMessage,
            IncentiveGuide
          } = require('./models');

          // Define the order of synchronization
          const modelsToSync = [
            User,
            Sector,
            IncentiveCategory,
            IncentiveType,
            DocumentType,
            Incentive,
            Application,
            Document,
            IncentiveDocument,
            Notification,
            Ticket,
            TicketMessage,
            IncentiveGuide
          ];

          // Skip model synchronization in development mode to avoid conflicts
          if (process.env.NODE_ENV === 'production') {
            for (const model of modelsToSync) {
              if (model && model.sync) {
                try {
                  logger.info(`Syncing model: ${model.name}`);
                  console.log(`⏳ Syncing model: ${model.name}...`);
                  await model.sync();
                  logger.info(`Model ${model.name} synced successfully`);
                  console.log(`✅ Model ${model.name} synced successfully.`);
                } catch (modelSyncError) {
                  logger.error(`Error syncing model: ${model.name}`, { error: modelSyncError });
                  console.error(`❌ Error syncing model: ${model.name}`, modelSyncError);
                  throw modelSyncError; // Re-throw to be caught by the outer catch block
                }
              }
            }
          } else {
            console.log('🚫 Model synchronization skipped in development mode');
            logger.info('Model synchronization skipped in development mode');
          }

          logger.info('Database synchronized');
          console.log('Database synchronized');
          const { seedPermanentUsers } = require('./seeds/permanentUsers');
          // Skip seeding in development mode to avoid conflicts
          if (process.env.NODE_ENV === 'production') {
            await seedPermanentUsers();
          } else {
            console.log('🚫 Permanent users seeding skipped in development mode');
            logger.info('Permanent users seeding skipped in development mode');
          }
        } catch (syncError) {
          logger.error('Error during database synchronization', { error: syncError });
          console.error('❌ Error during database synchronization:', syncError);
          process.exit(1); // Exit on sync error
        }
      }
    }
    
    // Start server
    const server = app.listen(PORT, '127.0.0.1', () => {
      logger.info(`Server started on port ${PORT}`, { 
        port: PORT, 
        environment: process.env.NODE_ENV,
        apiUrl: `http://127.0.0.1:${PORT}/api`
      });
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📱 Environment: ${process.env.NODE_ENV}`);
      console.log(`🌐 API URL: http://127.0.0.1:${PORT}/api`);
      console.log('✅ Backend server started successfully!');
      
      // Start document archive job
      try {
        documentArchiveJob.start();
        logger.info('Document archive job started successfully');
        console.log('📋 Document archive job started successfully');
      } catch (jobError) {
        logger.error('Failed to start document archive job', { error: jobError.message });
        console.error('❌ Failed to start document archive job:', jobError.message);
      }
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received, shutting down gracefully');
      console.log('SIGTERM received, shutting down gracefully');
      server.close(() => {
        logger.info('Process terminated');
        console.log('Process terminated');
        process.exit(0);
    });
    });
    
    // Keep the process alive
    process.stdin.resume();
    console.log('✅ Server setup completed, keeping process alive...');

  } catch (error) {
    logger.error('Failed to start server', { error });
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server only if this file is run directly
if (require.main === module) {
  startServer();
}

module.exports = app;