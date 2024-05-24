import { Router } from 'express';
import mongoose from 'mongoose';
import config from '../../config.js';
import { ObjectId } from 'mongodb';
import productModel from '../../dao/models/products.model.js';
import { uploader } from '../../uploader.js';

const router = Router();


router.get('/', async (req, res) => {
    try {
        const products = await productModel.find().lean();
        res.status(200).send({ status: 200, payload: products });
    } catch (error) {
        console.error("Error en la consulta:", error);
        res.status(500).send({ error: "Error al obtener productos" });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (!ObjectId.isValid(id)) {
            return res.status(400).send({ error: 'Invalid ID format' });
        }
        const product = await productModel.findById(id);
        if (product) {
            res.send(product);
        } else {
            res.status(404).send({ error: 'Product not found' });
        }
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});


router.post('/', uploader.array('thumbnails', 4), async (req, res) => {
    

    const { title, description, price, code, stock, category} = req.body;

    if (!title || !description || !price || !code || !stock || !category) {
        return res.status(400).json({ error: 'Todos los campos requeridos deben estar presentes.' });
    }
    const thumbnails = req.files ? req.files.map(file => file.filename) : [];
    try {
        const newProduct = {
            title,
            description,
            price,
            code,
            stock,
            category,
            thumbnails: thumbnails || []
        };
        const addedProduct = await productModel.create(newProduct);
        res.status(201).json(addedProduct);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.put('/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        if (!ObjectId.isValid(productId)) {
            return res.status(400).json({ error: 'Invalid ID format' });
        }
        const updatedProduct = req.body;
        const result = await productModel.update(productId, updatedProduct);
        if (result) {
            res.json(result);
        } else {
            res.status(404).json({ error: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'ID de producto no válido' });
        }

        const process = await productModel.findOneAndDelete({ _id: id });

        if (!process) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        res.status(200).send({ origin: config.SERVER, payload: process });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});
export default router;