import mongoose from "mongoose";

mongoose.pluralize(null);

const collection = 'message';

const messageSchema = new mongoose.Schema({
    user: { 
        type: String,
        require: true
    },
    message: {
        type: String,
        require: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const messageModel = mongoose.model(collection, messageSchema);

export default messageModel;