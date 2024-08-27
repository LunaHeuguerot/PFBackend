import chai from "chai";
import chaiHttp from "chai-http";
import app from "../../src/app.js";
import mongoose from "mongoose";
import config from "../../src/services/config.js";

const expect = chai.expect;
chai.use(chaiHttp);

describe('Products Routes', function() {
    before(async function() {
        await mongoose.connect(config.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
    });

    after(async function() {
        await mongoose.connection.close();
    });

    it('should get all products', function(done) {
        chai.request(app)
            .get('/api/products')
            .end(function(err, res) {
                if (err) return done(err);
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('status').eql('Ok');
                expect(res.body.payload).to.be.an('array');
                done();
            });
    });

    it('should not allow unauthorized access to create a product', function(done) {
        chai.request(app)
            .post('/api/products')
            .send({
                title: 'New Product',
                description: 'Description for new product',
                price: 100,
                code: 'NEWPROD123',
                stock: 20,
                category: 'CategoryIdHere',
            })
            .end(function(err, res) {
                if (err) return done(err);
                expect(res).to.have.status(403);
                expect(res.body).to.have.property('status').eql('Not Ok');
                done();
            });
    });

    it('should allow admin to delete a product', function(done) {
        chai.request(app)
            .delete('/api/products/validProductIdHere') 
            .end(function(err, res) {
                if (err) return done(err);
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('status').eql('Ok');
                done();
            });
    });
});
