import productModel from '../../dao/models/products.model.js';
import { errorsDictionary } from '../../services/config.js';

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

    async getProducts(req){
        let limit = req.query.limit ? parseInt(req.query.limit) : 10;
        const page = req.query.page ? parseInt(req.query.page) : 1;
        const status = req.query.status ? req.query.status : null;
        const category = req.query.category ? req.query.category : null;
        let sort = req.query.sort;
        
        if(limit > 10) {
            limit = 10;
        };
        
        const filter = {};
        if(status) {
            filter.status = status;
        };
        if(category) {
            filter.category = category;
        };
        if(sort === 'asc' || sort === 'desc' ) {
            sort= { price: sort };
        } else {
            sort = null;
        };

        try {
            const products = await productModel.paginate(filter, { limit, page, sort, lean: true });
            products.prevLink = products.page > 1 ? `products?page=${products.page - 1}` : null;
            products.nextLink = products.page < products.totalPages ? `products?page=${products.page + 1}` : null;

            return products;
        } catch (error) {
            return { status: 500, origin: 'DAO', payload: { error: errorsDictionary.UNHANDLED_ERROR } };
        };
    }

    async getProductById(id){
        try {
            if(id.length !== 24){
                return { status: 400, origin: 'DAO', payload: { error: errorsDictionary.INVALID_MONGOID_FORMAT } };
            }

            const product = await productModel.findById({ _id: id });
            if(!product){
                return { status: 404, origin: 'DAO', payload: { error: errorsDictionary.ID_NOT_FOUND } };
            }
            return product;
        } catch (error) {
            return { status: 500, origin: 'DAO', payload: { error: errorsDictionary.UNHANDLED_ERROR } };
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
            return { status: 500, origin: 'DAO', payload: { error: errorsDictionary.RECORD_CREATION_ERROR } };
        }
    }

    async updateProduct(id, product){
        try {
            if(id.length !== 24){
                return { status: 400, origin: 'DAO', payload: { error: errorsDictionary.INVALID_MONGOID_FORMAT } };
            }
            product = await productModel.findByIdAndUpdate({ _id: id }, product, { new: true });
            if(!product){
                return { status: 404, origin: 'DAO', payload: { error: errorsDictionary.ID_NOT_FOUND } };
            }
            return product;
        } catch (error) {
            if(error.code === 11000){
                throw new Error(`Ya existe un producto con el código ${product.code}`);
            }
            return { status: 500, origin: 'DAO', payload: { error: errorsDictionary.UNHANDLED_ERROR } };
        }
    }

    async deleteProduct(id){
        try {
            const product = await productModel.findByIdAndDelete({ _id: id });
            if(!product){
                return { status: 400, origin: 'DAO', payload: { error: errorsDictionary.INVALID_MONGOID_FORMAT } };
            }
            return product;
        } catch (error) {
            return { status: 500, origin: 'DAO', payload: { error: errorsDictionary.UNHANDLED_ERROR } };
        }
    }

    async paginateProds({ limit = 10, page = 1, query = {}, sort = {} }) {
        try {
            const options = {
                page: parseInt(page, 10),
                limit: parseInt(limit, 10),
                sort: sort
            };
            const result = await productModel.paginate(query, options);
            
            return { status: 200, origin: 'DAO', payload: result };
        } catch (error) {
            return { status: 500, origin: 'DAO', payload: { error: errorsDictionary.UNHANDLED_ERROR } };
        }
    }
}
