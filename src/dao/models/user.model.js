import mongoose from "mongoose";
import cartModel from "./cart.model.js";

const usersCollection = "users";

const userSchema = new mongoose.Schema({
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    role: {
        type: String, 
        enum: ['admin', 'premium', 'user'], 
        default: 'user' 
    },
    age: {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    cart_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "carts",
    },
    last_connection: {
        type: Date,
        default: null
    }
});

userSchema.methods.updateLastConnection = function() {
    this.last_connection = new Date();
    return this.save();
};

userSchema.pre('find', function () {
    this.populate({ path: 'cart_id', model: cartModel });
});

userSchema.pre('findOne', function () {
    this.populate({ path: 'cart_id', model: cartModel });
});

const userModel = mongoose.model(usersCollection, userSchema);

export default userModel;