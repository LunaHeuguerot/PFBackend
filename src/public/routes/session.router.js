import express from 'express';
import { register, login, logout } from '../../dao/session.manager.js';

const sessionRouter = express.Router();

sessionRouter.post('/register', register);
sessionRouter.post('/login', login);
sessionRouter.post('/logout', logout);

export default sessionRouter;
