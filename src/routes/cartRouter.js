import { Router } from "express";
import { CartsManagerDB } from "../controllers/managers/cartsManager.db.js";
import config from "../services/config.js";
import nodemailer from "nodemailer";
import { handlePolicies } from "../services/utils.js";
import twilio from "twilio";
import mongoose from "mongoose";
import { sendPurchaseEmail } from "../services/emails.js";
import { ticketManager } from "../controllers/managers/ticketManager.db.js";

const cartRouter = Router();

const twilioClient = twilio(config.TWILIO_SID, config.TWILIO_TOKEN);

const transport = nodemailer.createTransport({
  service: "gmail",
  port: 587,
  auth: {
    user: config.GMAIL_APP_USER,
    pass: config.GMAIL_APP_PASS,
  },
});

cartRouter.param("cid", async (req, res, next, id) => {
  if (!config.MONGODB_ID_REGEX.test(id)) {
    return res
      .status(400)
      .send({
        origin: config.SERVER,
        payload: null,
        error: "Id de carrito no válido",
      });
  }
  next();
});

cartRouter.param("pid", async (req, res, next, id) => {
  if (!config.MONGODB_ID_REGEX.test(id)) {
    return res
      .status(400)
      .send({
        origin: config.SERVER,
        payload: null,
        error: "Id de producto no válido",
      });
  }
  next();
});

cartRouter.get("/mail", async (req, res) => {
  try {
    const confirmation = await transport.sendMail({
      from: `Sistema Coder Luna <${config.GMAIL_APP_USER}>`,
      to: "dblunah@gmail.com",
      subject: "Pruebas Nodemailer",
      html: "<h1>Prueba 01</h1>",
    });
    res.status(200).send({ status: "OK", data: confirmation });
  } catch (err) {
    res.status(500).send({ status: "ERR", data: err.message });
  }
});

cartRouter.get("/sms", async (req, res) => {
  try {
    const confirmation = await twilioClient.messages.create({
      body: "Mensaje enviado con servicio Twilio",
      from: config.TWILIO_PHONE,
      to: "telefono_destino",
    });
    res.status(200).send({ status: "OK", data: confirmation });
  } catch (err) {
    res.status(500).send({ status: "ERR", data: err.message });
  }
});

