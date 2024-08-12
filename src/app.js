import express from 'express';
import config from './services/config.js';
// import productsRouter from './routes/products.routes.js';
// import cartsRouter from './routes/carts.routes.js';
import chatRouter from './routes/chat.routes.js';
import viewsRouter from './routes/views.routes.js';
import handlebars from 'express-handlebars';
import mongoose from 'mongoose';
import initSocket from './services/sockets.js';
import MongoStore from 'connect-mongo';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import sessionRouter from './routes/session.router.js';
import profileRouter from './routes/profile.routes.js';
import passport from 'passport';
import initAuthStrategies from './auth/passport.strategies.js';
import cookieRouter from './routes/cookie.routes.js';
import dotenv from 'dotenv';
import cartRouter from './routes/cartRouter.js';
import productsRouter from './routes/productsRoutes.js';
import userRouter from './routes/user.routes.js';
import FileStore from 'session-file-store';
import cors from 'cors';
import messageManager from './controllers/managers/messageManager.db.js';
import { ProductManagerDB } from './controllers/managers/productsManager.db.js';
import { Server } from 'socket.io';
import MongoSingleton from './services/mongo.singleton.js';
import errorsHandler from './services/errors.handler.js';
import { addLogger, logHttpRequests } from './services/logger.js';
import authRouter from './routes/authRouter.js';
import morgan from 'morgan';

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/static', express.static(`${config.DIRNAME}/public`));
app.use(morgan('dev'));

dotenv.config();

// const expressInstance = app.listen(config.PORT, async () => {
//     await mongoose.connect(config.MONGODB_URI);
//     console.log(`App activa en puerto ${config.PORT} conectada a bbdd`);
// });

app.engine('handlebars', handlebars.engine());
app.set('views', `${config.DIRNAME}/views`);
app.set('view engine', 'handlebars');

app.use(cookieParser("sign3dLÑ75622"));
const fileStorage = FileStore(session);
app.use(session({
    // store: MongoStore.create({
    //     mongoUrl: config.MONGODB_URI,
    //     ttl: 600 
    // }),
    store: new fileStorage({ path: './sessions', ttl: 100, retries: 0 }),
    secret: config.SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize())
app.use(passport.session())
initAuthStrategies();       

app.use('/', viewsRouter);
app.use('/api/products', productsRouter);
app.use('/chat', chatRouter);
app.use('/carts', cartRouter);
app.use('/api/sessions/auth', authRouter);
app.use('/api/sessions', sessionRouter);
app.use('/profile', profileRouter);
app.use('/api/cookie', cookieRouter);
app.use('/api/user', userRouter);

app.use(errorsHandler);
app.use(addLogger);
app.use(logHttpRequests);
app.get('/loggerTest', (req, res) => {
    try {
        req.logger.debug('Este es un mensaje de debug');
        req.logger.http('Este es un mensaje http');
        req.logger.info('Este es un mensaje info');
        req.logger.warn('Este es un mensaje warning');
        req.logger.error('Este es un mensaje error');
        req.logger.fatal('Este es un mensaje fatal');
    
        res.send('Prueba de logger realizada');
    } catch (error) {
        req.logger.error('Error en /loggerTest: ', error);
        res.status(500).send('Error en /loggerTest');
    }
});
app.get('/test-error', (req, res, next) => {
    const error = new CustomError({ code: 8, status: 404, message: 'error creado por mi' });
    next(error);
});
console.log(`Logger en modo: ${config.MODE}`);

// const io = initSocket(expressInstance);
// app.set('io', io);

const httpServer = app.listen(config.PORT, async () => {

    MongoSingleton.getInstance();
});

const socketServer = new Server(httpServer);
app.set('socketServer', socketServer);

socketServer.on('connection', async (client) => {
    const savedMessages = await messageManager.getMessages();
    const messageRender = { messageRender: savedMessages };
    client.emit('cargaMessages', messageRender);
    
    const prodManager = new ProductManagerDB().getInstance();
    const products = await prodManager.getProducts();
    const prodRender = { prodRender: products.docs };
    client.emit('cargaProducts', prodRender);

    client.on('newMessage', async (data) => {
        console.log(`Mensaje recibido desde: ${client.id}. Mensaje:${data.message}, con usuario: ${data.user}`);
        const message = await messageManager.saveMessage(data);
        socketServer.emit('newMessageConfirmation', (message));
    })
});

mongoose.set('strictPopulate', false);
