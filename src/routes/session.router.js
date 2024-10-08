import express from 'express';
import passport from 'passport';
import { logout } from '../controllers/managers/session.manager.js';
import { adminAuth } from '../middlewares/adminAuth.js';
import { createHash, isValidPassword, verifyRequiredBody } from '../services/utils.js';
import config from '../services/config.js';

const sessionRouter = express.Router();

sessionRouter.use((req, res, next) => {
    req.logger = {
        error: (message) => {
            console.error(message);
        },
        info: (message) => {
            console.log(message);
        }
    };
    next();
});

sessionRouter.get('/hash/:password', async (req, res) => {
    res.status(200).send({ origin: config.SERVER, payload: createHash(req.params.password) });
});

sessionRouter.post('/register', 
    verifyRequiredBody(['first_name', 'last_name', 'age', 'email', 'password']),
    async (req, res, next) => {
        passport.authenticate('register', (err, user, info) => {
            if (err) return next(err);
            if (!user) {
                return res.status(400).send({ origin: config.SERVER, payload: null, error: info.message });
            }
            req.session.user = user;
            req.session.save(err => {
                if (err) return res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
                res.redirect('/registered');
            });
        })(req, res, next);
    }
);



sessionRouter.post('/login', verifyRequiredBody(['email', 'password']),
    passport.authenticate('login', {
        failureRedirect: `/login?error=${encodeURI('Usuario o clave no válidos')}`
    }),
    (req, res) => {
        req.session.user = req.user;
        req.session.save(err => {
            if (err) {
                return res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
            }
            res.redirect('/products');
        });        
    }
);

sessionRouter.post('/pplogin', verifyRequiredBody(['email', 'password']),
    passport.authenticate('login', { failureRedirect: `/login?error=${encodeURI('Usuario o clave no válidos')}` }),
    async (req, res) => {
        try {
            if (!req.user) {
                return res.status(401).send({ origin: config.SERVER, payload: 'Autenticación fallida' });
            }

            req.session.user = req.user;
            req.session.save(err => {
                if (err) return res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });

                res.redirect('/profile');
            });
        } catch (err) {
            res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
        }
    }
);

sessionRouter.get('/ghlogin', passport.authenticate('ghlogin', {scope: ['user: email']}), async (req, res) => {
});

sessionRouter.get('/ghlogincallback',
    passport.authenticate('ghlogin', { failureRedirect: `/login?error=${encodeURI('Error al identificar con Github')}` }),
    async (req, res) => {
        try {
            req.session.user = req.user;
            console.log('Authenticated user:', req.user);
            req.session.save(err => {
                if (err) return res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });

                res.redirect('/profile');
            });
        } catch (err) {
            console.error('Error en callback de GitHub:', err);
            res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
        }
    }
);

sessionRouter.get('/current', async(req, res) => {
    try {
        const user = { ...req.session.user };
        user.password = '*********';

        res.status(200).send({
            user: user,
            login_type: user.login_type 
        });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
})

sessionRouter.get('/private', adminAuth, async (req, res) => {
    try {
        res.status(200).send({ origin: config.SERVER, payload: 'Bienvenido ADMIN!' });
    } catch (err) {
        res.status(500).send({ origin: config.SERVER, error: err.message });
    }
});

sessionRouter.all('*', async (req, res) => {
    res.status(404).send({ origin: config.SERVER, payload: null, error: 'No se encuentra la ruta solicitada' });
    req.logger.error(`date: ${new Date().toDateString()} ${new Date().toLocaleTimeString()} | method: ${req.method} | ip: ${req.ip} | url: ${req.originalUrl}`);
});

sessionRouter.post('/logout', logout);


export default sessionRouter;
