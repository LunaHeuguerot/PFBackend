import chai from "chai";
import mongoose from "mongoose";
import chaiHttp from "chai-http";
import config from "../../src/services/config.js";
import userModel from "../../src/dao/models/user.model.js";
import app from "../../src/app.js";

const expect = chai.expect;
chai.use(chaiHttp);

describe('User Routes Tests', () => {
    before(async () => {
        await mongoose.connect(config.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
    });

    after(async () => {
        await mongoose.connection.close();
    });

    beforeEach(async () => {
        await userModel.deleteMany({});
    });

    it('should create a user successfully', async () => {
        const res = await chai.request(app)
            .post('/api/user/create')
            .send({
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                password: 'password123',
                role: 'user'
            });

        expect(res).to.have.status(201);
        expect(res.body).to.have.property('_id');
        expect(res.body.email).to.equal('john.doe@example.com');
    });

    it('should fail to create a user with missing fields', async () => {
        const res = await chai.request(app)
            .post('/api/user/create')
            .send({
                firstName: 'John',
                email: 'john.doe@example.com'
            });

        expect(res).to.have.status(400);
        expect(res.body).to.have.property('error');
    });

    it('should get a user by ID', async () => {
        const newUser = new userModel({
            firstName: 'Jane',
            lastName: 'Doe',
            email: 'jane.doe@example.com',
            password: 'password123',
            role: 'user'
        });
        const savedUser = await newUser.save();

        const res = await chai.request(app)
            .get(`/api/user/${savedUser._id}`);

        expect(res).to.have.status(200);
        expect(res.body.email).to.equal('jane.doe@example.com');
    });

    it('should return 404 for non-existent user', async () => {
        const res = await chai.request(app)
            .get(`/api/user/${mongoose.Types.ObjectId()}`);

        expect(res).to.have.status(404);
        expect(res.body).to.have.property('error', 'User not found');
    });
});