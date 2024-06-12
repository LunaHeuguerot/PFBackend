import express from 'express';
import passport from 'passport';
import { register, login, logout } from '../../dao/session.manager.js'

const sessionRouter = express.Router();

sessionRouter.post('/register', register);
sessionRouter.post('/login', login);
sessionRouter.post('/logout', logout);

// sessionRouter.post('/register', passport.authenticate('register', {
//     successRedirect: '/registered',
//     failureRedirect: '/register',
//     failureFlash: true
// }));

// sessionRouter.post('/login', passport.authenticate('login', {
//     successRedirect: '/products',
//     failureRedirect: '/',
//     failureFlash: true
// }));

// sessionRouter.post('/logout', (req, res) => {
//     req.logout(error => {
//         if (!error) {
//             res.status(200).json({ message: 'Successful logout' });
//         } else {
//             res.status(500).json({ message: 'Logout error', error });
//         }
//     });
// });

export default sessionRouter;
