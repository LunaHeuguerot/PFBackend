import express from 'express';
import { CartsManagerDB } from '../../dao/cartsManager.db.js';

const cartsRouter = express.Router();

cartsRouter.post('/', async(req, res) => {
    try {
        const cart = await CartsManagerDB.getInstance().createCart();
        res.json({ status: 'success', payload: cart });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

cartsRouter.get('/:cid', async(req, res) => {
    try {
        const id = req.params.cid;
        const cart = await CartsManagerDB.getInstance().getCartById(id);
        res.json({ status: 'success', payload: cart})
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

cartsRouter.post('/:cid/product/:pid', async(req, res) => {
    try {
        const cid = req.params.cid;
        const pid = req.params.pid;
        const cart = await CartsManagerDB.getInstance().addProductToCart(cid, pid);
        res.json({ status: 'success', payload: cart });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

cartsRouter.delete('/:cid/product/:pid', async(req, res) => {
    try {
        const cid = req.params.cid;
        const pid = req.params.pid;
        const cart = await CartsManagerDB.getInstance().deleteProdFromCart(cid, pid);
        res.json({ status: 'success', payload: cart });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default cartsRouter;
