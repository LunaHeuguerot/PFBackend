import cartModel from '../../dao/models/cart.model.js';
import { ProductManagerDB } from './productsManager.db.js';
import productModel from '../../dao/models/products.model.js';
import ticketModel from '../../dao/models/ticket.model.js';
import { sendPurchaseEmail } from '../../services/emails.js';

export class CartsManagerDB {
    static #instance;

    constructor() { 
        this.cartModel = cartModel;
        this.productModel = productModel;
    }

    static getInstance() {
        if (!CartsManagerDB.#instance) {
            CartsManagerDB.#instance = new CartsManagerDB();
        }
        return CartsManagerDB.#instance;
    }

    async getCartById(id) {
        try {
            if (id.length !== 24) {
                throw new Error('El id debe tener 24 caracteres');
            }
    
            const cart = await this.cartModel.findById(id).populate('_user_id').populate('products._id').lean();
    
            if (!cart) {
                throw new Error(`No se encontró el carrito con id ${id}`);
            }
    
            if (!cart.products) {
                cart.products = []; 
            }
    
            return cart;
        } catch (error) {
            throw error;
        }
    }
    
    async createCart() {
        try {
            const cart = await this.cartModel.create({});
            if (!cart) {
                throw new Error('No se pudo crear el carrito');
            }
            return cart;
        } catch (error) {
            throw error;
        }
    }

    async addProductToCart(cartId, productId, userId, quantity = 1) {
        try {
            const product = await ProductManagerDB.getInstance().getProductById(productId);
        
            if (!product) {
                throw new Error(`Producto con id ${productId} no encontrado.`);
            }

            if (userId === product.owner.toString()) {
                throw new Error('Los usuarios premium no pueden agregar sus propios productos al carrito.');
            }

            let cart = await this.getCartById(cartId);
            const existingProductIndex = cart.products.findIndex(prod => prod._id.toString() === productId);

            if (existingProductIndex !== -1) {
                cart.products[existingProductIndex].quantity += quantity;
            } else {
                cart.products.push({ _id: productId, quantity });
            }

            const updatedCart = await this.cartModel.findByIdAndUpdate(cartId, { products: cart.products }, { new: true });
            return updatedCart;
        } catch (error) {
            throw error;
        }
    }

    async removeProdFromCart(cartId, productId) {
        try {
            let cart = await this.getCartById(cartId);
            cart.products = cart.products.filter(prod => prod._id.toString() !== productId);
            await this.cartModel.findByIdAndUpdate(cartId, { products: cart.products }, { new: true });
        } catch (error) {
            throw error;
        }
    }

    async updateCart(cartId, prodUp) {
        try {
            let cart = await this.getCartById(cartId);
            cart.products = prodUp;
            await this.cartModel.findByIdAndUpdate(cartId, { products: cart.products }, { new: true });
        } catch (error) {
            throw error;
        }
    }

    async updateProdQuantity(cartId, productId, quantity) {
        try {
            let cart = await this.getCartById(cartId);
            const productIndex = cart.products.findIndex(prod => prod._id.toString() === productId);

            if (productIndex === -1) {
                throw new Error('Producto no encontrado en el carrito.');
            }

            cart.products[productIndex].quantity = quantity;
            await this.cartModel.findByIdAndUpdate(cartId, { products: cart.products }, { new: true });
            return cart;
        } catch (error) {
            throw error;
        }
    }

    async deleteCart(cartId) {
        try {
            const result = await this.cartModel.findByIdAndDelete(cartId);
            if (!result) {
                throw new Error(`No se encontró el carrito con id ${cartId}`);
            }
        } catch (error) {
            throw error;
        }
    }

    async purchaseCart(cart) {
        try {
            const purchaseDetails = cart.products.map(prod => ({
                productId: prod._id,
                quantity: prod.quantity,
            }));

            const ticket = await ticketModel.create({ products: purchaseDetails });

            await sendPurchaseEmail(cart._user_id.email, ticket);
            return ticket; 
        } catch (error) {
            throw error;
        }
    }
}
