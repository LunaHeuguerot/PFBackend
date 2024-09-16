import nodemailer from 'nodemailer';
import config from './config.js';

const transporter = nodemailer.createTransport({
    service: 'Gmail', 
    auth: {
        user: config.GMAIL_APP_USER,
        pass: config.GMAIL_APP_PASS,
    },
});

export const sendPurchaseEmail = async (to, subject, text) => {
    const mailOptions = {
        from: config.GMAIL_APP_USER,
        to,
        subject,
        text,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('email successfully sent');
    } catch (error) {
        console.error('error at sending email:', error);
    }
};

export const sendProductDeletionEmail = async (to, productName) => {
    const mailOptions = {
        from: config.GMAIL_APP_USER,
        to,
        subject: 'Producto eliminado de tu cuenta',
        text: `Estimado usuario, tu producto "${productName}" ha sido eliminado del sistema.`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email de eliminación de producto enviado con éxito');
    } catch (error) {
        console.error('Error al enviar el correo de eliminación de producto:', error);
    }
};
