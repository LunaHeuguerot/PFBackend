import express from 'express';
import userModel from '../../dao/models/user.model.js';

const router = express.Router();

router.post('/register', async(req, res) => {
    try {
        const { first_name, last_name, email, age, password } = req.body;

        if(!first_name || !last_name || !email || !age || !password) {
            throw new Error('Faltan campos obligatorios')
        }

        const user = await userModel.findOne({ email });

        if(user) {
            console.log('User found');
            return res.status(401).send({ status: error, message: 'This mail is already registered'});
        }

        let role = 'user';

        await userModel.create({ first_name, last_name, email, age, password, role });

        res.status(200).send({ status: 'success', message: 'User created successfully'});
    } catch (error) {
        res.status(500).send({ status: 'error', message: `Error at singing up ${error}`});
    }
});

router.post('/login', async(req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            throw new Error('Faltan campos obligatorios');
        }
        if (email === 'adminCoder@coder.com' && password === 'adminCod3r123') {
            req.session = req.session || {}; 
            req.session.user = { first_name: 'Admin', role: 'admin' };
        } else {
            const user = await userModel.findOne({ email, password });
            if (!user) {
                throw new Error('Usuario o contraseña incorrectos');
            }
            req.session = req.session || {};
            req.session.user = { first_name: user.first_name, last_name: user.last_name, email: user.email, age: user.age, role: 'user' };
        }
        res.redirect('/products');
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.get('/logout', async(req, res) => {
    req.session.destroy((error) => {
        if (error) return res.send({ status: "error", error: error });
        else res.send({ status: "success" });
      });
});

export default router;