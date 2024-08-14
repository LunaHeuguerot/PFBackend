import { Router } from 'express';
import mongoose from 'mongoose';
import { isAdmin } from '../services/utils.js';
import UserManager from '../controllers/managers/user.manager.db.js';
import userModel from '../dao/models/user.model.js';

const premiumRouter = Router();
const userManager = new UserManager(userModel)

premiumRouter.get('/testview', (req, res) => {
    res.render('premium', {
        title: 'Upgrade user to premium'
    });
});



premiumRouter.put('/:id', isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        console.log(id);

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).send({ error: 'Invalid ID format' });
        }

        const user = await userManager.getById(id);
        if (user.status !== 200) {
            return res.status(user.status).send({ error: user.error });
        }

        const currentRole = user.payload.role;
        const newRole = currentRole === 'user' ? 'premium' : 'user';

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

export default premiumRouter;
