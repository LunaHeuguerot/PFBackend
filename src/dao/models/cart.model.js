import mongoose from 'mongoose';
import userModel from './user.model.js';
import productModel from './products.model.js';

const cartsCollection = 'carts';

const cartSchema = new mongoose.Schema({
    products: {
        type: [
            {
                productId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'products',
                    required: true
                },
                productCode: {  
                    type: String,
                    required: true
                },
                quantity: {
                    type: Number,
                    default: 1,
                    required: true,
                },
            },
        ],
        default: [],
    }
});

cartSchema.methods.findProductByCode = function (productCode) {
    return this.products.find(product => product.productCode === productCode);
};

cartSchema.methods.updateProductQuantity = async function (productCode, quantity) {
    const product = this.findProductByCode(productCode);
    if (product) {
        product.quantity = quantity;
        await this.save(); 
    } else {
        throw new Error('Producto no encontrado en el carrito');
    }
};

cartSchema.pre('find', function () {
    this.populate({ path: '_user_id', model: userModel });
    this.populate({ path: 'products.productId', model: productModel });  
});

cartSchema.pre('findOne', function(next) {
    this.populate({ path: '_user_id', model: userModel });
    this.populate({ path: 'products.productId', model: productModel });  
    next();
});


const cartModel = mongoose.model(cartsCollection, cartSchema);

export default cartModel;