import cartModel from '../../dao/models/cart.model.js';
import { ProductManagerDB } from './productsManager.db.js';
import productModel from '../../dao/models/products.model.js';
import ticketModel from '../../dao/models/ticket.model.js';
import { sendPurchaseEmail } from '../../services/emails.js';

export class CartsManagerDB {
    static #instance;

    constructor(cartModel, userModel) { 
        this.cartModel = cartModel;
        this.userModel = userModel;
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

            const cart = await cartModel.findById(id).lean();

            if (!cart) {
                throw new Error(`No se encontró el carrito con id ${id}`);
            }
 
            cart.products.forEach(product => {
                if (!product.productId || !product.productId.price) {
                    console.error(`El producto con código ${product?.productCode || 'desconocido'} no tiene un precio definido.`);
                    product.productId.price = 0;  
                }
            });
    
            return cart;
        } catch (error) {
            console.error('Error al obtener el carrito:', error);
            throw new Error(`Error al obtener el carrito: ${error.message}`);
        }
    }
    
    
    
    async createCart() {
        try {
            const cart = await cartModel.create({});
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
            console.log(`Adding product: ${productId}, to cart: ${cartId}, by user: ${userId}, quantity: ${quantity}`);
            
            const product = await ProductManagerDB.getInstance().getProductById(productId);
            console.log('Producto encontrado:', product);
    
            if (!product) {
                throw new Error(`Producto con ID ${productId} no encontrado.`);
            }
    
            if (userId === product.owner.toString()) {
                throw new Error('Los usuarios premium no pueden agregar sus propios productos al carrito.');
            }
    
            let cart = await this.getCartById(cartId);
            console.log('Carrito encontrado:', cart);
    
            if (!cart || !cart.products) {
                throw new Error(`Carrito con ID ${cartId} no encontrado o sin productos.`);
            }
    
            const productIndex = cart.products.findIndex(item => item.productId.toString() === productId);
        
            if (productIndex !== -1) {
                cart.products[productIndex].quantity += quantity;  
            } else {
                cart.products.push({ 
                    productId: productId, 
                    productCode: product.code,  
                    quantity 
                });
            }
            cart = await cartModel.findByIdAndUpdate(cartId, { products: cart.products }, { new: true }).lean(); 
            return cart;
        } catch (error) {
            console.error('Error en addProductToCart:', error);
            throw error;
        }
    }
    

    async updateCart(id, products) {
        try {
            const promises = products.map(product => {
                return ProductManagerDB.getInstance().getProductById(product.productId)
                    .catch(error => {
                        throw error;
                    });
            });

            await Promise.all(promises);

            let cart = await this.getCartById(id);
            products.forEach(product => {
                const productIndex = cart.products.findIndex(item => item.productId._id.toString() === product.product);
                if (productIndex !== -1) {
                    cart.products[productIndex].quantity = product.quantity;
                } else {
                    cart.products.push({ productId: product.productId, productCode: product.code, quantity });
                }
            });

            cart = await cartModel.findByIdAndUpdate(id, { products: cart.products }, { new: true }).lean(); 
            return cart;
        } catch (error) {
            throw error;
        }
    }

    async updateProductQuantity(cartId, productId, quantity) {
        try {
            console.log(`Intentando actualizar la cantidad del producto con ID ${productId} en el carrito con ID ${cartId}. Cantidad: ${quantity}`);
    
            const cart = await this.getCartById(cartId);
            
            if (!cart) {
                throw new Error(`No se encontró el carrito con ID ${cartId}.`);
            }

            const productIndex = cart.products.findIndex(item => item.productId.toString() === productId);

            if (productIndex === -1) {
                throw new Error(`No se encontró el producto con ID ${productId} en el carrito.`);
            }

            cart.products[productIndex].quantity = quantity;
            console.log(`Cantidad del producto con ID ${productId} actualizada a ${quantity}.`);

            const updatedCart = await cartModel.findByIdAndUpdate(cartId, { products: cart.products }, { new: true }).lean();
            
            console.log(`Carrito actualizado:`, updatedCart); 
            return updatedCart; 
    
        } catch (error) {
            console.error('Error al actualizar la cantidad del producto:', error);
            throw new Error(`Error al actualizar la cantidad del producto: ${error.message}`); 
        }
    }
    
        
    async deleteCart(id) {
        try {
            let cart = await this.getCartById(id);
            await cartModel.updateOne({ _id: id }, { products: [] });

            cart = await this.getCartById(id);
            return cart;
        } catch (error) {
            throw error;
        }
    }

    async removeProdFromCart(cartId, productId) {
        try {
            let cart = await this.getCartById(cartId);
            const productIndex = cart.products.findIndex(item => item.productId._id.toString() === productId);

            if (productIndex === -1) {
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
    }

    async purchaseCart(cid, user) {
        try {
            const cartResponse = await this.getCartById(cid); 
            if (!cartResponse) {
                throw new Error('Carrito no encontrado');
            }
    
            const cart = cartResponse;
            if (cart.products.length === 0) {
                return { status: 400, error: 'cart empty' };
            }
    
            const userData = user;
            let ticketAmount = 0;
    
            for (let item of cart.products) {
                const productId = item._id;
                const product = await this.productModel.findById(productId);
                
                if (!product) {
                    throw new Error(`product not found: ${productId}`);
                }
    
                const productStock = product.stock;
                const requestedQuantity = item.qty;
    
                if (requestedQuantity <= productStock) {
                    const quantityUpdated = productStock - requestedQuantity;
                    await this.productModel.findByIdAndUpdate(productId, { stock: quantityUpdated }, { new: true });
    
                    ticketAmount += requestedQuantity * product.price;
    
                } else {
                    await this.productModel.findByIdAndUpdate(productId, { stock: 0 }, { new: true });
                    const quantityNotPurchased = requestedQuantity - productStock;

                    const updateResponse = await this.updateProdQuantity(cid, productId, quantityNotPurchased);
                    if (updateResponse.status !== 200) {
                        return { status: 500, error: 'error updating product stock' };
                    }

                    ticketAmount += productStock * product.price;
                }
            }

            if (ticketAmount > 0) {
                const ticket = {
                    amount: ticketAmount,
                    purchaser: userData.email
                };
                const ticketFinished = await ticketModel.create(ticket);
                console.log('ticket created:', ticketFinished);
                const subject = 'Compra realizada con éxito';
                const text = `Hola ${userData.firstName},\n\nTu compra con el carrito ${cid} ha sido realizada con éxito.\n\nGracias por tu compra.\n\nSaludos.`;
                
                await sendPurchaseEmail(userData.email, subject, text);
                const clearCartResponse = await this.clearCartProducts(cid);
                if (clearCartResponse.status !== 200) {
                    console.error("error emptying cart", clearCartResponse.error);
                    return { status: 500, error: 'error emptying cart' };
                }
    
                return { status: 200, payload: ticketFinished };
            }
        } catch (error) {
            console.error('Error al procesar la compra:', error);
            return { status: 500, error: 'Error al procesar la compra' };
        }
    }
}
