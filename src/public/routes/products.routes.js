import { Router } from 'express';

import { ProductManagerDB } from '../../dao/productsManager.db.js';

const productsRouter = Router();

productsRouter.get('/', async(req, res) => {
    try {
        const products = await ProductManagerDB.getInstance().getProducts();
        const limit = parseInt(req.query.limit);
        let limitedProducts = [...products];

        if(!isNaN(limit) && limit > 0){
            limitedProducts = limitedProducts.slice(0, limit);
        }

        res.status(200).send(limitedProducts);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los productos' });
    }
});
productsRouter.get('/:pid', async(req, res) => {
    try {
        const products = await ProductManagerDB.getInstance().getProducts();
        let pid = parseInt(req.params.pid);
        let product = products.find(p => p.id === pid);

        if(!product) return res.status(404).json({ error: 'Producto no encontrado' });

        res.send(product);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener producto' });
    }
});
productsRouter.post('/', async(req, res) => {
    try {
        let product = req.body;
        product = await ProductManagerDB.getInstance().addProduct(product);
        res.json({ status: 'success', payload: product });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
productsRouter.put('/:pid', async(req, res) => {
    try {
        const id = +req.params.pid;
        let product = req.body;
        product = await ProductManagerDB.getInstance().updateProduct(id, product);
        res.json({ status: 'success', payload: product});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
productsRouter.delete('/:pid', async(req, res) => {
    try {
        const id = req.params.pid;
        const product = await ProductManagerDB.getInstance().deleteProduct(id);
        res.json({ status: 'success', payload: product });
    } catch {
        res.status(500).json({ error: error.message });
    }
});

export default productsRouter;