import productModel from './models/products.model.js';

export class ProductManagerDB {
    static #instance;

    constructor(){
        this.products = [];
    }

    static getInstance(){
        if(!ProductManagerDB.#instance){
            ProductManagerDB.#instance = new ProductManagerDB();
        }

        return ProductManagerDB.#instance;
    }

    async getProducts(limit){
        try {
            this.products = await productModel.find().limit(limit).lean();
            if(!this.products){
                throw new Error('No se encontraron productos');
            }
            return this.products;
        } catch (error) {
            throw error;
        }
    }

    async getProductById(id){
        try {
            if(id.length !== 24){
                throw new Error ('El id debe tener 24 caracteres');
            }

            const product = await productModel.findById({ _id: id });
            if(!product){
                throw new Error(`No se encontró el producto con id ${id}`)
            }
            return product;
        } catch (error) {
            throw error;
        }
    }

    async addProduct(product){
        try {
            product = await productModel.create(product);
            if(!product){
                throw new Error('No se pudo crear producto');
            }
            return product;
        } catch (error) {
            if(error.code === 11000){
                throw new Error(`Ya existe un producto con código ${product.code}`);
            }
            throw error;
        }
    }

    async updateProduct(id, product){
        try {
            if(id.length !== 24){
                throw new Error('El id debe tener 24 caracteres');
            }
            product = await productModel.findByIdAndUpdate({ _id: id }, product, { new: true });
            if(!product){
                throw new Error(`No se encontró el producto con id ${id}`);
            }
            return product;
        } catch (error) {
            if(error.code === 11000){
                throw new Error(`Ya existe un producto con el código ${product.code}`);
            }
            throw error;
        }
    }

    async deleteProduct(id){
        try {
            const product = await productModel.findByIdAndDelete({ _id: id });
            if(!product){
                throw new Error(`No se encontró el producto con id ${id}`);
            }
            return product;
        } catch (error) {
            throw error;
        }
    }
}
