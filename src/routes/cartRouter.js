import { Router } from "express";
import { CartsManagerDB } from "../controllers/managers/cartsManager.db.js";
import config from '../services/config.js';
import nodemailer from 'nodemailer';
import { handlePolicies } from '../services/utils.js';
import twilio from 'twilio';

const cartRouter = Router();

const twilioClient = twilio(config.TWILIO_SID, config.TWILIO_TOKEN);

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

cartRouter.get('/sms', async (req, res) => {
    try {
        const confirmation = await twilioClient.messages.create({
            body: 'Mensaje enviado con servicio Twilio',
            from: config.TWILIO_PHONE,
            to: 'telefono_destino'
        });
        res.status(200).send({ status: 'OK', data: confirmation });
    } catch (err) {
        res.status(500).send({ status: 'ERR', data: err.message });
    }
});

cartRouter.post('/', async (req, res) => {
    try {
        const cartManager = CartsManagerDB.getInstance();
        const cart = await cartManager.createCart();
        res.status(200).json({ status: 'success', payload: cart });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

cartRouter.get('/:cid', async (req, res) => {
    const cid = req.params.cid;
    try {
        const cart = await CartsManagerDB.getInstance().getCartById(cid);
        res.status(200).send({ status: 'Ok', payload: cart });
    } catch (error) {
        res.status(400).send({ status: 'Not Ok', payload: [], error: error.message });
    }
});

cartRouter.post('/:cid/product/:pid', handlePolicies('user', 'self'), async (req, res) => {
    try {
        const cid = req.params.cid;
        const pid = req.params.pid;
        const userId = req.session.user._id;  
        const quantity = req.query.quantity ? parseInt(req.query.quantity) : 1; 

        const updatedCart = await CartsManagerDB.getInstance().addProductToCart(cid, pid, userId, quantity);
        res.status(200).json({ 
            status: 'Ok', 
            mensaje: `Se agregó el producto con id ${pid} al carrito con id ${cid} correctamente`, 
            payload: updatedCart  
        });

    } catch (error) {
        console.error('Error al agregar producto al carrito:', error);
        res.status(500).json({ 
            status: 'error', 
            message: 'Error al agregar el producto al carrito', 
            error: error.message 
        });
    }
});

cartRouter.delete('/:cid/product/:pid', async (req, res) => {
    const cid = req.params.cid;
    const pid = req.params.pid;
    try {
        const rta = await CartsManagerDB.getInstance().removeProdFromCart(cid, pid);
        res.status(200).send({ status: 'Ok', mensaje: `Se eliminó el producto con id ${pid} del carrito con id ${cid}.` });
    } catch (error) {
        res.status(400).send({ status: 'Not Ok', error: error.message });
    }
});

cartRouter.put('/:cid', async (req, res) => {
    const cid = req.params.cid;
    const prodUp = req.body;
    try {
        const rta = await CartsManagerDB.getInstance().updateCart(cid, prodUp);
        res.status(200).send({ status: 'Ok', mensaje: `Se modificó el carrito con id ${cid} con el array de productos ${prodUp}.` });
    } catch (error) {
        res.status(400).send({ status: 'Not Ok', error: error.message });
    }
});

cartRouter.put('/:cid/product/:pid', async (req, res) => {
    const cid = req.params.cid;
    const pid = req.params.pid;
    const quantityUp = +req.body.quantity;

    if (quantityUp <= 0 || isNaN(quantityUp)) {
        return res.status(400).send({ status: 'Not Ok', error: 'Se requiere una cantidad numérica mayor a 0.' });
    }

    try {
        const updatedCart = await CartsManagerDB.getInstance().updateProdQuantity(cid, pid, quantityUp);
        res.status(200).send({ status: 'Ok', payload: updatedCart, mensaje: `Se actualizó la cantidad del producto con id ${pid} en el carrito con id ${cid}.` });
    } catch (error) {
        console.error('Error al actualizar la cantidad del producto:', error);
        res.status(500).send({ status: 'error', message: 'Error al actualizar la cantidad del producto', error: error.message });
    }
});

cartRouter.delete('/:cid', async (req, res) => {
    const cid = req.params.cid;
    try {
        const rta = await CartsManagerDB.getInstance().deleteCart(cid);
        res.status(200).send({ status: 'Ok', mensaje: `Se vació correctamente el carrito con id ${cid}.` });
    } catch (error) {
        res.status(400).send({ status: 'Not Ok', error: error.message });
    }
});

cartRouter.post('/:cid/purchase', handlePolicies('user'), async (req, res) => {
    const cid = req.params.cid;
    try {
        const cart = await CartsManagerDB.getInstance().getCartById(cid);
        const cartFiltered = await CartsManagerDB.getInstance().purchaseCart(cart);
        res.status(200).send({ status: 'Ok', payload: cartFiltered, mensaje: `Se cerró correctamente el carrito con id ${cid} OK` });
    } catch (error) {
        res.status(400).send({ status: 'Not Ok', error: error.message });
    }
});

cartRouter.all('*', async (req, res) => {
    res.status(404).send({ origin: config.SERVER, payload: null, error: 'No se encuentra la ruta solicitada' }); 
});

export default cartRouter;
