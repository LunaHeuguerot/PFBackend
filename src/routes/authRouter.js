import { Router } from 'express';
import AuthService from '../controllers/auth.controller.js';

const authRouter = Router();
const authService = new AuthService();

// Renderizar la página de "Forgot Password"
authRouter.get('/forgot-password', (req, res) => {
    res.render('forgot-password', {
        title: 'Forgot Password'
    });
});

// Procesar la solicitud de "Forgot Password"
authRouter.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    const result = await authService.forgotPassword(email);
    
    if (result.includes('error')) {
        res.status(400).send(result);
    } else {
        res.send(result);
    }
});

// **Nueva ruta para renderizar la página de "Reset Password"**
authRouter.get('/reset-password', (req, res) => {
    const { token } = req.query;

    if (!token) {
        return res.status(400).send('Token is missing or invalid');
    }

    res.render('reset-password', { title: 'Reset Password', token });
});

// Procesar la solicitud de "Reset Password"
authRouter.post('/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;
    const result = await authService.resetPassword(token, newPassword);
    
    if (result.success) {
        res.send({ message: result.message, redirectUrl: '/' }); 
    } else {
        res.status(400).send(result.message);
    }
});

export default authRouter;
