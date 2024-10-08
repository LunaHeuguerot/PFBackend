import usersModel from '../dao/models/user.model.js'

class UserController {
    constructor() {
    }

    getOne = async (filter) => {
        try {
            return await usersModel.findOne(filter).lean();
        } catch (err) {
            return err.message;
        };
    };

    add = async (newData) => {
        try {
            return await usersModel.create(newData);
        } catch (err) {
            return err.message;
        };
    };

    updateRole = async (id, newRole) => {
        try {
            return await usersModel.findByIdAndUpdate(id, { role: newRole }, { new: true }).lean();
        } catch (err) {
            return err.message;
        }
    };
}

export default UserController;