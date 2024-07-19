import cartModel from '../dao/models/cart.model.js';
import { ProductManagerDB } from './productsManager.db.js';
import productModel from '../../dao/models/products.model.js';
import ticketModel from '../dao/models/ticket.model.js';

export class CartsManagerDB {
    static #instance;

    constructor(cartModel, userModel) { 
        this.cartModel = cartModel;
        this.userModel = userModel;
        this.productModel = productModel;
    };

    static getInstance() {
        if(!CartsManagerDB.#instance) {
            CartsManagerDB.#instance = new CartsManagerDB();
        }
        return CartsManagerDB.#instance;
    };

    async getCartById(id) {
        try {
            if (id.length !== 24) {
                throw new Error ('El id debe tener 24 caracteres')
            }

            const cart = await cartModel.find().populate('_user_id').populate('products._id').lean();

            if (!cart) {
                throw new Error(`No se encontró el carrito con id ${id}`);
            }

            return cart;
        } catch (error) {
            throw error;
        }
    };

    async createCart() {
        try {
            const cart = await cartModel.create({});

            if(!cart) {
                throw new Error ('No se pudo crear el carrito');
            }

            return cart;
        } catch (error) {
            throw error;
        }
    };

    async addProductToCart(cartId, productId){
        try {
            await ProductManagerDB.getInstance().getProductById(productId);
            let cart = await this.getCartById(cartId);
            const productIndex = cart.products.findIndex(product => product.productId._id.toString() === productId);

            if(productIndex !== -1){
                cart.products[productIndex].quantity++;
            } else {
                cart.products.push({ productId: productId, quantity: 1});
            }
            cart = await cartModel.findByIdAndUpdate(cartId, { products: cart.products }, { new: true });
            return cart;
        } catch (error) {
            throw error;
        }
    }


    async updateCart(id, products) {
        try {
            const promises = products.map(product => {
                return ProductManagerDB.getInstance().getProductById(product.product)
                    .catch(error => {
                        throw error;
                    });
            });

            await Promise.all(promises);

            let cart = await this.getCartById(id);

            products.forEach(product => {
                const productIndex = cart.products.findIndex(product => product.productId._id.toString() === productId);
                if (productIndex !== -1) {
                    cart.products[productIndex].quantity = product.quantity;
                } else {
                    cart.products.push({ product: product.productId, quantity: product.quantity });
                }
            });

            await cartModel.updateOne({ _id:id }, { products: cart.products });

            cart = await this.getCartById(id);
            return cart;
        } catch (error) {
            throw error;
        }
    };

    async updateProdQuantity(cartId, productId, quantity) {
        try {
            let cart = await this.getCartById(cartId);
            const productIndex = cart.products.findIndex(product => product.productId._id.toString() === productId);
            if(productIndex === -1) {
                throw new Error(`No se encontró el producto con id ${productId} en el carrito con id ${cartId}`);
            } else {
                cart.products[productIndex].quantity = quantity;
            }

            await cartModel.updateOne({ _id: cartId }, { products: cart.products });
            cart = await this.getCartById(cartId);
            return cart;
        } catch (error) {
            throw error;
        }
    };

    async deleteCart(id) {
        try {
            let cart = await this.getCartById(id);
            await cartModel.updateOne({ _id: id }, { products: [] });

            cart = await this.getCartById(id);
            return cart;
        } catch (error) {
            throw error;
        }
    };

    async removeProdFromCart(cartId, productId) {
        try {
            let cart = await this.getCartById(cartId);
            const productIndex = cart.products.findIndex(product => product.productId._id.toString() === productId);

            if(productIndex === -1) {
                throw new Error(`No se encontró el producto con id ${productId} en el carrito con id ${cartId}`);
            } else {
                cart.products.splice(productIndex, 1);
            }

            await cartModel.updateOne({ _id: cartId }, { products: cart.products });
            cart = await this.getCartById(cartId);
            return cart;
        } catch (error) {
            throw error;
        }
    };

    async purchaseCart(cartId, userMail, req){
        try {
            const userId = req.session.user._id;
            console.log('User ID:', userId);

            const cart = await this.getCartById(cartId, userId);
            if(!cart){
                console.log('Carrito no encontrado');
                return { status: 400, error: 'Carrito no encontrado' };
            }
            console.log('Carrito encontrado', cart);

            let totalAmount = 0;
            const unavailableProducts = [];

            for(const cartProduct of cart.products) {
                const product = cartProduct.product;
                const availableStock = product.stock

                if(availableStock >= cartProduct.quantity) {
                    product.stock -= cartProduct.quantity;
                    totalAmount += productPrice * cartProduct.quantity;
                    await product.save();
                } else {
                    unavailableProducts.push(product._id);
                }
            };

            const purchasedProducts = cart.products.filter(cartProduct => !unavailableProducts.includes(cartProduct.products._id));

            let ticket = null;
            if(purchasedProducts.length > 0){
                ticket = new ticketModel({
                    amount: totalAmount,
                    purchaser: userMail
                });

                await ticket.save();
                console.log('Ticket creado: ', ticket);
            };

            cart.products = cart.products.filter(cartProduct => unavailableProducts.includes(cartProduct.product._id));
            await cart.save();

            console.log('Compra realizada exitosamente');
            return {
                status: 200,
                payload: {
                    message: 'Compra realizada exitosamente',
                    ticket: ticket,
                    unavailableProducts: unavailableProducts
                }
            };
        } catch (error) {
            console.error('Error al procesar la compra:', error);
            return { status: 500, error: 'Error al procesar la compra' };
        }
    }
}