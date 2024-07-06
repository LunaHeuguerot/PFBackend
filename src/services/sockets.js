import { Server } from 'socket.io';
import { ProductManagerDB } from '../controllers/productsManager.db.js';
import messageModel from '../dao/models/chat.model.js';

const initSocket = (httpServer) => {
    const io = new Server(httpServer);

    io.on('connection', async (client) => {
        console.log(`Cliente conectado, id ${client.id} desde ${client.handshake.address}`);
        
        messageModel.find().sort({ createdAt: 1 }).then(Message => {
            client.emit('chatLog', Message);
        }).catch(error => {
            console.error('Error al obtener el historial de mensajes:', error);
        });
    
        client.on('newMessage', async (data) => {
            try {
                const newMessage = new messageModel({ user: data.user, message: data.message });
                await newMessage.save();
                io.emit('messageArrived', newMessage);
            } catch (error) {
                console.error('Error al guardar el nuevo mensaje:', error);
            }
        });

        client.on('new-product', async (newProduct) => {
            try {
                const newProd = {
                    title: newProduct.title,
                    description: newProduct.description,
                    code: newProduct.code,
                    price: newProduct.price,
                    status: newProduct.status,
                    stock: newProduct.stock,
                    category: newProduct.category,
                    thumbnail: newProduct.thumbnail,
                };
    
                await ProductManagerDB.getInstance().addProduct(newProd);
                const updatedList = await ProductManagerDB.getInstance().getProducts();
                io.emit('products', updatedList);
                io.emit('response', { status: 'success', message: 'Product added successfully' });
            } catch (error) {
                io.emit('response', { status: 'error', message: error.message });
            }
        });
    
        client.on('delete-product', async (id) => {
            try {
                await ProductManagerDB.getInstance().deleteProduct(id);
                const updatedList = await ProductManagerDB.getInstance().getProducts();
                io.emit('products', updatedList);
                io.emit('response', { status: 'success', message: `Product with id ${id} successfully deleted` });
            } catch (error) {
                io.emit('response', { status: 'error', message: error.message });
            }
        });
    });

    return io;
};

export default initSocket;
