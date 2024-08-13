import { Router } from 'express';
import mongoose from 'mongoose';
import userModel from '../dao/models/user.model.js';
import UserManager from '../controllers/managers/user.manager.db.js';
import { createHash, verifyRequiredBody, isAdmin } from '../services/utils.js';

const userRouter = Router();

const userManager = new UserManager();

userRouter.get('/', async(req, res) => {
    try {
        const users = await userModel.find().lean();
        res.status(200).send({ status: 200, payload: users });
    } catch (error) {
        console.error("Error en la consulta:", error);
        res.status(500).send({ error: "Error al obtener usuarios" });
    }
});

userRouter.get('/:id', async(req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).send({ error: 'Invalid ID format' });
        }
        const user = await userModel.findById(id).lean();
        if (user) {
            res.send(user);
        } else {
            res.status(404).send({ error: 'User not found' });
        }
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

userRouter.post('/create', async(req, res) => {
    console.log('Datos recibidos:', req.body);

    const { firstName, lastName, email, password, role } = req.body;

    if (!firstName || !lastName || !email || !password) {
        return res.status(400).send({ error: 'Todos los campos requeridos deben estar presentes.' });
    }

    try {
        const newUser = new userModel({
            firstName,
            lastName,
            email,
            password,
            role: role || 'user'
        });
        const addedUser = await newUser.save();
        res.status(201).send(addedUser);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

userRouter.post('/', verifyRequiredBody(['firstName', 'lastName', 'email', 'age', 'password']), async (req, res) => {

    try {
        const { firstName, lastName, email, password, age } = req.body;
        const foundUser = await UserManager.getOne(email);

        if (!foundUser) {
            const process = await UserManager.add({ firstName, lastName, email, age, password: createHash(password)});
            res.status(200).send({ origin: config.SERVER, payload: process });
        } else {
            res.status(400).send({ origin: config.SERVER, payload: 'El email ya se encuentra registrado' });
        }
    } catch (err) {
        res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
    }
});

userRouter.put('/:id', async(req, res) => {
    try {
        const userId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).send({ error: 'Invalid ID format' });
        }
        const updatedUser = req.body;
        const result = await userModel.findByIdAndUpdate(userId, updatedUser, { new: true });
        if (result) {
            res.send(result);
        } else {
            res.status(404).send({ error: 'User not found' });
        }
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

userRouter.delete('/:id', async(req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).send({ error: 'ID de usuario no válido' });
        }

        const process = await userModel.findByIdAndDelete(id);

        if (!process) {
            return res.status(404).send({ error: 'Usuario no encontrado' });
        }

        res.status(200).send({ payload: process });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

userRouter.get('/aggregate/:role', async (req, res) => {
    try {
        if (req.params.role === 'admin' || req.params.role === 'user') {
            const match = { role: req.params.role };
            const sort = { lastName: 1 };
            const process = await userManager.getAggregated(match, sort);

            res.status(200).send({ origin: config.SERVER, payload: process });
        } else {
            res.status(200).send({ origin: config.SERVER, payload: null, error: 'role: solo se acepta admin o user' });
        }
    } catch (err) {
        res.status(500).send({ origin: config.SERVER, payload: null, error: err.message }); 
    }
});

userRouter.get('/paginate/:page/:limit', async (req, res) => {
    try {
        const filter = { role: 'admin' };
        const options = { page: req.params.page, limit: req.params.limit, sort: { lastName: 1 } };
        const process = await userManager.getPaginated(filter, options);

        res.status(200).send({ origin: config.SERVER, payload: process });
    } catch (err) {
        res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
    }
});

userRouter.get('/current', async (req, res) => {
    try {
        if(req.session.user) {
            const userFiltered = await userManager.UsersDTO(req.session.user);
            res.status(200).send({ status: 'OK', payload: userFiltered });
        } else {
            res.status(400).send({ status: 'ERR', payload: [] });
        }
    } catch (error) {
        res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
    }
});

// userRouter.get('/premium', (req, res) => {
//     res.render('premium', {
//         title: 'Update User Role'
//     })
// })

userRouter.put('/premium/:id', isAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).send({ error: 'Invalid ID format' });
        }

        // Obtener el usuario por ID
        const user = await userManager.getById(id);
        if (user.status !== 200) {
            return res.status(user.status).send({ error: user.error });
        }

        const currentRole = user.payload.role;
        const newRole = currentRole === 'user' ? 'premium' : 'user';

        // Actualizar el rol del usuario
        const result = await userManager.updateRole(id, newRole);

        if (result.status === 200) {
            return res.status(200).send({ message: `User role updated to: ${newRole}` });
        } else {
            return res.status(result.status).send({ error: result.error });
        }
    } catch (error) {
        console.error(`Error in /premium/:id route: ${error.message}`);
        return res.status(500).send({ error: error.message });
    }
});







export default userRouter;