import userModel from "./models/user.model.js";

class UsersManager {
    constructor() {
    }

    getAll = async (limit = 0) => {
        try {
            return limit === 0 ? await usersModel.find().lean(): await userModel.find().limit(limit).lean();
        } catch (err) {
            return err.message;
        };
    };

    getById = async (id) => {
        try {
            return await userModel.findById(id).lean();
        } catch (err) {
            return err.message;
        };
    };

    getOne = async (filter) => {
        try {
            return await userModel.findOne(filter).lean();
        } catch (err) {
            return err.message;
        };
    };

    getAggregated = async (match, group, sort) => {
        try {
            return await userModel.aggregate([
                { $match: match },
                { $group: group },
                { $sort: sort }
            ]);
        } catch (err) {
            return err.message;
        };
    };

    getPaginated = async (filter, options) => {
        try {
            return await userModel.paginate(filter, options);
        } catch (err) {
            return err.message;
        };
    };

    add = async (newData) => {
        try {
            return await userModel.create(newData);
        } catch (err) {
            return err.message;
        };
    };

    update = async (filter, update, options) => {
        try {
            return await userModel.findOneAndUpdate(filter, update, options);
        } catch (err) {
            return err.message;
        };
    };

    delete = async (filter) => {
        try {
            return await userModel.findOneAndDelete(filter);
        } catch (err) {
            return err.message;
        };
    };
}

export default UsersManager;