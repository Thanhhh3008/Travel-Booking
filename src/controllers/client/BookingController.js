const BookingService = require('../../services/BookingService');
const RoomService = require('../../services/RoomService');
const ThongBao = require('../../models/admin/ThongBao');
const User = require('../../models/admin/NguoiDung');
class BookingController {

    /**
     * HIỂN THỊ FORM ĐẶT PHÒNG (TRANG RIÊNG)
     * GET /rooms/:roomId/book
     */
    static async bookView(req, res) {
        const message = req.session.message;
        delete req.session.message;

        const roomId = Number(req.params.roomId);
const thongbao = req.session.login  ? await ThongBao.getByUser(req.session.login.maNguoiDung) : [];
        // BẮT BUỘC ĐĂNG NHẬP
        if (!req.session.login) {
            req.session.message = {
                type: 'danger',
                mess: 'Bạn phải đăng nhập để đặt phòng.'
            };
            return req.session.save(() => res.redirect(`/rooms/${roomId}`),{thongbao});
        }

        // const currentUser = req.session.login; // chứa name, email, ...
 let currentUser = null;
            console.log("ma nguoi dung",req.session.login.maNguoiDung)
            if (req.session.login) {
                currentUser = await User.getById(req.session.login.maNguoiDung);
      }
      console.log("currentUser",currentUser)
        try {
            const roomService = new RoomService();
            const room = await roomService.findById(roomId);

            if (!room) {
                req.session.message = {
                    type: 'danger',
                    mess: 'Phòng không tồn tại.'
                };
                return req.session.save(() => res.redirect('/'));
            }

            res.render('client/home/room-booking', {
                message,
                room,
                currentUser,
                thongbao,
                helpers: {
                    formatMoney: (value) =>
                        Number(value || 0).toLocaleString('vi-VN', {
                            style: 'currency',
                            currency: 'VND',
                            maximumFractionDigits: 0,
                        }),
                },
            });
        } catch (e) {
            console.error('Error load booking form:', e);

            req.session.message = {
                type: 'danger',
                mess: 'Không thể tải form đặt phòng. Vui lòng thử lại sau.',
            };
            req.session.save(() => res.redirect(`/rooms/${roomId}`));
        }
    }

    /**
     * XỬ LÝ ĐẶT PHÒNG
     * POST /rooms/:roomId/book
     */
    static async store(req, res) {
        const roomId = Number(req.params.roomId);

        // BẮT BUỘC ĐĂNG NHẬP
        if (!req.session.login) {
            req.session.message = {
                type: 'danger',
                mess: 'Bạn phải đăng nhập để đặt phòng.'
            };
            return req.session.save(() => res.redirect(`/rooms/${roomId}`));
        }

        const { NgayNhanPhong, NgayTraPhong, SoLuongKhach } = req.body;
        const currentUser = req.session.login;

        // --- VALIDATE DỮ LIỆU ---
        if (!NgayNhanPhong || !NgayTraPhong) {
            req.session.message = { type: 'danger', mess: 'Vui lòng chọn ngày nhận và trả phòng.' };
            return req.session.save(() => res.redirect(`/rooms/${roomId}`));
        }

        const checkinDate = new Date(NgayNhanPhong);
        const checkoutDate = new Date(NgayTraPhong);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Kiểm tra ngày nhận phòng phải lớn hơn hoặc bằng ngày hiện tại
        if (checkinDate < today) {
            req.session.message = { type: 'danger', mess: 'Ngày nhận phòng không hợp lệ.' };
            return req.session.save(() => res.redirect(`/rooms/${roomId}`));
        }

        // Đặt phòng chỉ được đặt trước trong 30 ngày
        const maxBookingDate = new Date(today);
        maxBookingDate.setDate(today.getDate() + 30);
        if (checkinDate > maxBookingDate) {
            req.session.message = { type: 'danger', mess: 'Chỉ được đặt phòng trước tối đa 30 ngày.' };
            return req.session.save(() => res.redirect(`/rooms/${roomId}`));
        }

        // Tối thiểu là 2 ngày
        const minStay = 1000 * 60 * 60 * 24 * 2; // 2 ngày
        if (checkoutDate.getTime() - checkinDate.getTime() < minStay) {
            req.session.message = { type: 'danger', mess: 'Thời gian đặt phòng tối thiểu là 2 ngày.' };
            return req.session.save(() => res.redirect(`/rooms/${roomId}`));
        }

        try {
            const bookingService = new BookingService();
            const roomService = new RoomService();

            const room = await roomService.findById(roomId);
            if (!room) {
                req.session.message = { type: 'danger', mess: 'Phòng không tồn tại.' };
                return req.session.save(() => res.redirect('/'));
            }


           

            // Tính tổng tiền
            const stayDuration = Math.ceil((checkoutDate - checkinDate) / (1000 * 60 * 60 * 24));

            const totalPrice = stayDuration * Number(room['Gia']);

            // console.log(stayDuration, ' ', room['Gia'])

            // room.TrangThaiPhong = 'Đã Đặt Trước'

            // await roomService.updateStatus(roomId, 'Đã Đặt Trước')


await roomService.updateStatus(roomId, 'Đã Đặt Trước');

            const newBooking = await bookingService.create({
                MaNguoiDung: currentUser.maNguoiDung,
                MaPhong: roomId,
                NgayNhanPhong: checkinDate,
                NgayTraPhong: checkoutDate,
                 NgayDatPhong: new Date(), 
                TongTien: totalPrice,
                TrangThai: 0,
                SoLuongKhach: SoLuongKhach
            });

            req.session.message = { type: 'success', mess: 'Đặt phòng thành công!' };
req.session.save(err => {
    if (err) console.error('Lỗi lưu session:', err);
    res.redirect('/');
});


        } catch (e) {
            console.error('Error create booking:', e);
            req.session.message = { type: 'danger', mess: 'Không thể đặt phòng. Vui lòng thử lại sau.' };
            req.session.save(() => res.redirect(`/rooms/${roomId}`));
        }
    }



}

module.exports = BookingController;
