import messageController from "../message.controller.js";

class messageManager {
    constructor(){

    };

    async saveMessage(data){
        try {
            const process = await messageController.addMessage(data);
            return process;
        } catch (error) {
            console.log('ERR adding message');
            throw error;
        }
    };

    async getMessages(){
        try {
            const messages = await messageController.getMessages();
            return messages;
        } catch (error) {
            console.log('ERR getting messages');
            throw error;
        }
    };
};

export default messageManager;