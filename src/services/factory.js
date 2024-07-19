import config from "./config.js";
import MongoSingleton from "./mongo.singleton.js";

let User, Product, Cart, Ticket;

switch (config.PERSISTENCE){
    case 'FS':
        console.log('FS Persistence');
        break;
    case 'MONGO':
        MongoSingleton.connect(config.MONGODB_URI);
        User = require('../controllers/user.manager.db.js');
        Product = require('../controllers/productsManager.db.js');
        Cart = require('../controllers/cartsManager.db.js');
        Ticket = require('../controllers/managers/ticketManager.db.js');  
};

module.exports = {
    User,
    Product,
    Cart, 
    Ticket
}
