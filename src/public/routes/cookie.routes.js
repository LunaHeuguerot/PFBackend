import { Router } from "express";
import config from "../../config.js";

const cookieRouter = Router();

cookieRouter.get('/getcookie', async(req, res) => {
    try {
        const cookieData = JSON.parse(req.signedCookies['CoderCookie']);
        res.status(200).send({ origin: config.SERVER, payload: cookieData });
    } catch (error) {
        res.status(500).send({ origin: config.SERVER, payload: null, error: error.message });
    }
});

cookieRouter.get('/setcookie', async(req, res) => {
    try {
        const cookieData = { user: 'Coder', email: 'adminCoder@coder.com' };
        res.cookie('codercookie', JSON.stringify(cookieData), { maxAge: 30000, signed: true });
        
        res.status(200).send({ origin: config.SERVER, payload: 'Cookie generada' });
    } catch (error) {
        res.status(500).send({ origin: config.SERVER, payload: null, error: error.message });
    }
});

cookieRouter.get('/deletecookie', async(req, res) => {
    try {
        res.clearCookie('CoderCookie');
        res.status(200).send({ origin: config.SERVER, payload: 'Cookie eliminada' });
    } catch (error) {
        res.status(500).send({ origin: config.SERVER, payload: null, error: error.message });
    }
});

export default cookieRouter;

