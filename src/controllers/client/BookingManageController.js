// src/controllers/client/BookingManageController.js
const BookingService = require('../../services/BookingService');
const RoomService = require('../../services/RoomService');
const ThongBao = require('../../models/admin/ThongBao');
const User = require('../../models/admin/NguoiDung');
const RevenueService = require('../../services/RevenueService');

class BookingManageController {
    // =========================
    //  TRANG QUẢN LÝ ĐƠN ĐẶT
    // =========================
    static async index(req, res) {
        const message = req.session.message;
        delete req.session.message;

        try {
            if (!req.session.login || !req.session.login.maNguoiDung) {
                req.session.message = { type: 'danger', mess: 'Vui lòng đăng nhập.' };
                return req.session.save(() => res.redirect('/login.html'));
            }

            const ownerId = req.session.login.maNguoiDung;

            const thongbao = await ThongBao.getByUser(ownerId);
            const currentUser = await User.getById(ownerId);

            const bookingService = new BookingService();
            const bookings = await bookingService.getOwnerBookings(ownerId);

            res.render('client/home/manage-bookings', {
                message,
                bookings,
                thongbao,
                currentUser,
                helpers: {
                    formatMoney: (value) =>
                        (Number(value) || 0).toLocaleString('vi-VN', { maximumFractionDigits: 0 }),

                    formatDate: (dateValue) => {
                        if (!dateValue) return '';
                        const d = new Date(dateValue);
                        if (Number.isNaN(d.getTime())) return String(dateValue);
                        const dd = String(d.getDate()).padStart(2, '0');
                        const mm = String(d.getMonth() + 1).padStart(2, '0');
                        const yyyy = d.getFullYear();
                        return `${dd}/${mm}/${yyyy}`;
                    },

                    mapLife: (lichSu) => {
                        const s = (lichSu || 'BOOKED').toUpperCase().trim();
                        const map = {
                            BOOKED: 'Đã đặt',
                            CHECKED_IN: 'Đã check-in',
                            CHECKED_OUT: 'Đã check-out',
                            RESET: 'Cho đặt tiếp',
                            CANCELLED: 'Đã hủy',
                        };
                        return map[s] || 'Đã đặt';
                    },

                    lifeClass: (lichSu) => {
                        const s = (lichSu || 'BOOKED').toUpperCase().trim();
                        const map = {
                            BOOKED: 'booked',
                            CHECKED_IN: 'checkedin',
                            CHECKED_OUT: 'checkedout',
                            RESET: 'reset',
                            CANCELLED: 'cancelled',
                        };
                        return map[s] || 'booked';
                    }
                }
            });
        } catch (err) {
            console.error('BookingManageController.index error:', err);
            req.session.message = { type: 'danger', mess: 'Không thể tải trang quản lý đơn đặt.' };
            req.session.save(() => res.redirect('/'));
        }
    }

    // =========================
    // ✅ CHECK-IN THEO BOOKING
    // - update LichSu = CHECKED_IN
    // - update room status = Đang sử dụng
    // =========================
    static async checkIn(req, res) {
        try {
            if (!req.session.login || !req.session.login.maNguoiDung) {
                req.session.message = { type: 'danger', mess: 'Vui lòng đăng nhập.' };
                return req.session.save(() => res.redirect('/login.html'));
            }

            const ownerId = req.session.login.maNguoiDung;
            const bookingId = Number(req.params.bookingId);

            const bookingService = new BookingService();
            const roomService = new RoomService();

            const booking = await bookingService.getBookingByiD(bookingId);
            if (!booking) {
                req.session.message = { type: 'danger', mess: 'Không tìm thấy đơn đặt.' };
                return req.session.save(() => res.redirect('/owner/bookings'));
            }

            if (Number(booking.OwnerId) !== Number(ownerId)) {
                req.session.message = { type: 'danger', mess: 'Bạn không có quyền thao tác đơn này.' };
                return req.session.save(() => res.redirect('/owner/bookings'));
            }

            await bookingService.updateBookingLifeStatus(bookingId, 'CHECKED_IN');
            // await roomService.updateStatus(booking.MaPhong, 'Đang sử dụng');

            req.session.message = { type: 'success', mess: `Check-in đơn #${bookingId} thành công!` };
            req.session.save(() => res.redirect('/owner/bookings'));
        } catch (err) {
            console.error('BookingManageController.checkIn error:', err);
            req.session.message = { type: 'danger', mess: 'Không thể check-in. Vui lòng thử lại.' };
            req.session.save(() => res.redirect('/owner/bookings'));
        }
    }

