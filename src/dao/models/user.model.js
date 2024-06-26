import mongoose from "mongoose";

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
        enum: ['admin', 'user'], 
        default: 'user' 
    },
    age: {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

const userModel = mongoose.model(usersCollection, userSchema);

export default userModel;