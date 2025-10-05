const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

// Log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Console format (colored)
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let logMessage = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      logMessage += ` ${JSON.stringify(meta)}`;
    }
    if (stack) {
      logMessage += `\n${stack}`;
    }
    return logMessage;
  })
);

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs');
require('fs').mkdirSync(logsDir, { recursive: true });

// Daily rotate file transport for errors
const errorTransport = new DailyRotateFile({
  filename: path.join(logsDir, 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  level: 'error',
  format: logFormat,
  maxSize: '20m',
  maxFiles: '14d',
  zippedArchive: true
});

// Daily rotate file transport for combined logs
const combinedTransport = new DailyRotateFile({
  filename: path.join(logsDir, 'combined-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  format: logFormat,
  maxSize: '20m',
  maxFiles: '30d',
  zippedArchive: true
});

// Daily rotate file transport for HTTP requests
const httpTransport = new DailyRotateFile({
  filename: path.join(logsDir, 'http-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  format: logFormat,
  maxSize: '20m',
  maxFiles: '7d',
  zippedArchive: true
});

// Create logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'tesvik360-api' },
  transports: [
    errorTransport,
    combinedTransport,
    httpTransport
  ],
  exceptionHandlers: [
    new DailyRotateFile({
      filename: path.join(logsDir, 'exceptions-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      format: logFormat,
      maxSize: '20m',
      maxFiles: '30d',
      zippedArchive: true
    })
  ],
  rejectionHandlers: [
    new DailyRotateFile({
      filename: path.join(logsDir, 'rejections-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      format: logFormat,
      maxSize: '20m',
      maxFiles: '30d',
      zippedArchive: true
    })
  ]
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat
  }));
}

// Create a stream object for Morgan HTTP logging
logger.stream = {
  write: (message) => {
    logger.http(message.trim());
  }
};

// Log rotation event handlers
errorTransport.on('rotate', (oldFilename, newFilename) => {
  logger.info('Error log file rotated', { oldFilename, newFilename });
});

combinedTransport.on('rotate', (oldFilename, newFilename) => {
  logger.info('Combined log file rotated', { oldFilename, newFilename });
});

httpTransport.on('rotate', (oldFilename, newFilename) => {
  logger.info('HTTP log file rotated', { oldFilename, newFilename });
});

module.exports = logger;