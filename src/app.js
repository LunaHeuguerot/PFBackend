import express from 'express';
import config from './config.js';
import productsRouter from './public/routes/products.routes.js';
import cartsRouter from './public/routes/carts.routes.js';
import chatRouter from './public/routes/chat.routes.js';
import viewsRouter from './public/routes/views.routes.js';
import handlebars from 'express-handlebars';
import mongoose from 'mongoose';
import initSocket from './sockets.js';
import MongoStore from 'connect-mongo';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import sessionRouter from './public/routes/session.router.js';
import profileRouter from './public/routes/profile.routes.js';
import passport from 'passport';
import initAuthStrategies from './auth/passport.strategies.js';
import cookieRouter from './public/routes/cookie.routes.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/static', express.static(`${config.DIRNAME}/public`));

const expressInstance = app.listen(config.PORT, async () => {
    await mongoose.connect(config.MONGODB_URI);
    console.log(`App activa en puerto ${config.PORT} conectada a bbdd`);
});

app.engine('handlebars', handlebars.engine());
app.set('views', `${config.DIRNAME}/views`);
app.set('view engine', 'handlebars');

app.use(cookieParser("sign3dLÑ75622"));
app.use(session({
    store: MongoStore.create({
        mongoUrl: config.MONGODB_URI,
        ttl: 600 
    }),
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
app.use('/carts', cartsRouter);
app.use('/api/sessions', sessionRouter);
app.use('/profile', profileRouter);
app.use('/api/cookie', cookieRouter);

const io = initSocket(expressInstance);
app.set('io', io);

mongoose.set('strictPopulate', false);
