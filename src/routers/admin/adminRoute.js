const express = require('express');
const router = express.Router();
const AdminController = require('../../controllers/admin/adminController');
const BookingController = require('../../controllers/admin/bookingController');

const requireAdmin = (req, res, next) => {
  if (!req.session.login || req.session.login.MaVaiTro !== 3) {
    return res.redirect('/');
  }
  next();
};

router.get('/',requireAdmin,  AdminController.dashboard);

router.get('/datphong', BookingController.getAllBookingDetails);
// Route in hóa đơn
router.get('/datphong/:id/print', BookingController.printBookingInvoice);

module.exports = router;
