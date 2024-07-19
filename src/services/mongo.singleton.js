import mongoose from 'mongoose';
import config from './config.js';

export default class MongoSingleton {
    static #instance;

    constructor(){
        this.connect();
    }

    async connect() {
        await mongoose.connect(config.MONGODB_URI);
    }

    static getInstance() {
        if(!this.#instance) {
            this.#instance = new MongoSingleton();
            console.log(`Conexión bbdd CREADA. Servidor Express activo en puerto ${config.PORT}, con conexión a Mongoose: ${config.MONGODB_URI}.`);
        } else {
            console.log(`Conexión bbdd RECUPERADA. Servidor Express activo en puerto ${config.PORT}, con conexión a Mongoose: ${config.MONGODB_URI}.`);
        }

        return this.#instance;
    }
}