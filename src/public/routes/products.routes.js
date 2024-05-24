import { Router } from 'express';
import { ProductManagerDB } from '../../dao/productsManager.db.js';

const productsRouter = Router();

productsRouter.get('/', async(req, res) => {
    try {
        const { title, description, price, code, stock, status, category } = req.body;
        const thumbnail = req.file ? req.file.filename : null;

        const nuevoProducto = {
            title,
            description,
            price,
            code,
            stock,
            status: status === 'true',
            category,
            thumbnail: thumbnail ? [thumbnail] : [],
        };

        const productoGuardado = await ProductManagerDB.getInstance().addProduct(nuevoProducto);

        // Emitir evento de nuevo producto a través de Socket.IO
        req.app.get('io').emit('new-product', productoGuardado);

        res.status(201).json({ message: 'Producto agregado correctamente', product: productoGuardado });
    } catch (error) {
        console.error('Error al agregar el producto:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});

export default productsRouter;