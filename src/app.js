import express from 'express';
import config from './config.js';
import productsRouter from './public/routes/products.routes.js';
import viewsRouter from './public/routes/views.routes.js';
import handlebars from 'express-handlebars';
import mongoose from 'mongoose';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/static', express.static(`${config.DIRNAME}/public`));

const expressInstance = app.listen(config.PORT, async() => {
    await mongoose.connect(config.MONGODB_URI);
    console.log(`App activa en puerto ${config.PORT} conectada a bbdd`);
});

app.engine('handlebars', handlebars.engine());
app.set('views', `${config.DIRNAME}/views`);
app.set('view engine', 'handlebars');

app.use('/', viewsRouter);
app.use('/api/products', productsRouter);

