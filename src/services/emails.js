import nodemailer from 'nodemailer';
import config from './config';

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