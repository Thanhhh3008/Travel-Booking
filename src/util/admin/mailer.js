
const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,  
    pass: process.env.GMAIL_PASS,  
  },
    tls: {
        rejectUnauthorized: false // FIX lỗi self-signed certificate
    }
});

exports.sendMail = async (to, subject, htmlContent) => {
  const mailOptions = {
    from: `"Hệ thống Homestay" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(` Email đã gửi đến ${to}`);
  } catch (error) {
    console.error(` Lỗi gửi mail đến ${to}:`, error);
  }
};
