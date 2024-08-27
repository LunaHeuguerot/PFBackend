import Assert from 'assert';
import mongoose from 'mongoose';
import UserController from '../src/controllers/user.controller.js';
import config from '../src/services/config.js';

const connection = await mongoose.connect(config.MONGODB_URI);
const dao = new UserController();
const assert = Assert.strict;
const testProd = { title: 'Producto Nuevo Test', description: 'Este es un producto agregado en Test', price: 230, code: 'abc445', stock: 25, category: 'f11' };
const testUserUser = { first_name: 'Luna', last_name: 'Heuguerot', email: 'dblunah@gmail.com', password: 'Test1234', role: 'admin' };
const testUserPremium = { first_name: 'Luna', last_name: 'Heuguerot', email: 'dblunah@gmail.com', password: 'Test1234', role: 'admin' };

describe('Test Products DAO', function() {
    before(function () {
        mongoose.connection.collections.products.drop();
        this.timeout = 5000;
    });

    beforeEach(function () {});
    after(function () {});
    afterEach(function () {});

    it('add() should return a new product', async function () {
        const result = await dao.add(testProd, testUserPremium);
        assert.strictEqual(typeof(result), 'object');
        assert.ok(result._id);
        assert.deepStrictEqual(result.thumbnail, []);
    });

    it('add() should return 1', async function () {
        const result = await dao.add(testProd,testUserPremium);
        assert.strictEqual(typeof(result), 'number');
        assert.strictEqual(result, 1);
    });

    it('getPaginated() should return an array of products', async function () {
        const result = await dao.getPaginated(10,1);
        assert.strictEqual(typeof(result), 'object');
        assert.strictEqual(Array.isArray(result.docs), true);
    });

    it('getOne() should return a filtered product', async function () {
        const result = await dao.getOne( { code: testProd.code } );
        assert.strictEqual(typeof(result), 'object');
        assert.ok(result._id);
        assert.deepStrictEqual(result.thumbnail, []);
    });

    it('update() should return a [0] once the product s code is updated', async function () {
        const prodUpdate = await dao.getOne( { code: testProd.code } );
        const result = await dao.update( prodUpdate._id, { code: 'QWERTY-987456' }, testUserPremium );
        assert.strictEqual(typeof(result), 'number');
        assert.strictEqual(result, 0);
    });

    it('updateProduct() should return a  [2] because the user cannot update the product', async function () {
        const prodUpdate = await dao.getOne( { code: 'QWERTY-987456' } );
        const result = await dao.update( prodUpdate._id, { code: 'QWERTY-123456' }, testUserUser );
        assert.strictEqual(typeof(result), 'number');
        assert.strictEqual(result, 2);
    });

    it('deleteProduct() should return a [3] because the user cannot delete the product', async function () {
        const prodUpdate = await dao.getOne( { code: 'QWERTY-987456' } );
        const result = await dao.delete( prodUpdate._id, testUserUser  );
        assert.strictEqual(typeof(result), 'number');
        assert.strictEqual(result, 3);
    });

    it('deleteProduct() should return a [2] because the user can delete the product', async function () {
        const prodUpdate = await dao.getOne( { code: 'QWERTY-987456' } );
        const result = await dao.delete( prodUpdate._id, testUserPremium  );
        assert.strictEqual(typeof(result), 'number');
        assert.strictEqual(result, 2);
    });
});