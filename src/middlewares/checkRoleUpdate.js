const User = require('../models/admin/NguoiDung');

module.exports = async (req, res, next) => {
  if (req.session?.user?.MaNguoiDung) {
    try {
      const currentUser = await User.getById(req.session.user.MaNguoiDung);
      if (currentUser && currentUser.MaVaiTro !== req.session.user.MaVaiTro) {
        req.session.user.MaVaiTro = currentUser.MaVaiTro;
        res.locals.login = req.session.user;
      }
    } catch (err) {
      console.error('Error checking role:', err);
    }
  }
  next();
};