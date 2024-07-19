import productsModel from '../dao/models/products.model.js';

class ProductsController {
    constructor() {
    }

    add = async (newData) => {
        try {
            return await productsModel.create(newData);
        } catch (err) {
            return err.message;
        };
    };

    getPaginated = async (queryFilter , options) => {
        try {     
            return await productsModel.paginate( queryFilter , options );
        } catch (err) {
            return err.message;
        };
    };

    getOne = async (filter) => {
        try {
            return await productsModel.findOne(filter).lean();
        } catch (err) {
            return err.message;
        };
    };

    update = async (id, prodU) => {
        try {
            return await productsModel.findOneAndUpdate( { _id: id }, prodU, { new: true } );
        } catch (err) {
            return err.message;
        };
    };

    delete = async (filter) => {
        try {
            return await productsModel.findOneAndDelete(filter);
        } catch (err) {
            return err.message;
        };
    };
}

export default ProductsController;