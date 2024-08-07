import express from 'express';
import { ProductManagerDB } from '../controllers/productsManager.db.js';

const router = express.Router();

router.get('/realtimeproducts', async (req, res) => {
    try {
        const products = await ProductManagerDB.getInstance().getProducts();
        res.render('realTimeProducts', { title: 'Real time products', products: products });
    } catch (error) {
        console.error('Error al obtener los productos en tiempo real:', error);
        res.status(500).send('Error interno del servidor');
    }
});

router.post('/realtimeproducts', async (req, res) => {
    try {
        const newProduct = req.body;

        await ProductManagerDB.getInstance().addProduct(newProduct);

        const updatedProducts = await ProductManagerDB.getInstance().getProducts();

        io.emit('new-product', updatedProducts) 

        res.status(200).json({ status: 'success', message: 'Product added successfully' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

export default router;