import express from 'express';
import { CartsManagerDB } from '../../dao/cartsManager.db.js';

const cartsRouter = express.Router();

cartsRouter.get('/:cid', async(req, res) => {
    try {
        const id = req.params.cid;
        const cart = await CartsManagerDB.getInstance().getCartById(id);
        res.json({ status: 'success', payload: cart });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

cartsRouter.post('/', async(req, res) => {
    try {
        const cart = await CartsManagerDB.getInstance().createCart();
        res.json({ status: 'success', payload: cart });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

cartsRouter.post('/:cid/products/:pid', async(req, res) => {
    try {
        const cartId = req.params.cid;
        const productId = req.params.pid;
        const quantity = req.body.quantity ?? 1; 
        const cart = await CartsManagerDB.getInstance().addProductToCart(cartId, productId, quantity);
        res.json({ status: 'success', payload: cart });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

cartsRouter.put('/:cid', async(req, res) => {
    try {
        const id = req.params.cid;
        const products = req.body.products ?? [];
        const cart = await CartsManagerDB.getInstance().updateCart(id, products);
        res.json({ status: 'success', payload: cart });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

cartsRouter.put('/:cid/products/:pid', async(req, res) => {
    try {
        const cartId = req.params.cid;
        const productId = req.params.pid;
        const quantity = req.body.quantity ?? 1;
        const cart = await CartsManagerDB.getInstance().updateProdQuantity(cartId, productId, quantity);
        res.json({ status: 'success', payload: cart });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

cartsRouter.delete('/:cid', async(req, res) => {
    try {
        const id = req.params.cid;
        const cart = await CartsManagerDB.getInstance().deleteCart(id);
        res.json({ status: 'success', payload: cart });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

cartsRouter.delete('/:cid/products/:pid', async(req, res) => {
    try {
        const cartId = req.params.cid;
        const productId = req.params.pid;
        const cart = await CartsManagerDB.getInstance().removeProdFromCart(cartId, productId);
        res.json({ status: 'success', payload: cart });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default cartsRouter;