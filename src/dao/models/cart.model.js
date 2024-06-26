import mongoose from 'mongoose';
import userModel from './user.model.js';

const cartsCollection = 'carts';

const cartSchema = new mongoose.Schema({
    products: {
        type: [
            {
                productId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'products',
                    required: true,
                },
                quantity: {
                    type: Number,
                    required: true,
                },
            },
        ],
        default: [],
    }
});

cartSchema.pre('findOne', function(next) {
    this.populate({ path: '_user_id', model: usersModel });
    this.populate('products.productId');
    next();
});

const cartModel = mongoose.model(cartsCollection, cartSchema);

export default cartModel;