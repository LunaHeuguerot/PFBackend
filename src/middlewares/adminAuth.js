import config from '../config.js';

export const adminAuth = (req, res, next) => {
    if (!req.user || !req.user.isAdmin) {
        return res.status(401).send({ origin: config.SERVER, payload: 'Acceso no autorizado: se requiere autenticación y nivel de admin' });
    }
    next();
};
