import { Router } from "express";
import { uploader } from '../services/uploader.js';
import { isValidPassword, handlePolicies, verifySession, verifyRequiredBody } from "../services/utils.js";
import config from "../services/config.js";
import { generateMockProds } from "../services/mocking.js";
import { ProductManagerDB } from "../controllers/managers/productsManager.db.js";
import userModel from "../dao/models/user.model.js";
import { sendProductDeletionEmail } from "../services/emails.js";

const productsRouter = Router();
const routeUrl = '/api/products'

productsRouter.param('id', async (req, res, next, id) => {
    if (!config.MONGODB_ID_REGEX.test(req.params.id)) {
        return res.status(400).send({ origin: config.SERVER, payload: null, error: 'Id no válido' });
    }

    next();
});

productsRouter.get('/mockingproducts/:qty', (req, res) => {
    const qty = parseInt(req.params.qty, 10);
    if (isNaN(qty) || qty <= 0) {
        return res.status(400).send({ error: 'not valid quantity' });
    }
    const mockProducts = generateMockProds(qty);
    res.json(mockProducts);
});

productsRouter.get('/', async (req, res) => {
    const limit = +req.query.limit || 10;
    const page = +req.query.page || 1;
    const sort = req.query.sort;
    const query = req.query.query;
    const products = await ProductManagerDB.getInstance().getProducts(limit, page, sort, query);
    if(products) {
        res.status(200).send({ status: 'Ok', payload: products });
    } else {
        res.status(400).send({ status: 'Not Ok', payload: [] });
    }
});


productsRouter.get('/:pid', async (req, res) => {
    const pid = req.params.pid;
    const product = await ProductManagerDB.getInstance().getProductById( { _id: pid } );
    if(product !== undefined) {
        res.status(200).send({ status: 'Ok', payload: product });
    } else {
        res.status(400).send({ status: 'Not Ok', payload: [], error: 'El producto buscado no existe.' });
    }
});

productsRouter.post('/', uploader.single('thumbnails'), handlePolicies(['admin','premium']), verifyRequiredBody(['title', 'description', 'price', 'code', 'stock', 'category']), async (req, res) => {
    const socketServer = req.app.get('socketServer');
    const prodAdd = req.body;
    const user = req.session.user;
    const rta = await ProductManagerDB.getInstance().addProduct(prodAdd, user);

    if(rta===0) {
        res.status(400).send({ status: 'Not Ok', payload: [], error: 'Alguno de los campos no llego correctamente.' });
        req.logger.error(`date: ${new Date().toDateString()} ${new Date().toLocaleTimeString()} | method: ${req.method} | ip: ${req.ip} | url: ${routeUrl}${req.url}`);
    } else {
        if(rta===1) {
            res.status(400).send({ status: 'Not Ok', payload: [], error: 'El valor del campo code ya existe y no se puede repetir.' });
            req.logger.error(`date: ${new Date().toDateString()} ${new Date().toLocaleTimeString()} | method: ${req.method} | ip: ${req.ip} | url: ${routeUrl}${req.url}`);    
        } else {
            res.status(200).send({ status: 'Ok', payload: rta, mensaje: `Producto con código ${rta.code}, agregado OK` });
            req.logger.info(`date: ${new Date().toDateString()} ${new Date().toLocaleTimeString()} | method: ${req.method} | ip: ${req.ip} | url: ${routeUrl}${req.url}`);
            socketServer.emit('newProduct', rta);
        }
    }
});

productsRouter.put('/:pid', handlePolicies('admin'), async (req, res) => {
    const pid = req.params.pid;
    const prodUp = req.body;
    const rta = await ProductManagerDB.getInstance().updateProduct(pid, prodUp);
    if (rta === 0) {
        res.status(200).send({ status: 'Ok', payload: prodUp, mensaje: `Producto con id ${pid}, fue modificado.` });
    } else {
        res.status(400).send({ status: 'Not Ok', payload: [], error: `No se encontro el producto con id ${pid} para ser editado.` });
    };
});

productsRouter.delete('/:pid', handlePolicies('admin'), async (req, res) => {
    const socketServer = req.app.get('socketServer');
    const pid = req.params.pid;

    const result = await ProductManagerDB.getInstance().deleteProduct(pid);

    if (result) {
        const product = result; 

        const owner = await userModel.findById(product.owner);
        if (owner && owner.role === 'premium') {
            await sendProductDeletionEmail(owner.email, product.title);
        }

        res.status(200).send({ status: 'Ok', payload: [], mensaje: `Producto con id ${pid}, fue borrado.` });
        const prodRender = await ProductManagerDB.getInstance().getProducts(0);
        socketServer.emit('deleteProduct', prodRender);
    } else {
        res.status(400).send({ status: 'Not Ok', mensaje: 'No se pudo eliminar el producto.' });
    }
});

productsRouter.all('*', async (req, res) => {
    res.status(404).send({ origin: config.SERVER, payload: null, error: 'No se encuentra la ruta solicitada' }); 
});

export default productsRouter;
