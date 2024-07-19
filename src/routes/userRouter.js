import { Router } from 'express';
import UserManager from '../controllers/user.controller.js';
import { handlePolicies, verifySession, verifyRequiredBody, createHash } from '../services/utils.js';
import config from '../services/config.js';

const userRouter = Router();

// userRouter.param('id', async (req, res, next, id) => {
//     if (!config.MONGODB_ID_REGEX.test(req.params.id)) {
//         return res.status(400).send({ origin: config.SERVER, payload: null, error: 'Id no válido' });
//     }
//     next();
// })

// userRouter.get('/', getUsers);
// userRouter.get('/:id', getUserById);

// userRouter.post('/create', verifyRequiredBody(['firstName', 'lastName', 'email', 'password']), createUser);

// userRouter.put('/:id', verifySession, handlePolicies(['admin']), updateUser);
// userRouter.delete('/:id', verifySession, handlePolicies(['admin']), deleteUser);
// userRouter.get('/aggregate/:role', verifySession, handlePolicies(['admin']), aggregateUsers);
// userRouter.get('/paginate/:page/:limit', verifySession, paginateUsers);

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

export default userRouter;