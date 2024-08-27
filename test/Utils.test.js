import * as chai from 'chai'; 
import { createHash, isValidPassword } from '../src/services/utils.js';

const expect = chai.expect;
const testPassword = 'abc123';
const validBcryptFormat = /^\$2[aby]\$10\$.{53}$/;

describe('Tests Utils', function () {
    before(function () {});
    beforeEach(function () {});
    after(function () {});
    afterEach(function () {});

    it('createHash() should hash the password', function () {
        const result = createHash(testPassword);  
        expect(result).to.match(validBcryptFormat);
    });

    it('isValidPassword() should return true if the hash matches', function () {
        const hashed = createHash(testPassword); 
        const result = isValidPassword(testPassword, hashed); 
        expect(result).to.be.true;
    });

    it('isValidPassword() should return false if the hash does NOT match', function () {
        let hashed = createHash(testPassword); 
        hashed = 'what_ever';
        const result = isValidPassword(testPassword, hashed);  
        expect(result).to.be.false;
    });
});
