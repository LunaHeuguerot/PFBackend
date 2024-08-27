import mongoose from "mongoose";
import { expect } from "chai";
import cartModel from "../../src/dao/models/cart.model.js";
import productModel from "../../src/dao/models/products.model.js";
import userModel from "../../src/dao/models/user.model.js";
import config from "../../src/services/config.js";

describe('Cart Model Tests', () => {
    let userId;
    let productId;

    before(async () => {
        await mongoose.connect(config.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        // Crear un usuario de prueba
        const user = new userModel({
            name: 'Test User',
            email: 'testuser@example.com',
            password: 'testpassword'
        });
        const savedUser = await user.save();
        userId = savedUser._id;

        // Crear un producto de prueba
        const product = new productModel({
            title: 'Test Product',
            description: 'This is a test product',
            price: 100,
            thumbnails: ['http://example.com/image.jpg'],
            code: 'TEST123',
            stock: 10,
            category: new mongoose.Types.ObjectId(),
            status: true,
            owner: userId
        });
        const savedProduct = await product.save();
        productId = savedProduct._id;
    });

    after(async () => {
        await mongoose.connection.close();
    });

    beforeEach(async () => {
        await cartModel.deleteMany({});
    });

    it('Debería crear un carrito con productos válidos', async () => {
        const cart = new cartModel({
            products: [
                {
                    productId: productId,
                    quantity: 2
                }
            ]
        });

        const savedCart = await cart.save();
        
        expect(savedCart).to.have.property('_id');
        expect(savedCart.products).to.be.an('array').that.is.not.empty;
        expect(savedCart.products[0].productId.toString()).to.equal(productId.toString());
        expect(savedCart.products[0].quantity).to.equal(2);
    });

    it('Debería requerir un productId y una cantidad en products', async () => {
        const cart = new cartModel({
            products: [
                {
                    quantity: 2
                }
            ]
        });

        try {
            await cart.save();
            throw new Error('Se esperaba un error de validación');
        } catch (err) {
            expect(err.errors).to.have.property('products.0.productId');
        }
    });

    it('Debería permitir agregar múltiples productos al carrito', async () => {
        const secondProduct = new productModel({
            title: 'Second Test Product',
            description: 'This is a second test product',
            price: 150,
            thumbnails: ['http://example.com/image2.jpg'],
            code: 'TEST124',
            stock: 5,
            category: new mongoose.Types.ObjectId(),
            status: true,
            owner: userId
        });
        const savedSecondProduct = await secondProduct.save();

        const cart = new cartModel({
            products: [
                {
                    productId: productId,
                    quantity: 2
                },
                {
                    productId: savedSecondProduct._id,
                    quantity: 1
                }
            ]
        });

        const savedCart = await cart.save();

        expect(savedCart.products).to.have.lengthOf(2);
        expect(savedCart.products[1].productId.toString()).to.equal(savedSecondProduct._id.toString());
        expect(savedCart.products[1].quantity).to.equal(1);
    });

    it('Debería eliminar productos del carrito cuando se eliminen de la base de datos', async () => {
        const cart = new cartModel({
            products: [
                {
                    productId: productId,
                    quantity: 2
                }
            ]
        });

        const savedCart = await cart.save();
        await productModel.findByIdAndDelete(productId);

        const fetchedCart = await cartModel.findById(savedCart._id);
        expect(fetchedCart.products).to.be.an('array').that.is.empty;
    });
});