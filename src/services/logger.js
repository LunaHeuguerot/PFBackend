import winston from 'winston';
import config from './config.js';

const customLevels = {
    levels: {
        fatal: 0,
        error: 1,
        warn: 2,
        info: 3,
        http: 4,
        debug: 5
    },
    colors: {
        fatal: 'red',
        error: 'red',
        warn: 'yellow',
        info: 'green',
        http: 'magenta',
        debug: 'blue'
    }
};

const fileFormat = winston.format.printf(({ level, message, timestamp }) => {
    return `
    ${timestamp} [${level}]
    ${message}
      `;
});

const consoleFormat = winston.format.combine(
    winston.format.colorize(), 
    winston.format.simple() 
);

const devLogger = winston.createLogger({
    levels: customLevels.levels,
    format: consoleFormat, 
    transports: [
        new winston.transports.Console({ level: 'debug' })
    ]
});

const prodLogger = winston.createLogger({
    levels: customLevels.levels,
    format: winston.format.combine(
        winston.format.timestamp(),
        fileFormat 
    ),
    transports: [
        new winston.transports.File({ level: 'error', filename: `${config.DIRNAME}/logs/errors.log` }), 
        new winston.transports.Console({ level: 'error', format: consoleFormat }) 
    ]
});

winston.addColors(customLevels.colors);

const addLogger = (req, res, next) => {
    req.logger = config.MODE === 'dev' ? devLogger : prodLogger;
    next();
}

const logHttpRequests = (req, res, next) => {
    const start = process.hrtime();

    res.on('finish', () => {
        const diff = process.hrtime(start);
        const responseTime = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2); 

        const logMessage = `${req.method} ${req.originalUrl} ${res.statusCode} ${responseTime} ms - ${res.get('Content-Length') || 0}`;
        req.logger.http(logMessage);
    });
    
    next();
}

export { addLogger, logHttpRequests };