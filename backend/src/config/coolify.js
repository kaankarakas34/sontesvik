/**
 * Coolify Deployment Configuration
 * Bu dosya Coolify ile deployment için gerekli yapılandırmaları içerir
 */

require('dotenv').config();

/**
 * Coolify FQDN'den dinamik URL'ler oluşturur
 */
const getCoolifyUrls = () => {
  const coolifyFqdn = process.env.COOLIFY_FQDN;
  
  if (coolifyFqdn) {
    // Coolify otomatik domain kullanıyorsa
    const baseUrl = coolifyFqdn.startsWith('http') ? coolifyFqdn : `https://${coolifyFqdn}`;
    
    return {
      baseUrl,
      apiUrl: `${baseUrl}/api`,
      frontendUrl: baseUrl,
      corsOrigin: baseUrl,
      socketUrl: baseUrl
    };
  }
  
  // Fallback to environment variables or defaults
  const nodeEnv = process.env.NODE_ENV || 'development';
  
  if (nodeEnv === 'production') {
    return {
      baseUrl: process.env.APP_URL || 'https://app.tesvik360.com',
      apiUrl: process.env.API_URL || 'https://app.tesvik360.com/api',
      frontendUrl: process.env.FRONTEND_URL || 'https://app.tesvik360.com',
      corsOrigin: process.env.CORS_ORIGIN || 'https://app.tesvik360.com',
      socketUrl: process.env.SOCKET_URL || 'https://app.tesvik360.com'
    };
  }
  
  // Development defaults
  return {
    baseUrl: 'http://localhost:5173',
    apiUrl: 'http://localhost:5002/api',
    frontendUrl: 'http://localhost:5173',
    corsOrigin: 'http://localhost:5173',
    socketUrl: 'http://localhost:5002'
  };
};

/**
 * Coolify deployment bilgileri
 */
const getDeploymentInfo = () => {
  return {
    deploymentId: process.env.COOLIFY_DEPLOYMENT_ID || null,
    projectId: process.env.COOLIFY_PROJECT_ID || null,
    serviceId: process.env.COOLIFY_SERVICE_ID || null,
    fqdn: process.env.COOLIFY_FQDN || null,
    branch: process.env.COOLIFY_BRANCH || 'main',
    commit: process.env.COOLIFY_COMMIT || null,
    deployedAt: process.env.COOLIFY_DEPLOYED_AT || new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  };
};

/**
 * CORS yapılandırması
 */
const getCorsConfig = () => {
  const urls = getCoolifyUrls();
  
  const allowedOrigins = [
    urls.frontendUrl,
    urls.baseUrl
  ];
  
  // Development ortamında localhost'ları ekle
  if (process.env.NODE_ENV !== 'production') {
    allowedOrigins.push(
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      'http://127.0.0.1:5173'
    );
  }
  
  return {
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['X-Total-Count', 'X-Page-Count']
  };
};

/**
 * SSL/TLS yapılandırması
 */
const getSSLConfig = () => {
  return {
    enabled: process.env.SSL_ENABLED === 'true' || process.env.NODE_ENV === 'production',
    forceHttps: process.env.FORCE_HTTPS === 'true' || process.env.NODE_ENV === 'production',
    trustProxy: process.env.TRUST_PROXY === 'true' || !!process.env.COOLIFY_FQDN
  };
};

/**
 * Rate limiting yapılandırması
 */
const getRateLimitConfig = () => {
  return {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 dakika
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // 100 istek
    message: {
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false
  };
};

/**
 * Session yapılandırması
 */
const getSessionConfig = () => {
  const urls = getCoolifyUrls();
  
  return {
    secret: process.env.SESSION_SECRET || process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 saat
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      domain: process.env.COOLIFY_FQDN ? new URL(urls.baseUrl).hostname : undefined
    }
  };
};

module.exports = {
  getCoolifyUrls,
  getDeploymentInfo,
  getCorsConfig,
  getSSLConfig,
  getRateLimitConfig,
  getSessionConfig
};