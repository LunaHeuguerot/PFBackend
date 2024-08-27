import mongoose from "mongoose";
import { expect } from "chai";
import userModel from "../../src/dao/models/user.model.js";
import cartModel from "../../src/dao/models/cart.model.js";
import config from "../../src/services/config.js";

describe('User Model Tests', () => {
    let cartId;

    before(async () => {
        await mongoose.connect(config.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        // Crear un carrito de prueba
        const cart = new cartModel({});
        const savedCart = await cart.save();
        cartId = savedCart._id;
    });

    after(async () => {
        await mongoose.connection.close();
    });

    beforeEach(async () => {
        await userModel.deleteMany({});
    });

    it('Debería crear un usuario con datos válidos', async () => {
        const user = new userModel({
            first_name: 'John',
            last_name: 'Doe',
            email: 'johndoe@example.com',
            age: 30,
            password: 'securepassword',
            cart_id: cartId
        });

        const savedUser = await user.save();

        expect(savedUser).to.have.property('_id');
        expect(savedUser.first_name).to.equal('John');
        expect(savedUser.email).to.equal('johndoe@example.com');
        expect(savedUser.age).to.equal(30);
        expect(savedUser.cart_id.toString()).to.equal(cartId.toString());
    });

    it('Debería requerir un first_name', async () => {
        const user = new userModel({
            last_name: 'Doe',
            email: 'johndoe@example.com',
            age: 30,
            password: 'securepassword',
            cart_id: cartId
        });

        try {
            await user.save();
            throw new Error('Se esperaba un error de validación');
        } catch (err) {
            expect(err.errors).to.have.property('first_name');
        }
    });

    it('Debería requerir un email único', async () => {
        const user1 = new userModel({
            first_name: 'John',
            last_name: 'Doe',
            email: 'johndoe@example.com',
            age: 30,
            password: 'securepassword',
            cart_id: cartId
        });

        await user1.save();

        const user2 = new userModel({
            first_name: 'Jane',
            last_name: 'Smith',
            email: 'johndoe@example.com', // Mismo email que user1
            age: 25,
            password: 'anotherpassword',
            cart_id: cartId
        });

        try {
            await user2.save();
            throw new Error('Se esperaba un error de duplicación de email');
        } catch (err) {
            expect(err.code).to.equal(11000); // Código de error para duplicación de clave única en MongoDB
        }
    });

    it('Debería permitir asignar roles diferentes', async () => {
        const user = new userModel({
            first_name: 'Admin',
            last_name: 'User',
            email: 'admin@example.com',
            age: 40,
            password: 'adminpassword',
            role: 'admin',
            cart_id: cartId
        });

        const savedUser = await user.save();

        expect(savedUser.role).to.equal('admin');
    });

    it('Debería poblar el carrito al buscar un usuario', async () => {
        const user = new userModel({
            first_name: 'John',
            last_name: 'Doe',
            email: 'johndoe@example.com',
            age: 30,
            password: 'securepassword',
            cart_id: cartId
        });

        const savedUser = await user.save();

        const fetchedUser = await userModel.findById(savedUser._id).populate('cart_id');

        expect(fetchedUser.cart_id).to.have.property('_id');
        expect(fetchedUser.cart_id._id.toString()).to.equal(cartId.toString());
    });
});