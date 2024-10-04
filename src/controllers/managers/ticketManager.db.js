import ticketModel from "../../dao/models/ticket.model.js";

export class ticketManager {
    static #instance;

    constructor(model){
        this.ticketModel = model;
    }

    static getInstance() {
        if (!ticketManager.#instance) {
            ticketManager.#instance = new ticketManager();
        }
        return ticketManager.#instance;
    }

    async getTickets(){
        return await ticketModel.find({});
    };

    async getTicketByID(tid){
        return await ticketModel.findById({ _id: tid });
    };

    async createTicket(ticketData){
        try {
            const savedTicket = await this.ticketModel.create(ticketData); 
            console.log("Ticket guardado en la base de datos:", savedTicket);
            return savedTicket;
        } catch (error) {
            console.log("Error al guardar el ticket:", error);
            throw error; 
        }
        
    };

    async createTicketForPurchase(cart, userEmail) {
        const ticket = {
            code: `TICKET-${cart._id}`, 
            amount: cart.total, 
            purchaser: userEmail 
        };

        try {
            return await this.createTicket(ticket);
        } catch (error) {
            throw new Error('Error al crear el ticket: ' + error.message);
        }
    }
};