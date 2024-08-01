import config, { errorsDictionary } from './config.js';
import CustomError from './CustomError.class.js';

const errorsHandler = (error, req, res, next) => {
    let customErr = errorsDictionary.UNHANDLED_ERROR;

    if (error instanceof CustomError) {
        customErr = Object.values(errorsDictionary).find(err => err.code === error.code) || customErr;
    }

    if (req.logger) {
        if ([2, 3, 4, 5, 27].includes(customErr.code)) {
            req.logger.warn(`${customErr.message}`);
        } else if ([12, 13, 28, 29, 30].includes(customErr.code)) {
            req.logger.error(`${customErr.message}`);
        } else if ([14, 20, 24].includes(customErr.code)) {
            req.logger.warn(`${customErr.message}`);
        } else if (customErr.code >= 8 && customErr.code <= 26) {
            req.logger.error(`${customErr.message}`);
        } else {
            req.logger.error(`${customErr.message}`);
        }
    } else {
        console.log(`Error: ${customErr.message}`);
    }

    res.status(customErr.status).send({
        origin: config.SERVER,
        payload: '',
        error: customErr.message
    });
};

export default errorsHandler;