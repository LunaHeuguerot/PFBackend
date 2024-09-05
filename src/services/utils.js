import bcrypt from 'bcrypt';
import config from './config.js';
import { faker } from '@faker-js/faker';

export const createHash = password => bcrypt.hashSync(password, bcrypt.genSaltSync(10));

export const isValidPassword = (passwordToVerify, storedHash) => bcrypt.compareSync(passwordToVerify, storedHash);

export const verifyRequiredBody = (requiredFields) => {
    return (req, res, next) => {
        const allOk = requiredFields.every(field => 
            req.body.hasOwnProperty(field) && req.body[field] !== '' && req.body[field] !== null && req.body[field] !== undefined
        );

        if (!allOk) return res.status(400).send({ origin: config.SERVER, payload: 'Faltan propiedades', requiredFields });

        next();
    };
};

export const handlePolicies = policies => {
    return async (req, res, next) => {
        if(!req.session.user) return res.status(401).send({ origin: config.SERVER, payload: 'Usuario no autenticado' });

        if(policies.includes('self') && req.session.user.cart === req.param.id) return next();

        if(policies.includes(req.session.user.role)) return next();

        res.status(403).send({ origin: config.SERVER, payload: 'No tiene permisos para acceder' });
    }
};

export const createSession = (req, payload) => {
    req.session.user = payload;
    console.log('Sesión creada para el usuario:', req.session.user);
};

export const verifySession = (req, res, next) => {
    // Verificar si existe una sesión activa
    if (req.session && req.session.user) {
        console.log('Sesión verificada para el usuario:', req.session.user);
        req.user = req.session.user; // Adjuntar la información del usuario a la solicitud
        return next();
    } else {
        return res.status(401).send({ origin: config.SERVER, payload: 'Se requiere autenticación' });
    }
};

export const isAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.role === 'admin') {
        next();
    } else {
        res.status(403).send({ error: 'Access denied. Admin role required.' });
    }
};

function generateImageUrls(count) {
    let imageUrls = [];
    for (let i = 0; i < count; i++) {
        let imageUrl = faker.image.url();
        imageUrls.push(imageUrl);
    }
    return imageUrls;
}

export const generateFakeProducts = async (qty) => {
    const products = [];
    const cat = ['general', 'cat1', 'cat2'];
    for (let i = 0; i < qty; i++) {
        const _id = faker.database.mongodbObjectId();
        const title = faker.commerce.productName();
        const description = faker.commerce.productDescription();
        const price = faker.commerce.price();
        const code = faker.string.uuid();
        const stock = faker.number.int({ min: 0, max: 1000 });
        const category = cat[Math.floor(Math.random() * cat.length)];
        const status = faker.datatype.boolean(0.9);
        const thumbnail = generateImageUrls(faker.number.int({ min: 1, max: 3 })); 

        products.push({ _id, title, description, price, code, stock, category, status, thumbnail });
    }
    return products;
}




