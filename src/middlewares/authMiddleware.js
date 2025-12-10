const requireLogin = (req, res, next) => {
    if (!req.session.login || !req.session.login.maNguoiDung) {
        req.session.message = {
            mess: 'Bạn cần đăng nhập để truy cập trang này.',
            type: 'danger',
        };
        req.session.save(() => {
            res.redirect('/login.html');
        });
        return;
    }
    next();
};

module.exports = { requireLogin };