    // =========================
    //  CHECK-OUT THEO BOOKING
    // - update LichSu = CHECKED_OUT
    // - update room status = Hoàn thành kỳ
    // - ghi doanh thu (giống logic bạn đang làm)
    // =========================
    static async checkOut(req, res) {
        try {
            if (!req.session.login || !req.session.login.maNguoiDung) {
                req.session.message = { type: 'danger', mess: 'Vui lòng đăng nhập.' };
                return req.session.save(() => res.redirect('/login.html'));
            }

            const ownerId = req.session.login.maNguoiDung;
            const bookingId = Number(req.params.bookingId);

            const bookingService = new BookingService();
            const roomService = new RoomService();
            const revenueService = new RevenueService();

            const booking = await bookingService.getBookingByiD(bookingId);
            if (!booking) {
                req.session.message = { type: 'danger', mess: 'Không tìm thấy đơn đặt.' };
                return req.session.save(() => res.redirect('/owner/bookings'));
            }

            if (Number(booking.OwnerId) !== Number(ownerId)) {
                req.session.message = { type: 'danger', mess: 'Bạn không có quyền thao tác đơn này.' };
                return req.session.save(() => res.redirect('/owner/bookings'));
            }

            await bookingService.updateBookingLifeStatus(bookingId, 'CHECKED_OUT');
            await roomService.updateStatus(booking.MaPhong, 'Hoàn thành kỳ');

            function getVietnamDateTime() {
                const now = new Date();
                const vietnamTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));
                return vietnamTime.toISOString().replace("T", " ").slice(0, 19);
            }

            const formattedDate = getVietnamDateTime();

            const doanhThu = {
                NgayLap: formattedDate,
                DoanhThuTuPhong: Number(booking.TongTien || 0),
                DoanhThuTuDichVu: 0,
                MoTa: `Doanh thu đơn #${bookingId} - Phòng ${booking.SoPhong || booking.MaPhong}`,
                TenDoanhThu: `Doanh thu booking ${bookingId}`,
            };

            await revenueService.create(doanhThu);
            await bookingService.markCompleted(bookingId)
            req.session.message = { type: 'success', mess: `Check-out đơn #${bookingId} thành công! Doanh thu phòng sẽ được cập nhật` };
            req.session.save(() => res.redirect('/owner/bookings'));
        } catch (err) {
            console.error('BookingManageController.checkOut error:', err);
            req.session.message = { type: 'danger', mess: 'Không thể check-out. Vui lòng thử lại.' };
            req.session.save(() => res.redirect('/owner/bookings'));
        }
    }

    // =========================
    //  CHO ĐẶT TIẾP THEO BOOKING
    // - update LichSu = RESET
    // - update room status = Trống
    // =========================
    static async resetRoom(req, res) {
        try {
            if (!req.session.login || !req.session.login.maNguoiDung) {
                req.session.message = { type: 'danger', mess: 'Vui lòng đăng nhập.' };
                return req.session.save(() => res.redirect('/login.html'));
            }

            const ownerId = req.session.login.maNguoiDung;
            const bookingId = Number(req.params.bookingId);

            const bookingService = new BookingService();
            const roomService = new RoomService();

            const booking = await bookingService.getBookingByiD(bookingId);
            if (!booking) {
                req.session.message = { type: 'danger', mess: 'Không tìm thấy đơn đặt.' };
                return req.session.save(() => res.redirect('/owner/bookings'));
            }

            if (Number(booking.OwnerId) !== Number(ownerId)) {
                req.session.message = { type: 'danger', mess: 'Bạn không có quyền thao tác đơn này.' };
                return req.session.save(() => res.redirect('/owner/bookings'));
            }

            await bookingService.updateBookingLifeStatus(bookingId, 'RESET');
            // await roomService.updateStatus(booking.MaPhong, 'Trống');

            req.session.message = { type: 'success', mess: `Phòng đã TRỐNG để cho đặt tiếp (đơn #${bookingId}).` };
            req.session.save(() => res.redirect('/owner/bookings'));
        } catch (err) {
            console.error('BookingManageController.resetRoom error:', err);
            req.session.message = { type: 'danger', mess: 'Không thể cho đặt tiếp. Vui lòng thử lại.' };
            req.session.save(() => res.redirect('/owner/bookings'));
        }
    }
}

module.exports = BookingManageController;
