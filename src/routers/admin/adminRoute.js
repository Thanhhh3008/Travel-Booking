const express = require('express');
const router = express.Router();
const AdminController = require('../../controllers/admin/adminController');


const requireAdmin = (req, res, next) => {
  if (!req.session.login || req.session.login.MaVaiTro !== 3) {
    return res.redirect('/');
  }
  next();
};

router.get('/',  AdminController.dashboard);

module.exports = router;
