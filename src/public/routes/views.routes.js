import { Router } from 'express';
import { ProductManagerDB } from '../../dao/productsManager.db.js';
import productModel from '../../dao/models/products.model.js';

const viewsRouter = Router();

viewsRouter.get('/products', async(req, res) => {
    try {
        const products = await ProductManagerDB.getInstance().getProducts();
        res.render('products', {
            products
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
export default viewsRouter;
