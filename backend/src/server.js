console.log('🚀 Starting server...');

console.log('📦 Loading basic modules...');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

console.log('⚙️ Loading Coolify configuration...');
const coolifyConfig = require('./config/coolify');

console.log('📝 Setting up logger...');
// Logger'ı erken yükle
const logger = require('./utils/logger');

console.log('🗄️ Loading models...');
let sequelize;
try {
  const modelsResult = require('./models');
  sequelize = modelsResult.sequelize;
  console.log('✅ Models loaded successfully');
} catch (error) {
  console.error('❌ Error loading models:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}

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
console.log('Loading multi-incentive application routes...');
const multiIncentiveApplicationRoutes = require('./routes/multiIncentiveApplications');
console.log('Loading incentive selection routes...');
const incentiveSelectionRoutes = require('./routes/incentiveSelectionRoutes');
console.log('Loading documents routes...');
const documentsRoutes = require('./routes/documents');

console.log('🔧 Loading middleware...');
const errorHandler = require('./middleware/errorHandler');
const { notFound } = require('./middleware/notFound');

console.log('⚙️ Loading jobs...');
const documentArchiveJob = require('./jobs/documentArchiveJob');

console.log('✅ All modules loaded successfully');

const app = express();

// Global error handlers
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Application specific logging, throwing an error, or other logic here
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  // Application specific logging, throwing an error, or other logic here
  process.exit(1);
});

const PORT = process.env.PORT || 5002;

// Rate limiting helper function
function createRateLimiter(windowMs, max, message) {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      error: { message, code: 'RATE_LIMIT_EXCEEDED' }
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Custom key generator to include IP and user agent
    keyGenerator: (req) => {
      const ip = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
      const userAgent = req.get('User-Agent') || 'unknown';
      return `${ip}-${userAgent}`;
    },
    // Custom handler for rate limit exceeded
    handler: (req, res) => {
      logger.warn(`Rate limit exceeded for IP: ${req.ip}, User-Agent: ${req.get('User-Agent')}, Path: ${req.path}`);
      res.status(429).json({
        success: false,
        error: {
          message: 'Too many requests, please try again later.',
          code: 'RATE_LIMIT_EXCEEDED',
          retryAfter: Math.round(windowMs / 1000)
        }
      });
    }
  });
}

// Coolify yapılandırmasından rate limiting ayarlarını al
const rateLimitConfig = coolifyConfig.getRateLimitConfig();
console.log('⚡ Rate limit configuration:', rateLimitConfig);

// Rate limiters
const generalLimiter = createRateLimiter(rateLimitConfig.windowMs, rateLimitConfig.max, rateLimitConfig.message.error);
const apiLimiter = createRateLimiter(1 * 60 * 1000, 60, 'API rate limit exceeded, please try again later.');

// Auth-specific rate limiter (more restrictive)
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
  keyGenerator: (req) => {
    const ip = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    return ip;
  },
  handler: (req, res) => {
    logger.warn(`Auth rate limit exceeded for IP: ${req.ip}, Path: ${req.path}`);
    res.status(429).json({
      success: false,
      error: {
        message: 'Too many authentication attempts, please try again later.',
        code: 'AUTH_RATE_LIMIT_EXCEEDED',
        retryAfter: Math.round(15 * 60) // 15 minutes in seconds
      }
    });
  }
});

// Passthrough middleware for when rate limiting is disabled
const passthrough = (req, res, next) => next();

// Rate limiting configuration
const RATE_LIMIT_DISABLED = true;
// Apply rate limiters conditionally
const gl = RATE_LIMIT_DISABLED ? passthrough : generalLimiter;
const apl = RATE_LIMIT_DISABLED ? passthrough : apiLimiter;
const al = RATE_LIMIT_DISABLED ? passthrough : authLimiter;

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Coolify yapılandırmasından CORS ayarlarını al
const corsOptions = coolifyConfig.getCorsConfig();
console.log('🌐 CORS configuration:', corsOptions);

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Basic middleware
app.use(compression());
app.use(morgan('combined', { stream: logger.stream }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging middleware
app.use((req, res, next) => {
  // Log request details
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    body: req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH' ? 
      JSON.stringify(req.body).substring(0, 500) : undefined,
    query: Object.keys(req.query).length > 0 ? req.query : undefined
  });

  // Log response
  const originalSend = res.send;
  res.send = function(data) {
    logger.info(`Response ${res.statusCode} for ${req.method} ${req.path}`, {
      statusCode: res.statusCode,
      responseSize: data ? data.length : 0
    });
    originalSend.call(this, data);
  };
  
  next();
});

