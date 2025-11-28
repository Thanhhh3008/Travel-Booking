const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_FROM,
        pass: process.env.GMAIL_PASSWORD
    },
    tls: {
        rejectUnauthorized: false // FIX lỗi self-signed certificate
    }
});

const sendmall = async (subject, text) => {
    const mailOptions = {
        from: process.env.GMAIL_FROM,
        to: process.env.GMAIL_FROM,
        subject: subject,
        html: text
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.response);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};

const sendMailVerify = async (to, subject, html) => {
    const mailOptions = {
        from: process.env.GMAIL_FROM,
        to: to,
        subject: subject,
        html: html
    };


    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.response);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
}

module.exports = { sendmall, sendMailVerify }
