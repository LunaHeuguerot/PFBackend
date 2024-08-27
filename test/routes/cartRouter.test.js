import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../../src/app.js';
import mongoose from 'mongoose';

const expect = chai.expect;
chai.use(chaiHttp);

describe('Cart API', () => {
    let cartId = ''; 
    let productId = '';

    before(async function() {
        await mongoose.connect(config.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
    });

    after(async () => {
        // Limpiar la base de datos si es necesario después de todos los tests.
        // await mongoose.connection.db.dropDatabase();
        await mongoose.connection.close();
    });

    it('Debe crear un carrito nuevo', (done) => {
        chai.request(app)
            .post('/api/carts')
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('status', 'Ok');
                cartId = res.body.payload._id; // Guardar el ID del carrito creado
                done();
            });
    });

    it('Debe obtener un carrito por ID', (done) => {
        chai.request(app)
            .get(`/api/carts/${cartId}`)
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('status', 'Ok');
                expect(res.body.payload).to.have.property('_id', cartId);
                done();
            });
    });

    it('Debe agregar un producto al carrito', (done) => {
        chai.request(app)
            .post(`/api/carts/${cartId}/product/${productId}`)
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('status', 'Ok');
                done();
            });
    });

    it('Debe eliminar un producto del carrito', (done) => {
        chai.request(app)
            .delete(`/api/carts/${cartId}/product/${productId}`)
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('status', 'Ok');
                done();
            });
    });

    it('Debe actualizar el carrito con un array de productos', (done) => {
        chai.request(app)
            .put(`/api/carts/${cartId}`)
            .send([{ productId, quantity: 3 }])
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('status', 'Ok');
                done();
            });
    });

    it('Debe eliminar un carrito', (done) => {
        chai.request(app)
            .delete(`/api/carts/${cartId}`)
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('status', 'Ok');
                done();
            });
    });
});
