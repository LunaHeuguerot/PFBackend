import * as chai from 'chai'; 
import supertest from 'supertest';

const expect = chai.expect;
const requester = supertest('http://localhost:5050');
let cookieData = '';
let idProd = '';

describe('Test Integración Sessions con Sesiones', function () {
    
    before(async function () {
        const loginResult  = await requester.post('/api/sessions/login').send( { "email": "dblunah@gmail.com", "password": "Test1234" } );
        cookieData = loginResult.headers['set-cookie'][0];
    });

    beforeEach(function () {
        this.timeout = 3000;
    });

    it('GET /api/sessions/hash/:password should return the password hashed', async function () {
        const pass = 'pepe1';
        const { _body, statusCode } = await requester.get(`/api/sessions/hash/${pass}`);
        expect(statusCode).to.be.equals(200);
        expect(_body).to.have.property('payload');
    });

    it('POST /api/sessions/login should NOT login because of invalid data', async function () {
        const { _body, statusCode } = await requester.post('/api/sessions/login').send( { "email": "pepe@gmail.com", "password": "zzz445" } );    
        expect(statusCode).to.be.equals(401);
        expect(_body).to.have.property('payload');
        expect(_body.payload).to.include('Datos de acceso no válidos');
    }); 
});