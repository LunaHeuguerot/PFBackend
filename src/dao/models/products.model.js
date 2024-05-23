import mongoose from "mongoose";

const productsCollection = "products";

const productSchema = new mongoose.Schema({
    title: { type: String, required: true, index: true },
    description: { type: String, required: true },
    code: { type: String, required: true, unique: true, index: true },
    price: { type: Number, required: true },
    status: { type: Boolean, required: true },
    stock: { type: Number, required: true },
    category: { type: String, required: true },
    thumbnails: { type: Array, required: true }
});

const productModel = mongoose.model(productsCollection, productSchema);

export default productModel;
