const { sendMail } = require("../../util/admin/mailer");
const { sendmall } = require("../../util/mailer");

class ContactController {
    static contactView(req, res) {
        return res.render('client/home/contact')
    }

    static async senderEmail(req, res) {
        const { fullname, email, phone, message } = req.body;

        const html = `
        <div style="font-family: Arial, sans-serif; padding:32px; background:#f7f9fa; color:#222; max-width:500px; margin:40px auto; border-radius:12px; box-shadow:0 4px 24px rgba(0,0,0,0.07);">
            <h2 style="color:#2196F3; margin-bottom:8px;">📬 Bạn nhận được liên hệ mới từ khách hàng</h2>
            <p style="font-size:16px; margin-bottom:24px;">Một khách hàng vừa gửi thông tin liên hệ qua website. Dưới đây là chi tiết:</p>
            
            <div style="background:#fff; border-radius:8px; padding:20px 18px; margin-bottom:24px; box-shadow:0 2px 8px rgba(33,150,243,0.06);">
                <p style="margin:10px 0;"><strong>Họ tên:</strong> <span style="color:#333;">${fullname}</span></p>
                <p style="margin:10px 0;"><strong>Email:</strong> <span style="color:#333;">${email}</span></p>
                <p style="margin:10px 0;"><strong>Số điện thoại:</strong> <span style="color:#333;">${phone}</span></p>
                <p style="margin:10px 0;"><strong>Nội dung liên hệ:</strong><br>
                <span style="color:#333; display:inline-block; margin-top:6px; white-space:pre-line;">${message}</span>
                </p>
            </div>

            <p style="font-size:12px; color:#888; margin-top:32px; text-align:center;">
                Vui lòng kiểm tra và phản hồi khách hàng sớm nhất có thể.<br>
                <span style="color:#bbb;">Email này được gửi tự động từ website của bạn.</span>
            </p>
            </div>
        `
        if (await sendmall('LIÊN HỆ', html)) {
            req.session.message = { type: 'success', mess: 'Gửi liên hệ thành công !!!' };
            req.session.save(err => {
                if (err) console.error('Lỗi lưu session:', err);
                res.redirect('/');
            });
            return;
        }

        req.session.message = { type: 'danger', mess: 'Gửi liên hệ thất bại !!!' };
        req.session.save(err => {
            if (err) console.error('Lỗi lưu session:', err);
            res.redirect('/');
        });


    }
}

module.exports = ContactController