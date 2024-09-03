import { Router } from 'express';
import { ProductManagerDB } from '../controllers/managers/productsManager.db.js';
import productModel from '../dao/models/products.model.js';
import cartModel from '../dao/models/cart.model.js';
import isAuthenticated from '../middlewares/authMiddleware.js'; 
import { adminAuth } from '../middlewares/adminAuth.js';  

const viewsRouter = Router();

viewsRouter.get('/products', isAuthenticated, async (req, res) => {
    try {
        const products = await ProductManagerDB.getInstance().getProducts(req);
        res.render('products', {
            products: products,
            user: req.session.user, 
            style: 'products.css'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

viewsRouter.get('/api/products', isAuthenticated, async (req, res) => {
    try {
        const products = await productModel.find().lean(); 
        res.render('realTimeProducts', { products }); 
    } catch (error) {
        console.error(error);
        res.status(500).send('Error interno del servidor');
    }
});

viewsRouter.get('/chat', isAuthenticated, (req, res) => {
    res.render('chat', {
        // user: req.user
    });
});

viewsRouter.get('/carts/:cid', isAuthenticated, async(req, res) => {
    const id = req.params.cid;
    try {
        const cart = await cartModel.findOne({ _id: id }).lean();
        cart.products = cart.products.map(product => {
            return {
                ...product,
                subtotal: product.productId.price * product.quantity
            };
        });
        cart.total = cart.products.reduce((acc, product) => acc + product.subtotal, 0).toFixed(2);
        res.render('carts', {
            style: 'carts.css',
            cart
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

viewsRouter.get('/', (req, res) => {
    try {
        res.render('login', {
            title: 'Home'
        })
    } catch (error) {
        res.status(400).send('Internal server error', error);
    }
});

viewsRouter.get('/register', (req, res) => {
    try {
        res.render('register', {
            title: 'Register'
        })
    } catch (error) {
        res.status(400).send('Internal server error', error);
    }
});

viewsRouter.get('/registered', (req, res) => {
    try {
        res.render('registered', {
            title: 'Signed Up Complete'
        })
    } catch (error) {
        res.status(400).send('Internal server error', error);
    }
});

viewsRouter.get('/admin/dashboard', isAuthenticated, adminAuth, (req, res) => {
    try {
        res.render('adminDashboard', {
            title: 'Admin Dashboard',
            user: req.session.user
        });
    } catch (error) {
        res.status(500).send('Internal server error');
    }
});

viewsRouter.get('/profile', isAuthenticated, (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    } 
    res.render('profile', { 
        user: req.session.user,
        login_type: req.session.user.login_type 
    });
});

viewsRouter.get('/upload-documents', isAuthenticated, (req, res) => {
    res.render('uploadDocuments', {
        user: req.session.user,
        title: 'Upload Documents',
        // style: 'uploadDocuments.css'  
    });
});


export default viewsRouter;