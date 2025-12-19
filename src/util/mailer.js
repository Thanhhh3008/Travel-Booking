const nodemailer = require('nodemailer');
require('dotenv').config();
const path = require('path')

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


const sendmallconfig = async (to, subject, filename) => {
    const mailOptions = {
        from: process.env.GMAIL_FROM,
        to: to,
        subject: subject,
        html: `
        <div style="font-family: Arial, sans-serif; padding:32px; background:#f7f9fa; color:#222; max-width:500px; margin:40px auto; border-radius:12px; box-shadow:0 4px 24px rgba(0,0,0,0.07);">
  <h2 style="color:#2196F3; margin-bottom:8px;">
    🧾 Thông tin đơn hàng từ <span style="color:#1976d2;">TRIPSTAY</span>
  </h2>

  <p style="font-size:16px; margin-bottom:20px;">
    Cảm ơn bạn đã đặt phòng TRIPSTAY. Dưới đây là mã QR Code hãy lưu lại thật kỹ.
  </p>


  <!-- QR CODE -->
  <div style="background:#fff; border-radius:8px; padding:20px 16px; margin-bottom:22px; box-shadow:0 2px 8px rgba(33,150,243,0.06); text-align:center;">
    <p style="margin-bottom:12px; font-size:15px; font-weight:500;">
      Mã QR dùng để check-in / xác nhận đơn hàng
    </p>

    <img 
      src="cid:order-qrcode"
      alt="QR đơn hàng"
      style="width:180px; height:180px; border-radius:8px;"
    />

    <p style="margin-top:12px; font-size:13px; color:#555;">
      Vui lòng xuất trình mã QR này khi đến quầy.
    </p>
  </div>

  <!-- GHI CHÚ -->
  <div style="background:#fff; border-radius:8px; padding:18px 16px; margin-bottom:20px; box-shadow:0 2px 8px rgba(33,150,243,0.06);">
    <p style="margin:10px 0; font-size:15px;">
      Nếu bạn có bất kỳ thắc mắc nào liên quan đến đơn hàng, vui lòng liên hệ bộ phận hỗ trợ của TRIPSTAY.
    </p>
    <p style="margin:10px 0; color:#d32f2f; font-size:13px; font-weight:500;">
      <strong>Lưu ý:</strong> Mã QR chỉ có hiệu lực cho đơn hàng này và không chia sẻ cho người khác.
    </p>
  </div>

  <p style="font-size:12px; color:#888; margin-top:24px; text-align:center;">
    Email này được gửi tự động từ hệ thống TRIPSTAY. Vui lòng không trả lời email này.
  </p>
</div>

        `,

        attachments: [
            {
                filename: filename,
                path: path.join(__dirname, `../../public/qrcode/${filename}`),
                cid: 'order-qrcode'
            }
        ]
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

module.exports = { sendmall, sendMailVerify, sendmallconfig }
