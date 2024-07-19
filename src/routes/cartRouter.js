import { Router } from "express";
import { CartsManagerDB } from "../controllers/managers/cartsManager.db.js";
import config from '../services/config.js';
import nodemailer from 'nodemailer';
import { handlePolicies } from '../services/utils.js';

const cartRouter = Router();


const transport = nodemailer.createTransport({
    service: 'gmail',
    port: 587,
    auth: {
        user: config.GMAIL_APP_USER,
        pass: config.GMAIL_APP_PASS
    }
});

cartRouter.param('cid', async (req, res, next, id) => {
    if (!config.MONGODB_ID_REGEX.test(id)) {
        return res.status(400).send({ origin: config.SERVER, payload: null, error: 'Id de carrito no válido' });
    }

    next();
});

cartRouter.param('pid', async (req, res, next, id) => {
    if (!config.MONGODB_ID_REGEX.test(id)) {
        return res.status(400).send({ origin: config.SERVER, payload: null, error: 'Id de producto no válido' });
    }

    next();
});

cartRouter.get('/mail', async (req, res) => {
    try {
        const confirmation = await transport.sendMail({
            from: `Sistema Coder Luna <${config.GMAIL_APP_USER}>`,
            to: 'dblunah@gmail.com',
            subject: 'Pruebas Nodemailer',
            html: '<h1>Prueba 01</h1>'
        });
        res.status(200).send({ status: 'OK', data: confirmation });
    } catch (err) {
        res.status(500).send({ status: 'ERR', data: err.message });
    }
});
    

cartRouter.post('/', async (req, res) => {
    const rta = await CartsManagerDB.getInstance().createCart();
    if (rta) {
        res.status(200).send({ status: 'Ok', payload: [], mensaje: `Se creo un nuevo carrito con id ${rta._id} OK` });
    } else {
        res.status(400).send({ status: 'Not Ok', payload: [], error: 'No se pudo crear un nuevo carrito.' });
    }
});

cartRouter.get('/:cid', async (req, res) => {
    const cid = req.params.cid;
    const cart = await CartsManagerDB.getInstance().getCartById(cid);
    if(cart) {
        res.status(200).send({ status: 'Ok', payload: cart });
    } else {
        res.status(400).send({ status: 'Not Ok', payload: [], error: `El carrito buscado con id ${cid} no existe` });
    }
});

cartRouter.post('/:cid/product/:pid', handlePolicies('user', 'self'), async (req, res) => {
    const cid = req.params.cid;
    const pid = req.params.pid;
    const rta = await CartsManagerDB.getInstance().addProductToCart(cid,pid);
    if (rta === 0) {
        res.status(400).send({ status: 'Not Ok', payload: [], error: `El carrito con id ${cid} no existe` });
    } else {
        if (rta === 1) {
            res.status(400).send({ status: 'Not Ok', payload: [], error: `El producto con id ${pid} no existe` });
        } else {
            res.status(200).send({ status: 'Ok', payload: [], mensaje: `Se agrego el producto con id ${pid} al carrito con id ${cid} OK` });
        }
    };
});


cartRouter.delete('/:cid/product/:pid', async (req, res) => {
    const cid = req.params.cid;
    const pid = req.params.pid;
    const rta = await CartsManagerDB.getInstance().removeProdFromCart(cid,pid);
    if (rta === 0) {
        res.status(400).send({ status: 'Not Ok', payload: [], error: `El carrito con id ${cid} no existe` });
    } else {
        if (rta === 1) {
            res.status(400).send({ status: 'Not Ok', payload: [], error: `El producto con id ${pid} no existe en el carrito con id ${cid}.` });
        } else {
            res.status(200).send({ status: 'Ok', payload: [], mensaje: `Se elimino el producto con id ${pid} al carrito con id ${cid}. OK` });
        }
    };
});



cartRouter.put('/:cid', async (req, res) => {
    const cid = req.params.cid;
    const prodUp = req.body;
    const rta = await CartsManagerDB.getInstance().updateCart(cid, prodUp);
    if (rta === 0) {
        res.status(400).send({ status: 'Not Ok', payload: [], error: `El carrito con id ${cid} no existe` });
    } else {
        res.status(200).send({ status: 'Ok', payload: [], mensaje: `Se modifico el carrito con id ${cid} con el array de productos ${prodUp}. OK` });
    };
});


cartRouter.put('/:cid/product/:pid', async (req, res) => {
    const cid = req.params.cid;
    const pid = req.params.pid;
    const quantityUp = +req.body.quantity;
    if (quantityUp <= 0 || isNaN(quantityUp)) {
        res.status(400).send({ status: 'Not Ok', payload: [], error: `Se requiere una cantidad numérico mayor a 0.` });
    } else {
        const rta = await CartsManagerDB.getInstance().updateProdQuantity(cid,pid,quantityUp);
        if (rta === 0) {
            res.status(400).send({ status: 'Not Ok', payload: [], error: `El carrito con id ${cid} no existe` });
        } else {
            if (rta === 1) {
                res.status(400).send({ status: 'Not Ok', payload: [], error: `El producto con id ${pid} no existe en el carrito con id ${cid}.` });
            } else {
                res.status(200).send({ status: 'Ok', payload: [], mensaje: `Se actualizo a ${quantityUp} la cantidad del producto con id ${pid} en el carrito con id ${cid}. OK` });
            }
        };

    }
});

cartRouter.delete('/:cid', async (req, res) => {
    const cid = req.params.cid;
    const rta = await CartsManagerDB.getInstance().deleteCart(cid);
    if (rta === 0) {
        res.status(400).send({ status: 'Not Ok', payload: [], error: `El carrito con id ${cid} no existe` });
    } else {
        res.status(200).send({ status: 'Ok', payload: [], mensaje: `Se vacio correctamente el carrito con id ${cid}. OK` });
    };
});

cartRouter.post('/:cid/purchase', handlePolicies('user'), async (req, res) => {
    const cid = req.params.cid;
    const cart = await manager.getCartById(cid);
    if(cart) {
        const cartFiltered = await manager.punchaseCart(cart);
        res.status(200).send({ status: 'Ok', payload: cartFiltered, mensaje: `Se cerro correctamente el carrito con id ${cid} OK` });
    } else {
        res.status(400).send({ status: 'Not Ok', payload: [], error: `El carrito buscado con id ${cid} no existe` });
    }
});


cartRouter.all('*', async (req, res) => {
    res.status(404).send({ origin: config.SERVER, payload: null, error: 'No se encuentra la ruta solicitada' }); 
});

export default cartRouter;