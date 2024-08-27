import mongoose, { connect } from "mongoose";
import { expect } from "chai";
import productModel from "../../src/dao/models/products.model.js";
import config from "../../src/services/config.js";

describe('Product Model Test', () => {
    before(async () => {
        await mongoose.connect(config.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
    });

    after(async () => {
        await mongoose.connection.close()
    });

    beforeEach(async() => {
        await productModel.deleteMany({});
    });

    it('Should create a new product with valid data', async() => {
        const product = new productModel({
            title: 'Test Product',
            description: 'This is a test product',
            price: 100,
            thumbnails: ['http://example.com/image.jpg'],
            code: 'TEST123',
            stock: 10,
            category: new mongoose.Types.ObjectId(),
            status: true,
            owner: 'admin'
        });

        const savedProduct = await product.save();
        
        expect(savedProduct).to.have.property('_id');
        expect(savedProduct.title).to.equal('Test Product');
        expect(savedProduct.price).to.equal(100);
        expect(savedProduct.thumbnails).to.include('http://example.com/image.jpg');
    });

    it('Debería requerir un título', async () => {
        const product = new productModel({
            description: 'This is a test product',
            price: 100,
            code: 'TEST123',
            stock: 10,
            category: new mongoose.Types.ObjectId(),
            status: true,
            owner: 'admin'
        });

        try {
            await product.save();
            throw new Error('Se esperaba un error de validación');
        } catch (err) {
            expect(err.errors).to.have.property('title');
        }
    });

    it('Debería requerir un precio positivo', async () => {
        const product = new productModel({
            title: 'Test Product',
            description: 'This is a test product',
            price: -10,  // Precio inválido
            code: 'TEST123',
            stock: 10,
            category: new mongoose.Types.ObjectId(),
            status: true,
            owner: 'admin'
        });

        try {
            await product.save();
            throw new Error('Se esperaba un error de validación');
        } catch (err) {
            expect(err.errors).to.have.property('price');
        }
    });
    
    it('Debería requerir un código único', async () => {
        const product1 = new productModel({
            title: 'Test Product 1',
            description: 'This is a test product 1',
            price: 100,
            code: 'UNIQUECODE',
            stock: 10,
            category: new mongoose.Types.ObjectId(),
            status: true,
            owner: 'admin'
        });

        const product2 = new productModel({
            title: 'Test Product 2',
            description: 'This is a test product 2',
            price: 200,
            code: 'UNIQUECODE',  
            stock: 20,
            category: new mongoose.Types.ObjectId(),
            status: true,
            owner: 'admin'
        });

        await product1.save();

        try {
            await product2.save();
            throw new Error('Se esperaba un error de validación');
        } catch (err) {
            expect(err).to.have.property('code', 11000);  // Código de error de MongoDB para clave duplicada
        }
    });
})