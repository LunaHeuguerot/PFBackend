import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

mongoose.pluralize(null);

const collection = 'products'
const productSchema = new mongoose.Schema({
    
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    code: { type: String, required: true },
    status: { type: String, default: "true", required: true },
    stock: { type: Number, required: true },
    thumbnails: { type: [String], default: [] },
    category: { type: String, default: 'general', required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'users', default: '66ba7073882f29cb58f741b8', required: true }
}, { timestamps: true });

productSchema.plugin(mongoosePaginate);

const productModel = mongoose.model(collection, productSchema);

export default productModel;