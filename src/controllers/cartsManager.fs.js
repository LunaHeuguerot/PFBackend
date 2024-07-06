import fs from 'fs';
import config from '../services/config.js';
import { ProductManagerFS } from './productsManager.fs.js'

export class CartManagerFS {
    static #instance;

    constructor(){
        this.path = `${config.DIRNAME}/data/carts.json`;
        this.carts = [];
    }

    static getInstance(){
        if(!CartManagerFS.#instance){
            CartManagerFS.#instance = new CartManagerFS();
        }
        return CartManagerFS.#instance;
    }

    async addCart(){
        try {
            const response = await fs.promises.readFile(this.path, 'utf-8');
            this.carts = JSON.parse(response);
            const cart = {
                id: this.carts.length !== 0 ? this.carts[this.carts.length - 1].id + 1 : 1,
                products: []
            };
            this.carts.push(cart);

            await fs.promises.writeFile(this.path, JSON.stringify(this.carts, null, '\t'));
            return cart
        } catch (error) {
            throw error;
        }
    }

    async getCartById(id){
        try {
            const response = await fs.promises.readFile(this.path, 'utf-8');
            this.carts = JSON.parse(response);
            const cart = this.carts.find(cart => cart.id === id)

            if(!cart){
                throw new Error(`No se encontró carrito con id ${id}`);
            }
            return cart;
        } catch (error) {
            throw error;
        }
    }

    async addProductToCart(cartId, productId){
        try {
            const response = await fs.promises.readFile(this.path, 'utf-8');
            this.carts = JSON.parse(response);

            const cart = this.carts.find(cart => cart.id === cartId);
            if(!cart){
                throw new Error (`No se encontró carrito con id ${id}`);
            }
            await ProductManagerFS.getInstance().getProductById(productId);
            const product = cart.products.find(product => product.productId === productId);

            if(!product){
                cart.products.push({
                    productId: productId,
                    quantity: 1
                });
            } else {
                product.quantity++;
            }
            await fs.promises.writeFile(this.path, JSON.stringify(this.carts, null, '\t'));
            return cart;
        } catch (error) {
            throw error;
        }
    }

    async deleteProductFromCart(cartId, productId){
        try {
            const response = await fs.promises.readFile(this.path, 'utf-8');
            this.carts = JSON.parse(response);
            
            const cart = this.carts.find(cart => cart.id === cartId);
            if(!cart){
                throw new Error (`No se encontró carrito con id ${cartId}`);
            }

            const product = cart.products.find(product => product.productId === productId);
            if(!product){
                throw new Error (`No se encontró producto con id ${productId} en el carrito con id ${cartId}`);
            }
            if(product.quantity > 1){
                product.quantity--;
            } else {
                const index = cart.products.indexOf(product);
                cart.products.splice(index, 1);
            }

            await fs.promises.writeFile(this.path, JSON.stringify(this.carts, null, '\t'));
            return cart;
        } catch (error) {
            throw error;
        }
    };
}