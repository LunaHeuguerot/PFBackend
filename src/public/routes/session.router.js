import express from 'express';
import passport from 'passport';
import { logout } from '../../dao/session.manager.js';
import { adminAuth } from '../../middlewares/adminAuth.js';
import { createHash, isValidPassword, verifyRequiredBody } from '../../utils.js';

const sessionRouter = express.Router();

sessionRouter.get('/hash/:password', async (req, res) => {
    res.status(200).send({ origin: config.SERVER, payload: createHash(req.params.password) });
});

sessionRouter.post('/register', 
    verifyRequiredBody(['first_name', 'last_name', 'age', 'email', 'password']),
    passport.authenticate('register', {
        successRedirect: '/registered',
        failureRedirect: '/register'
    })
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

sessionRouter.get('/ghlogincallback',
    passport.authenticate('ghlogin',
        { failureRedirect: `/login?error=${encodeURI('Error al identificar con Github')}` }), async (req, res) => {
            try {
                req.session.user = req.user // req.user es inyectado AUTOMATICAMENTE por Passport al parsear el done()
                console.log(req.session.user)
                req.session.save(err => {
                    if (err) return res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });

                    res.redirect('/profile');
                });
            } catch (err) {
                res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
            }
        }
);


sessionRouter.get('/private', adminAuth, async (req, res) => {
    try {
        res.status(200).send({ origin: config.SERVER, payload: 'Bienvenido ADMIN!' });
    } catch (err) {
        res.status(500).send({ origin: config.SERVER, error: err.message });
    }
});

sessionRouter.post('/logout', logout);


export default sessionRouter;