cartRouter.post("/", async (req, res) => {
  try {
    const cartManager = CartsManagerDB.getInstance();
    const cart = await cartManager.createCart();
    res.status(200).json({ status: "success", payload: cart });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

cartRouter.get("/:cid", async (req, res) => {
  const cid = req.params.cid;
  const cart = await CartsManagerDB.getInstance().getCartById(cid);
  if (cart) {
    res.status(200).send({ status: "Ok", payload: cart });
  } else {
    res
      .status(400)
      .send({
        status: "Not Ok",
        payload: [],
        error: `El carrito buscado con id ${cid} no existe`,
      });
  }
});

cartRouter.post(
  "/:cid/product/:pid",
  handlePolicies("user", "self"),
  async (req, res) => {
    try {
      const cid = req.params.cid;
      const pid = req.params.pid;
      const userId = req.session.user._id;
      const quantity = req.query.quantity ? parseInt(req.query.quantity) : 1;
      const updatedCart = await CartsManagerDB.getInstance().addProductToCart(
        cid,
        pid,
        userId,
        quantity
      );
      req.session.cart = updatedCart;

      console.log("Carrito almacenado en la sesión:", req.session.cart);

      if (!updatedCart) {
        return res.status(400).json({
          status: "Not Ok",
          error: `No se pudo agregar el producto con id ${pid} al carrito con id ${cid}`,
        });
      }

      res.status(200).json({
        status: "Ok",
        mensaje: `Se agregó el producto con id ${pid} al carrito con id ${cid} correctamente`,
        payload: {
          cartId: updatedCart._id,
          products: updatedCart.products.map((product) => ({
            productId: product.productId,
            productCode: product.productCode,
            quantity: product.quantity,
          })),
          total: updatedCart.total,
        },
      });
    } catch (error) {
      console.error("Error al agregar producto al carrito:", error);
      res.status(500).json({
        status: "error",
        message: "Error al agregar el producto al carrito",
        error: error.message,
      });
    }
  }
);

cartRouter.delete("/:cid/product/:code", async (req, res) => {
  const cid = req.params.cid;
  const code = req.params.code;
  try {
    const rta = await CartsManagerDB.getInstance().removeProdFromCart(
      cid,
      code
    );

    res
      .status(200)
      .send({
        status: "Ok",
        payload: rta,
        mensaje: `Se eliminó el producto con código ${code} del carrito con id ${cid}.`,
      });
  } catch (error) {
    if (error.message.includes("No se encontró el producto")) {
      return res
        .status(400)
        .send({ status: "Not Ok", payload: [], error: error.message });
    }
    if (error.message.includes("El carrito con id")) {
      return res
        .status(400)
        .send({ status: "Not Ok", payload: [], error: error.message });
    }
    return res
      .status(500)
      .send({
        status: "Not Ok",
        payload: [],
        error: "Error interno del servidor.",
      });
  }
});

cartRouter.put("/:cid", async (req, res) => {
  const cid = req.params.cid;
  const prodUp = req.body;
  const rta = await CartsManagerDB.getInstance().updateCart(cid, prodUp);
  if (rta === 0) {
    res
      .status(400)
      .send({
        status: "Not Ok",
        payload: [],
        error: `El carrito con id ${cid} no existe`,
      });
  } else {
    res
      .status(200)
      .send({
        status: "Ok",
        payload: [],
        mensaje: `Se modificó el carrito con id ${cid} con el array de productos ${prodUp}. OK`,
      });
  }
});

cartRouter.put(
  "/:cid/product/:code",
  handlePolicies("user", "self"),
  async (req, res) => {
    try {
      const cid = req.params.cid;
      const productCode = req.params.code;
      const { quantity } = req.body;

      console.log(
        `Recibiendo solicitud para actualizar la cantidad del producto con código ${productCode} en el carrito con ID ${cid}. Nueva cantidad: ${quantity}`
      );

      if (!mongoose.Types.ObjectId.isValid(cid)) {
        return res.status(400).json({
          status: "error",
          message: "El ID del carrito no es válido",
        });
      }

      const updatedCart =
        await CartsManagerDB.getInstance().updateProductQuantityByCode(
          cid,
          productCode,
          quantity
        );

      req.session.cart = updatedCart;

      res.status(200).json({
        status: "Ok",
        mensaje: `Cantidad del producto con código ${productCode} actualizada correctamente en el carrito con ID ${cid}.`,
        payload: updatedCart,
      });
    } catch (error) {
      console.error("Error al actualizar la cantidad del producto:", error);
      res.status(500).json({
        status: "error",
        message: "Error al actualizar la cantidad del producto",
        error: error.message,
      });
    }
  }
);

cartRouter.delete("/:cid", async (req, res) => {
  const cid = req.params.cid;
  const rta = await CartsManagerDB.getInstance().deleteCart(cid);
  if (rta === 0) {
    res
      .status(400)
      .send({
        status: "Not Ok",
        payload: [],
        error: `El carrito con id ${cid} no existe`,
      });
  } else {
    res
      .status(200)
      .send({
        status: "Ok",
        payload: [],
        mensaje: `Se vació correctamente el carrito con id ${cid}. OK`,
      });
  }
});

cartRouter.post('/:cid/purchase', handlePolicies('user'), async (req, res) => {
    const { cid } = req.params;
    console.log('ID del carrito recibido en la ruta:', cid);
    const cart = await CartsManagerDB.getInstance().getCartById(cid);

    if (cart) {
        const userEmail = req.session.user?.email; 

        if (!userEmail) {
          return res.status(400).send({
              status: 'Not Ok',
              payload: [],
              error: 'Falta el correo electrónico del usuario en la sesión.'
          });
        }
      
        const cartFiltered = await CartsManagerDB.getInstance().purchaseCart(cart, req.session.user);

        const subject = 'Confirmación de Compra';
        const text = `
            ¡Gracias por su compra!
            Su carrito con ID ${cid} ha sido cerrado correctamente.
            Detalles de la compra:
            ${cart.products.map(product => `
                Código: ${product.productCode}, 
                Nombre: ${product.productId.title}, 
                Cantidad: ${product.quantity}, 
                Precio: $${product.productId.price}, 
                Subtotal: $${product.quantity * product.productId.price}
            `).join('')}
            Total: $${cart.total}
        `;

        try {
            await sendPurchaseEmail(userEmail, subject, text);
        } catch (emailError) {
            console.error('Error al enviar el correo de confirmación:', emailError);
        }

        res.status(200).send({ status: 'Ok', payload: cartFiltered, mensaje: `Se cerró correctamente el carrito con id ${cid} OK` });
    } else {
        res.status(400).send({ status: 'Not Ok', payload: [], error: `El carrito buscado con id ${cid} no existe` });
    }
});
  
cartRouter.all("*", async (req, res) => {
  res
    .status(404)
    .send({
      origin: config.SERVER,
      payload: null,
      error: "No se encuentra la ruta solicitada",
    });
});

export default cartRouter;
