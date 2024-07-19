import messageModel from '../dao/models/message.model.js';

class messageController {
    constructor(){

    };

    async addMessage(newData) {
        try {
            return await messageModel.create(newData);            
        } catch (error) {
            return error.message;
        }
    };

    async getMessages() {
        try {
            return await messageModel.find().sort({ date: -1 }).lean();
        } catch (error) {
            return error.message;
        }
    }
    
};

export default messageController;
