import mongoose from 'mongoose';
import userModel from '../dao/models/user.model.js';
import { createHash } from './utils.js';
import config from './config.js';

async function hashPasswords() {
    await mongoose.connect(config.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    const users = await userModel.find();
    for (let user of users) {
        if (!user.password.startsWith('$2b$')) { 
            const hashedPassword = createHash(user.password);
            user.password = hashedPassword;
            await user.save();
        }
    }
    console.log("Passwords hashed successfully");
    mongoose.disconnect();
}

hashPasswords().catch(console.error);
