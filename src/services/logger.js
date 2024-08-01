import winston from 'winston';
import config from './config.js';

const customLevelsOptions = {
  levels: {
    fatal: 0,
    error: 1,
    warning: 2,
    info: 3,
    http: 4,
    debug: 5,
  },
  colors: {
    fatal: 'red bold',
    error: 'red',
    warning: 'yellow',
    info: 'blue',
    http: 'white',
    debug: 'green',
  }
};

winston.addColors(customLevelsOptions.colors);

const devLogger = winston.createLogger({
  levels: customLevelsOptions.levels,
  transports: [
    new winston.transports.Console({
      level: 'debug',
      format: winston.format.combine(
        winston.format.colorize({ colors: customLevelsOptions.colors }),
        winston.format.simple()
      )
    }),
    new winston.transports.File({ level: 'error', filename: `${config.DIRNAME}/logs/errors.log`, format: winston.format.simple() }),
  ]
});

const prodLogger = winston.createLogger({
  levels: customLevelsOptions.levels,
  transports: [
    new winston.transports.Console({
      level: 'info',
      format: winston.format.combine(
        winston.format.colorize({ colors: customLevelsOptions.colors }),
        winston.format.simple()
      )
    }),
    new winston.transports.File({ level: 'error', filename: `${config.DIRNAME}/logs/errors.log`, format: winston.format.simple() }),
  ]
});

const addLogger = (req, res, next) => {
  console.log("Middleware addLogger ejecutado");

  if (process.env.MODE === 'dev') {
    console.log("Asignando devLogger");
    req.logger = devLogger;
  } else {
    console.log("Asignando prodLogger");
    req.logger = prodLogger;
  }

  if (!req.logger) {
    console.error("Error: Logger no definido en el middleware.");
  } else {
    req.logger.info(`${new Date().toDateString()} ${req.method} ${req.url}`);
  }

  next();
};


export default addLogger;
