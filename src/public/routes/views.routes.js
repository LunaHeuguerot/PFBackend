import { Router } from 'express';
import { ProductManagerDB } from '../../dao/productsManager.db.js';
import { CartsManagerDB } from '../../dao/cartsManager.db.js';
import productModel from '../../dao/models/products.model.js';
import cartModel from '../../dao/models/cart.model.js';

const viewsRouter = Router();

viewsRouter.get('/products', async(req, res) => {
    try {
        const products = await ProductManagerDB.getInstance().getProducts(req);
        res.render('products', {
            products: products,
            style: 'products.css'
        })
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

viewsRouter.get('/api/products', async (req, res) => {
    try {
        const products = await productModel.find().lean(); 
        res.render('realTimeProducts', { products }); 
    } catch (error) {
        console.error(error);
        res.status(500).send('Error interno del servidor');
    }
});

viewsRouter.get('/chat', (req, res) => {
    res.render('chat', {});
});

viewsRouter.get('/carts/:cid', async(req, res) => {
    const id = req.params.cid;
    try {
        const cart = await cartModel.findOne({ _id: id }).lean();
        cart.products = cart.products.map(product => {
            return {
                ...product,
                subtotal: product.productId.price * product.quantity
            };
        });
        cart.total = cart.products.reduce((acc, product) => acc + product.subtotal, 0).toFixed(2);
        res.render('carts', {
            style: 'carts.css',
            cart
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default viewsRouter;