app.use(gl);

// Routes
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
app.use('/api/multi-incentive-applications', apl, multiIncentiveApplicationRoutes);
app.use('/api/incentive-selection', apl, incentiveSelectionRoutes);
app.use('/api/documents', apl, documentsRoutes);

// Health check endpoints
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 404 handler
app.use(notFound);

// Global error handler
app.use((err, req, res, next) => {
  logger.error('Global error handler:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip
  });

  res.status(err.status || 500).json({
    success: false,
    error: {
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    }
  });
});

// Serve static files from React app
const path = require('path');
app.use(express.static(path.join(__dirname, '../web/dist')));

// Catch all handler: send back React's index.html file for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../web/dist/index.html'));
});

// Error handler middleware (should be last)
app.use(errorHandler);

// Server startup function
async function startServer() {
  try {
    console.log('🔄 Testing database connection...');
    console.log(`📊 Database config: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME} as ${process.env.DB_USER}`);
    logger.info('🔄 Testing database connection...');
    logger.info(`📊 Database config: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME} as ${process.env.DB_USER}`);
    
    // Add timeout to database connection
    const connectionTimeout = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Database connection timeout after 30 seconds')), 30000);
    });
    
    console.log('🔄 Attempting database authentication...');
    await Promise.race([
      sequelize.authenticate(),
      connectionTimeout
    ]);
    console.log('✅ Database connection established successfully.');
    logger.info('✅ Database connection established successfully.');

    // Sync database models with enhanced error handling
    console.log('🔄 Starting database sync...');
    logger.info('🔄 Starting database sync...');
    
    try {
      const syncTimeout = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Database sync timeout after 60 seconds')), 60000);
      });
      
      await Promise.race([
        sequelize.sync({ alter: false, force: false }), // Safe production settings
        syncTimeout
      ]);
      console.log('✅ Database sync completed successfully.');
      logger.info('✅ Database sync completed successfully.');
    } catch (syncError) {
      console.error('⚠️ Database sync failed, continuing without sync:', syncError.message);
      logger.warn('⚠️ Database sync failed, continuing without sync:', syncError.message);
      // Continue server startup even if sync fails
    }

    // Start document archive job
    console.log('🔄 Starting document archive job...');
    logger.info('🔄 Starting document archive job...');
    documentArchiveJob.start();
    console.log('✅ Document archive job started successfully.');
    logger.info('✅ Document archive job started successfully.');

    // Start the server
    console.log(`🚀 Starting server on port ${PORT}...`);
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      logger.info(`🚀 Server is running on port ${PORT}`);
      logger.info(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
      
      // Coolify deployment bilgilerini logla
      const deploymentInfo = coolifyConfig.getDeploymentInfo();
      const urls = coolifyConfig.getCoolifyUrls();
      
      console.log('🌐 Coolify Deployment Info:');
      console.log(`   FQDN: ${deploymentInfo.fqdn || 'Not set'}`);
      console.log(`   Frontend URL: ${urls.frontendUrl}`);
      console.log(`   API URL: ${urls.apiUrl}`);
      console.log(`   CORS Origin: ${urls.corsOrigin}`);
      console.log(`   Deployment ID: ${deploymentInfo.deploymentId || 'Not set'}`);
      console.log(`   Branch: ${deploymentInfo.branch}`);
      
      logger.info(`🌐 CORS enabled for origins: ${JSON.stringify(corsOptions.origin)}`);
      logger.info(`🔒 Rate limiting: ${RATE_LIMIT_DISABLED ? 'DISABLED' : 'ENABLED'}`);
      logger.info(`🚀 Coolify FQDN: ${deploymentInfo.fqdn || 'Not configured'}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received, shutting down gracefully');
      server.close(() => {
        logger.info('Process terminated');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT received, shutting down gracefully');
      server.close(() => {
        logger.info('Process terminated');
        process.exit(0);
      });
    });

  } catch (error) {
    logger.error('❌ Unable to start server:', error);
    logger.error('❌ Error stack:', error.stack);
    process.exit(1);
  }
}

if (require.main === module) {
  logger.info('🚀 Starting server...');
  try {
    startServer();
  } catch (error) {
    logger.error('❌ Error calling startServer:', error);
    logger.error('❌ Error stack:', error.stack);
    process.exit(1);
  }
}

module.exports = app;