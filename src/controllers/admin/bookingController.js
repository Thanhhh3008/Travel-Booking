const BookingModel = require('../../models/admin/Booking');

// Danh sách chi tiết đặt phòng (phân trang)
exports.getAllBookingDetails = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;
    const status = req.query.status;

    const totalBookings = await BookingModel.countAll(status);
    const totalPages = Math.ceil(totalBookings / limit);
    const bookings = await BookingModel.getAllWithPagination(limit, offset, status);

    res.render('admin/datphong', {
      title: 'Danh sách chi tiết đặt phòng',
      bookings,
      currentPage: page,
      totalPages,
      totalBookings,
      limit,
      status
       
    });

  } catch (err) {
    console.error('Lỗi lấy danh sách chi tiết đặt phòng:', err);
    res.status(500).send('Lỗi server');
  }
};

// In hóa đơn
exports.printBookingInvoice = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const booking = await BookingModel.getById(bookingId);

    if (!booking) {
      return res.status(404).send('Không tìm thấy đơn');
    }

    res.render('admin/printInvoice', { booking });

  } catch (err) {
    console.error(err);
    res.status(500).send('Lỗi khi in hóa đơn');
  }
};

// XÓA ĐƠN ĐẶT PHÒNG
exports.deleteBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;

    const booking = await BookingModel.getById(bookingId);
    if (!booking) {
      return res.status(404).send('Không tìm thấy đơn');
    }

    if (booking.TrangThai == 1) {
      return res.status(400).send('Không thể xóa đơn đã hoàn thành');
    }

    await BookingModel.deleteById(bookingId);
    res.redirect('/admin/datphong');


  } catch (err) {
    console.error('Lỗi xóa đơn:', err);
    res.status(500).send('Lỗi server');
  }
};
