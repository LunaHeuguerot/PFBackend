import * as chai from 'chai';
import supertest from 'supertest';

const expect = chai.expect;
const requester = supertest('http://localhost:5050');
let cookieData = '';
let idCart = '';

describe('Test Integración Carts con Sesiones', function () {
    
    before(async function () {
        this.timeout(5000);
        const loginResult  = await requester.post('/').send( { "email": "dblunah@gmail.com", "password": "Test1234" } );
        cookieData = loginResult.headers['set-cookie'][0];
    });

    beforeEach(function () {
        this.timeout = 3000;
    });

    it('POST /api/carts should create a new cart', async function () {
        const { _body, statusCode } = await requester.post('/api/carts');
        idCart = _body.payload._id;
        expect(statusCode).to.be.equals(200);
        expect(_body.payload).to.have.property('_id').eql(idCart);
        expect(_body.payload).to.have.property('products').eql([]);
        expect(_body).to.have.property('status').eql('Ok');
    });

    it('GET /api/carts/:id should return a cart by its id', async function () {
        const id = idCart;
        const { _body, statusCode } = await requester.get(`/api/carts/${id}`)
        expect(statusCode).to.be.equals(200);
        expect(_body.payload).to.have.property('_id').eql(id);
        expect(_body.payload).to.have.property('products').eql([]);
        expect(_body).to.have.property('status').eql('Ok');
    });

    it('GET /api/carts/:id NO should NOT return a cart because the id given is NOT valid', async function () {
        const { _body, statusCode } = await requester.get(`/api/carts/66556655`)
        expect(statusCode).to.be.equals(400);
        expect(_body.payload).eql('');
        expect(_body).to.have.property('error');
    });

    it('POST /api/carts/:cid/product/:pid should add a new product to a cart', async function () {
        const id = '664ffecc837b4cb4d336ef52'; //Id de un cart de ese usuario.
        const pid = '664762de1edc16c5a026b221'; //Id de un producto valido que no es de este usuario.
        const { _body, statusCode } = await requester.post(`/api/carts/${id}/product/${pid}`)
            .set('Cookie', cookieData)
        expect(statusCode).to.be.equals(200);
        expect(_body.payload).eql(4);
        expect(_body.mensaje).to.include('Se agrego el producto');
    });


    it('POST /api/carts/:cid/product/:pid should NOT add the product because the user logged is the owner', async function () {
        const id = '664ffecc837b4cb4d336ef52'; //Id de un cart de ese usuario.
        const pid = '66ce3b6d435788ac5f0df358'; //Id de un producto valido que es de este usuario.
        const { _body, statusCode } = await requester.post(`/api/carts/${id}/product/${pid}`)
            .set('Cookie', cookieData)
        expect(statusCode).to.be.equals(400);
        expect(_body.payload).eql([]);
        expect(_body.error).to.include('El user es owner del producto');
    });

    it('PUT /api/carts/:cid should update the cart with the body´s products', async function () {
        const id = '664ffecc837b4cb4d336ef52'; //Id de un cart de ese usuario.
        const Products = [ { "_id": "664762de1edc16c5a026b219", "quantity": 3 } ]
        const { _body, statusCode } = await requester.put(`/api/carts/${id}`)
            .set('Cookie', cookieData)
            .send(Products);
        expect(statusCode).to.be.equals(200);
        expect(_body.payload).eql(1);
        expect(_body.mensaje).to.include('Se modifico el carrito');
    });

    it('PUT /api/carts/:cid/product/:pid should edit the quantity of the product in the cart', async function () {
        const id = '664ffecc837b4cb4d336ef52'; //Id de un cart de ese usuario.
        const pid = '664762de1edc16c5a026b219'; //Id de un producto valido que es de este usuario.
        const cant = { "quantity": 10 }
        const { _body, statusCode } = await requester.put(`/api/carts/${id}/product/${pid}`)
            .set('Cookie', cookieData)
            .send(cant);
        expect(statusCode).to.be.equals(200);
        expect(_body.payload).eql(2);
        expect(_body.mensaje).to.include(`Se actualizo a ${cant.quantity} la cantidad del producto`);
    });

    it('DELETE /api/carts/:cid/product/:pid should delete the product in the cart', async function () {
        const id = '664ffecc837b4cb4d336ef52'; //Id de un cart de ese usuario.
        const pid = '664762de1edc16c5a026b219'; //Id de un producto valido que es de este usuario.
        const { _body, statusCode } = await requester.delete(`/api/carts/${id}/product/${pid}`)
            .set('Cookie', cookieData)
        expect(statusCode).to.be.equals(200);
        expect(_body.payload).eql(2);
        expect(_body.mensaje).to.include(`Se elimino el producto`);
    });

    it('DELETE /api/carts/:cid should empty the cart', async function () {
        const id = '664ffecc837b4cb4d336ef52'; //Id de un cart de ese usuario.
        const { _body, statusCode } = await requester.delete(`/api/carts/${id}`)
            .set('Cookie', cookieData)
        expect(statusCode).to.be.equals(200);
        expect(_body.payload).eql([]);
        expect(_body.mensaje).to.include(`Se vacio correctamente el carrito con id ${id}. OK`);
    });
});