import { Router } from 'express';
import isAuthenticated from '../middlewares/authMiddleware.js';

const profileRouter = Router();

profileRouter.get('/', isAuthenticated, (req, res) => {
    res.render('profile', {
        user: req.session.user,
        style: 'profile.css'
    }); 
});

export default profileRouter;