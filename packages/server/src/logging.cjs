require('dotenv').config();
const winston = require('winston');
const fs = require('fs');
const path = require('path');

// Ensure log directory exists
const logDir = 'logs'; // or any path where you want to save logs
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const serverStart = new Date().toISOString();

const transports = [];

if (
  process.env.ENVIRONMENT === 'development' ||
  process.env.ENVIRONMENT === 'production'
) {
  transports.push(
    new winston.transports.File({
      filename: path.join(logDir, `error.log`),
      level: 'error',
    }),
    new winston.transports.File({
      filename: path.join(logDir, `combined.log`),
    }),
    new winston.transports.File({
      filename: path.join(logDir, `${serverStart}-error.log`),
      level: 'error',
    }),
    new winston.transports.File({
      filename: path.join(logDir, `${serverStart}-combined.log`),
    }),
  );
}

if (process.env.ENVIRONMENT === 'development') {
  transports.push(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.printf((info) => {
          return `[${info.label}] [${info.timestamp}] [${info.level}]: ${info.message}`;
        }),
      ),
      level: process.env.LOG_LEVEL,
    }),
  );
}

// Logger for database operations
const dbLogger = winston.createLogger({
  silent: process.env.ENVIRONMENT === 'test',
  level: 'info',
  format: winston.format.combine(
    winston.format.label({ label: 'db' }),
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports,
});

// Logger for API operations
const apiLogger = winston.createLogger({
  silent: process.env.ENVIRONMENT === 'test',
  level: 'verbose',
  format: winston.format.combine(
    winston.format.label({ label: 'api' }),
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports,
});

const indexLogger = winston.createLogger({
  silent: process.env.ENVIRONMENT === 'test',
  level: 'info',
  format: winston.format.combine(
    winston.format.label({ label: 'index' }),
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports,
});

module.exports = { dbLogger, apiLogger, indexLogger };
