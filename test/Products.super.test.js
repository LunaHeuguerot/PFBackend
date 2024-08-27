import * as chai from 'chai';
import supertest from 'supertest';

const expect = chai.expect;
const requester = supertest('http://localhost:5050');
let cookieData = '';
let idProd = '';

describe('Test Integración Products con Sesiones', function () {
    
    before(async function () {

        const loginResult  = await requester.post('/api/sessions/login').send( { "email": "adminCoder@coder.com", "password": "abc445" } );
        cookieData = loginResult.headers['set-cookie'][0];

    });

    beforeEach(function () {
        this.timeout = 3000;
    });

    it('GET /api/products should return all products', async function () {
        const { _body, statusCode } = await requester.get('/api/products')        
        expect(statusCode).to.be.equals(200);
        expect(_body.payload.docs).to.be.an('array');
    });

    it('POST /api/products should add a new product', async function () {
        const newProduct = {
            title: 'Nuevo Producto',
            description: 'Descripción del producto',
            price: 100,
            code: 'UNIQUE_CODE1',
            stock: 10,
            category: 'test'
        };
        const { _body, statusCode } = await requester.post('/api/products')
            .set('Cookie', cookieData)
            .send(newProduct);
        idProd = _body.payload._id
        expect(statusCode).to.be.equals(200);
        expect(_body.payload).to.have.property('code').eql('UNIQUE_CODE1');
    });


    it('GET /api/products/:id should get a product by its id', async function () {
        const id = idProd;
        const { _body, statusCode } = await requester.get(`/api/products/${id}`)
        expect(statusCode).to.be.equals(200);
        expect(_body.payload).to.have.property('_id').eql(id);
        expect(_body.payload).to.have.property('category').eql('futsal');
    });

    it('POST /api/products should NOT add the product because of the repeated code', async function () {
        const newProduct = {
            title: 'Nuevo Producto',
            description: 'Descripción del producto',
            price: 100,
            code: 'UNIQUE_CODE1',
            stock: 10,
            category: 'test'
        };
        const { _body, statusCode } = await requester.post('/api/products')
            .set('Cookie', cookieData)
            .send(newProduct);
        expect(statusCode).to.be.equals(400);
        expect(_body.payload).to.be.an('array').eql([]);
    });

    it('PUT /api/products/:id should update a product by its id', async function () {
        const id = idProd;
        const updatedProduct = { title: 'Producto Actualizado' };
        const { _body, statusCode } = await requester.put(`/api/products/${id}`)
            .set('Cookie', cookieData)
            .send(updatedProduct);
        expect(statusCode).to.be.equals(200);
        expect(_body.payload).to.have.property('title').eql('Producto Actualizado');
        expect(_body.mensaje).to.include('fue modificado.');
    });

    it('PUT /api/products/:id should NOT update the product because the user logged is not the owner', async function () {
        const id = '664762de1edc16c5a026b218';
        const updatedProduct = { title: 'Producto Actualizado' };
        const { _body, statusCode } = await requester.put(`/api/products/${id}`)
            .set('Cookie', cookieData)
            .send(updatedProduct);
        expect(statusCode).to.be.equals(400);
        expect(_body.payload).to.be.an('array').eql([]);
        expect(_body.error).to.include('The user logged is not the owner');
    });

    it('DELETE /api/products/:id should delete a product by its id', async function () {
        const id = idProd;
        const { _body, statusCode } = await requester.delete(`/api/products/${id}`)
            .set('Cookie', cookieData)
        expect(statusCode).to.be.equals(200);
        expect(_body.payload).to.be.an('array').eql([]);
        expect(_body.mensaje).to.include('El usuario premium elimino su producto');
    });

    it('DELETE /api/products/:id should NOT delete the product because the user logged is not the owner', async function () {
        const id = '664762de1edc16c5a026b221';
        const { _body, statusCode } = await requester.delete(`/api/products/${id}`)
            .set('Cookie', cookieData)
            expect(statusCode).to.be.equals(400);
            expect(_body.payload).to.be.an('array').eql([]);
            expect(_body.error).to.include('El usuario premium logueado no es owner del producto a actualizar');
    });
});