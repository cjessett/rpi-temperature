const winston = require('winston');

require('dotenv').config();

const { combinedLog, errorLog } = process.env;

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.cli({ colors: { info: 'green' }}),
  defaultMeta: { service: 'user-service' },
  transport: [
    new winston.transports.File({ filename: errorLog, level: 'error' }),
    new winston.transports.File({ filename: combinedLog }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({ format: winston.format.simple() }));
}

module.exports = logger;
