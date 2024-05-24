import { Router } from 'express';
import mongoose from 'mongoose';
import userModel from '../../dao/models/user.model.js';

const userRouter = Router();

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

export default userRouter;