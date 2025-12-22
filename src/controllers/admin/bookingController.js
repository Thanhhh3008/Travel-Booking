
const BookingModel = require('../../models/admin/Booking');
// Danh sách chi tiết đặt phòng (phân trang)
exports.getAllBookingDetails = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;
    const status = req.query.status; // 0 hoặc 1

    // Lấy tổng số bản ghi theo trạng thái
    const totalBookings = await BookingModel.countAll(status);
    const totalPages = Math.ceil(totalBookings / limit);

    // Lấy danh sách phân trang theo trạng thái
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
exports.printBookingInvoice = async (req, res) => {
  try {
    const bookingId = req.params.id;

    // Lấy thông tin booking qua model
    const booking = await BookingModel.getById(bookingId);

    if (!booking) return res.status(404).send('Không tìm thấy đơn');

    res.render('admin/printInvoice', { booking });
  } catch (err) {
    console.error(err);
    res.status(500).send('Lỗi khi in hóa đơn');
  }
};