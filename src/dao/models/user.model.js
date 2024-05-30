import mongoose from "mongoose";

const userCollection = 'user';

const userSchema = new mongoose.Schema({
    first_name: { type: String, require: true },
    last_name: { type: String, require: true },
    email: { type: String, require: true },
    age: { type: Number, require: true },
    password: { type: String, require: true }
});

const userModel = mongoose.model(userCollection, userSchema);

export default userModel;