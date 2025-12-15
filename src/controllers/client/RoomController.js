// src/controllers/client/RoomController.js

const fs = require('fs');
const path = require('path');
const CategoryRoomService = require('../../services/CategoryRoomService');
const RoomService = require('../../services/RoomService');
const ThongBao = require('../../models/admin/ThongBao');
const User = require('../../models/admin/NguoiDung');
const RevenueService = require('../../services/RevenueService');

const BookingService = require('../../services/BookingService');

class RoomController {
    // =============== TRANG DANH SÁCH PHÒNG ===============
    static async index(req, res) {
        console.log("LOGIN SESSION:", req.session.login);

        const message = req.session.message;
        delete req.session.message;

        const thongbao = req.session.login ? await ThongBao.getByUser(req.session.login.maNguoiDung) : [];
        let currentUser = null;

        if (req.session.login) {
            console.log("ma nguoi dung", req.session.login.maNguoiDung);
            currentUser = await User.getById(req.session.login.maNguoiDung);
        }

        try {
            const categoryRoomService = new CategoryRoomService();
            const roomService = new RoomService();

            // luôn chỉ lấy phòng Trống
            const status = 'Trống';

            const [roomTypes, rooms] = await Promise.all([
                categoryRoomService.getAll(),
                roomService.getAll('WHERE p.TrangThaiPhong = ?', [status]),
            ]);

            console.log(rooms);

            res.render('client/home/list-room', {
                message,
                roomTypes,
                rooms,
                thongbao,
                currentUser,
                helpers: {
                    formatMoney: (value) =>
                        (value || 0).toLocaleString('vi-VN', {
                            maximumFractionDigits: 0,
                        }),
                },
            });
        } catch (error) {
            console.error('Error loading room list:', error);

            res.render('client/home/list-room', {
                message: {
                    type: 'danger',
                    mess: 'Không thể tải danh sách phòng. Vui lòng thử lại sau.',
                },
                roomTypes: [],
                rooms: [],
                thongbao: [],
                currentUser: [],
                helpers: {
                    formatMoney: (value) =>
                        (value || 0).toLocaleString('vi-VN', {
                            maximumFractionDigits: 0,
                        }),
                },
            });
        }
    }

    // =============== FORM THÊM PHÒNG ===============
    static async createView(req, res) {
        const message = req.session.message;
        delete req.session.message;

        const thongbao = req.session.login ? await ThongBao.getByUser(req.session.login.maNguoiDung) : [];
        let currentUser = null;

        if (req.session.login) {
            console.log("ma nguoi dung", req.session.login.maNguoiDung);
            currentUser = await User.getById(req.session.login.maNguoiDung);
        }

        try {
            const categoryRoomService = new CategoryRoomService();
            const roomTypes = await categoryRoomService.getAll();

            res.render('client/home/add-room', { message, roomTypes, thongbao, currentUser });
        } catch (error) {
            console.error('Error loading add room form:', error);
            res.status(500).send('Internal Server Error');
        }
    }

    static async listByCity(req, res) {
        const thongbao = req.session.login ? await ThongBao.getByUser(req.session.login.maNguoiDung) : [];
        let currentUser = null;

        if (req.session.login) {
            console.log("ma nguoi dung", req.session.login.maNguoiDung);
            currentUser = await User.getById(req.session.login.maNguoiDung);
        }

        try {
            const city = req.params.city;
            const roomService = new RoomService();

            const rooms = await roomService.getAll(
                `WHERE p.TrangThaiPhong = 'Trống' AND p.ThanhPho LIKE ?`,
                [`%${city}%`]
            );

            res.render('client/home/byCity', {
                city,
                rooms,
                thongbao,
                currentUser
            });
        } catch (error) {
            console.error(error);
            res.status(500).send("Internal Server Error");
        }
    }

    // =============== LƯU PHÒNG MỚI ===============
    static async store(req, res) {
        const roomService = new RoomService();
        let redirectPath = '/';

        try {
            if (!req.session.login || !req.session.login.maNguoiDung) {
                throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
            }

            const {
                SoPhong,
                ViTriTang,
                TrangThaiPhong,
                MaLoaiPhong,
                View,
                DiaChi,
                Rating,
                Gia,
                MoTa,
                MaThietBi,
            } = req.body;

            if (!SoPhong || !MaLoaiPhong || !Gia) {
                throw new Error('Vui lòng nhập đầy đủ Số phòng, Loại phòng và Giá.');
            }

            const parsedLoaiPhong = Number(MaLoaiPhong);
            const parsedGia = Number(Gia);
            const parsedTang = ViTriTang ? Number(ViTriTang) : null;
            const parsedRating = Rating ? Number(Rating) : null;
            const parsedThietBi = MaThietBi ? Number(MaThietBi) : null;

            if (!Number.isInteger(parsedLoaiPhong) || parsedLoaiPhong <= 0)
                throw new Error('Loại phòng không hợp lệ.');

            if (!Number.isFinite(parsedGia) || parsedGia <= 0)
                throw new Error('Giá phòng phải là số lớn hơn 0.');

            if (parsedTang !== null && (!Number.isInteger(parsedTang) || parsedTang < 0))
                throw new Error('Vị trí tầng phải là số nguyên không âm.');

            if (parsedRating !== null && (parsedRating < 0 || parsedRating > 5))
                throw new Error('Đánh giá phải nằm trong khoảng từ 0 đến 5.');

            const imagesPhong = req.files?.HinhAnh
                ? req.files.HinhAnh.map(f => f.filename).join(',')
                : null;

            const imagesGiayTo = req.files?.GiayToPhong
                ? req.files.GiayToPhong.map(f => f.filename).join(',')
                : null;

            await roomService.create({
                SoPhong,
                ViTriTang: parsedTang,
                TrangThaiPhong: TrangThaiPhong || 'Chờ xét duyệt',
                MaLoaiPhong: parsedLoaiPhong,
                View: View || null,
                DiaChi: DiaChi || null,
                Rating: parsedRating,
                Gia: parsedGia,
                MoTa: MoTa || null,
                HinhAnh: imagesPhong,
                GiayToPhong: imagesGiayTo,
                MaThietBi: parsedThietBi,
                MaNguoiDung: req.session.login.maNguoiDung,
            });

            req.session.message = {
                mess: 'Thêm phòng thành công. Xin vui lòng chờ admin xét duyệt. Thông báo sẽ được gửi tới bạn trong 24h ',
                type: 'success',
            };

        } catch (error) {
            console.error('Error saving room:', error);

            if (req.files) {
                ['HinhAnh', 'GiayToPhong'].forEach(field => {
                    if (req.files[field]) {
                        req.files[field].forEach(file => {
                            const filePath = path.join(
                                __dirname,
                                '..',
                                '..',
                                '..',
                                'public',
                                'admin',
                                'uploads',
                                'anhphong',
                                file.filename
                            );
                            fs.unlink(filePath, err => {
                                if (err) console.error('Cannot remove file:', err);
                            });
                        });
                    }
                });
            }

            req.session.message = {
                mess: error.message || 'Không thể thêm phòng. Vui lòng thử lại sau.',
                type: 'danger',
            };

            redirectPath = '/';
        }

        req.session.save(() => res.redirect(redirectPath));
    }

    // =============== FORM SỬA PHÒNG ===============
    static async editView(req, res) {
        const message = req.session.message;
        delete req.session.message;

        const id = Number(req.params.id);
        const categoryRoomService = new CategoryRoomService();
        const roomService = new RoomService();
        let currentUser = null;

        if (req.session.login) {
            console.log("ma nguoi dung", req.session.login.maNguoiDung);
            currentUser = await User.getById(req.session.login.maNguoiDung);
        }

        try {
            const [roomTypes, room] = await Promise.all([
                categoryRoomService.getAll(),
                roomService.findById(id),
            ]);

            if (!room) {
                req.session.message = {
                    type: 'danger',
                    mess: 'Không tìm thấy phòng cần sửa.',
                };
                return req.session.save(() => res.redirect('/rooms'));
            }

            res.render('client/home/edit-room', {
                message,
                roomTypes,
                room,
                currentUser
            });
        } catch (error) {
            console.error('Error loading edit room form:', error);
            req.session.message = {
                type: 'danger',
                mess: 'Đã xảy ra lỗi khi tải form sửa phòng.',
            };
            req.session.save(() => res.redirect('/rooms'));
        }
    }

    // =============== CẬP NHẬT PHÒNG ===============
    static async update(req, res) {
        const roomService = new RoomService();
        const id = Number(req.params.id);

        let redirectPath = '/rooms';

        try {
            const oldRoom = await roomService.findById(id);
            if (!oldRoom) {
                req.session.message = {
                    type: 'danger',
                    mess: 'Không tìm thấy phòng cần cập nhật.',
                };
                return req.session.save(() => res.redirect('/rooms'));
            }

            const {
                SoPhong,
                ViTriTang,
                TrangThaiPhong,
                MaLoaiPhong,
                View,
                DiaChi,
                Rating,
                Gia,
                MoTa,
                MaThietBi,
            } = req.body;

            if (!SoPhong || !MaLoaiPhong || !Gia) {
                throw new Error('Vui lòng nhập đầy đủ Số phòng, Loại phòng và Giá.');
            }

            const parsedLoaiPhong = Number(MaLoaiPhong);
            const parsedGia = Number(Gia);
            const parsedTang = ViTriTang ? Number(ViTriTang) : null;
            const parsedRating = Rating ? Number(Rating) : null;
            const parsedThietBi = MaThietBi ? Number(MaThietBi) : null;

            if (!Number.isInteger(parsedLoaiPhong) || parsedLoaiPhong <= 0) {
                throw new Error('Loại phòng không hợp lệ.');
            }

            if (!Number.isFinite(parsedGia) || parsedGia <= 0) {
                throw new Error('Giá phòng phải là số lớn hơn 0.');
            }

            if (parsedTang !== null && (!Number.isInteger(parsedTang) || parsedTang < 0)) {
                throw new Error('Vị trí tầng phải là số nguyên không âm.');
            }

            if (parsedRating !== null && (parsedRating < 0 || parsedRating > 5)) {
                throw new Error('Đánh giá phải nằm trong khoảng từ 0 đến 5.');
            }

            if (parsedThietBi !== null && (!Number.isInteger(parsedThietBi) || parsedThietBi < 0)) {
                throw new Error('Mã thiết bị phải là số nguyên không âm.');
            }

            const newImagePath = req.file ? `/uploads/${req.file.filename}` : oldRoom.HinhAnh;

            // ⚠️ giữ nguyên như code bạn đang dùng (nếu bạn có ownerId thì truyền đúng theo service)
            const updated = await roomService.update(id, oldRoom.MaNguoiDung, {
                SoPhong,
                ViTriTang: parsedTang,
                TrangThaiPhong: TrangThaiPhong || oldRoom.TrangThaiPhong,
                MaLoaiPhong: parsedLoaiPhong,
                View,
                DiaChi,
                Rating: parsedRating,
                Gia: parsedGia,
                MoTa,
                HinhAnh: newImagePath,
                MaThietBi: parsedThietBi,
            });

            if (updated && req.file && oldRoom.HinhAnh) {
                const oldFileName = path.basename(oldRoom.HinhAnh);
                const oldFilePath = path.join(
                    __dirname,
                    '..',
                    '..',
                    '..',
                    'public',
                    'uploads',
                    oldFileName
                );
                fs.unlink(oldFilePath, (err) => {
                    if (err) {
                        console.error('Error removing old image:', err);
                    }
                });
            }

            req.session.message = {
                type: 'success',
                mess: 'Cập nhật phòng thành công.',
            };
        } catch (error) {
            console.error('Error updating room:', error);

            if (req.file) {
                const filePath = path.join(
                    __dirname,
                    '..',
                    '..',
                    '..',
                    'public',
                    'uploads',
                    req.file.filename
                );
                fs.unlink(filePath, (unlinkError) => {
                    if (unlinkError) {
                        console.error('Error removing uploaded file:', unlinkError);
                    }
                });
            }

            req.session.message = {
                type: 'danger',
                mess: error.message || 'Không thể cập nhật phòng. Vui lòng thử lại sau.',
            };
            redirectPath = `/rooms/${id}/edit`;
        }

        req.session.save(() => {
            res.redirect(redirectPath);
        });
    }

    // =============== TRANG CHI TIẾT PHÒNG ===============
    static async detail(req, res) {
        const message = req.session.message;
        delete req.session.message;

        const id = Number(req.params.id);
        const roomService = new RoomService();

        const thongbao = req.session.login ? await ThongBao.getByUser(req.session.login.maNguoiDung) : [];
        let currentUser = null;

        if (req.session.login) {
            console.log("ma nguoi dung", req.session.login.maNguoiDung);
            currentUser = await User.getById(req.session.login.maNguoiDung);
        }

        try {
            const room = await roomService.findById(id);

            if (!room) {
                req.session.message = {
                    type: 'danger',
                    mess: 'Không tìm thấy phòng.',
                };
                return req.session.save(() => res.redirect('/'));
            }

            res.render('client/home/room-detail', {
                message,
                room,
                thongbao,
                currentUser,
                helpers: {
                    formatMoney: (value) =>
                        Number(value || 0).toLocaleString('vi-VN', {
                            style: 'currency',
                            currency: 'VND',
                            maximumFractionDigits: 0,
                        }),
                },
            });
        } catch (error) {
            console.error('Error loading room detail:', error);
            req.session.message = {
                type: 'danger',
                mess: 'Đã xảy ra lỗi khi tải chi tiết phòng.',
            };
            req.session.save(() => res.redirect('/'));
        }
    }

    // ✅✅✅ SỬA QUAN TRỌNG Ở ĐÂY: LẤY PHÒNG KÈM NHIỀU ĐƠN ĐẶT
    static async myRooms(req, res) {
        const message = req.session.message;
        delete req.session.message;

        try {
            if (!req.session.login || !req.session.login.maNguoiDung) {
                req.session.message = {
                    type: 'danger',
                    mess: 'Vui lòng đăng nhập để xem phòng của bạn.',
                };
                return req.session.save(() => res.redirect('/login.html'));
            }

            const userId = req.session.login.maNguoiDung;
            const roomService = new RoomService();
            const categoryRoomService = new CategoryRoomService();

            const thongbao = await ThongBao.getByUser(userId);
            const currentUser = await User.getById(userId);

            // ✅ LẤY PHÒNG + BOOKINGS (nhiều đơn)
            const rooms = await roomService.getOwnerRoomsWithBookings(userId);

            const roomTypes = await categoryRoomService.getAll();

            const roomsByStatus = {
                'Đã duyệt': [],
                'Trống': [],
                'Đã đặt trước': [],
                'Đang sử dụng': [],
                'Hoàn thành kỳ': [],
                'Bị từ chối': [],
            };

            rooms.forEach(room => {
                let status = room.TrangThaiPhong?.trim() || 'Trống';
                if (status === 'Đã từ chối') status = 'Bị từ chối';
                if (!roomsByStatus[status]) status = 'Trống';
                roomsByStatus[status].push(room);
            });

            const stats = {
                total: rooms.length,
                approved: (roomsByStatus['Đã duyệt'].length || 0) + (roomsByStatus['Trống'].length || 0),
                booked: roomsByStatus['Đã đặt trước'].length || 0,
                using: roomsByStatus['Đang sử dụng'].length || 0,
                completed: roomsByStatus['Hoàn thành kỳ'].length || 0,
                rejected: roomsByStatus['Bị từ chối'].length || 0,
            };

            res.render('client/home/my-rooms', {
                message,
                rooms,
                roomsByStatus,
                stats,
                roomTypes,
                thongbao,
                currentUser,
                helpers: {
                    formatMoney: (value) =>
                        (Number(value) || 0).toLocaleString('vi-VN', {
                            maximumFractionDigits: 0,
                        }),

                    mapStatus: (status) => {
                        if (!status) return 'Chờ xét duyệt';
                        status = status.trim();
                        return status === 'Đã từ chối' ? 'Bị từ chối' : status;
                    },

                    // ✅ để view dùng helpers.formatDate(...) (bạn đang gọi trong ejs)
                    formatDate: (dateValue) => {
                        if (!dateValue) return '';
                        const d = new Date(dateValue);
                        if (Number.isNaN(d.getTime())) return String(dateValue);
                        const dd = String(d.getDate()).padStart(2, '0');
                        const mm = String(d.getMonth() + 1).padStart(2, '0');
                        const yyyy = d.getFullYear();
                        return `${dd}/${mm}/${yyyy}`;
                    }
                },
            });
        } catch (error) {
            console.error('Error loading my rooms:', error);
            req.session.message = {
                type: 'danger',
                mess: 'Không thể tải danh sách phòng. Vui lòng thử lại sau.',
            };
            req.session.save(() => res.redirect('/'));
        }
    }

    /**
     * Xóa phòng
     */
    static async delete(req, res) {
        const id = Number(req.params.id);
        const roomService = new RoomService();

        try {
            if (!req.session.login || !req.session.login.maNguoiDung) {
                req.session.message = {
                    type: 'danger',
                    mess: 'Vui lòng đăng nhập.',
                };
                return req.session.save(() => res.redirect('/login.html'));
            }

            const userId = req.session.login.maNguoiDung;
            const room = await roomService.findById(id);

            console.log(userId, room?.MaNguoiDung);

            if (!room) {
                req.session.message = {
                    type: 'danger',
                    mess: 'Không tìm thấy phòng.',
                };
                return req.session.save(() => res.redirect('/rooms/my-rooms'));
            }

            if (room.MaNguoiDung !== userId) {
                req.session.message = {
                    type: 'danger',
                    mess: 'Bạn không có quyền xóa phòng này.',
                };
                return req.session.save(() => res.redirect('/rooms/my-rooms'));
            }

            if (room.TrangThaiPhong === 'Đã đặt') {
                req.session.message = {
                    type: 'danger',
                    mess: 'Không thể xóa phòng đang được đặt.',
                };
                return req.session.save(() => res.redirect('/rooms/my-rooms'));
            }

            await roomService.delete(id);

            req.session.message = {
                type: 'success',
                mess: 'Xóa phòng thành công.',
            };
        } catch (error) {
            console.error('Error deleting room:', error);
            req.session.message = {
                type: 'danger',
                mess: 'Không thể xóa phòng. Vui lòng thử lại sau.',
            };
        }

        req.session.save(() => res.redirect('/rooms/my-rooms'));
    }

    // =============== CHECK-IN (Đã đặt trước -> Đang sử dụng) ===============
    static async checkIn(req, res) {
        const id = Number(req.params.id);
        const roomService = new RoomService();

        try {
            if (!req.session.login || !req.session.login.maNguoiDung) {
                req.session.message = {
                    type: 'danger',
                    mess: 'Vui lòng đăng nhập.',
                };
                return req.session.save(() => res.redirect('/login.html'));
            }

            const room = await roomService.findById(id);

            if (!room) {
                req.session.message = {
                    type: 'danger',
                    mess: 'Không tìm thấy phòng.',
                };
                return req.session.save(() => res.redirect('/rooms/my-rooms'));
            }

            await roomService.updateStatus(id, 'Đang sử dụng');

            req.session.message = {
                type: 'success',
                mess: 'Check-in thành công. Phòng đã chuyển sang trạng thái Đang sử dụng.',
            };
        } catch (error) {
            console.error('Error checking in room:', error);
            req.session.message = {
                type: 'danger',
                mess: 'Không thể check-in. Vui lòng thử lại sau.',
            };
        }

        req.session.save(() => res.redirect('/rooms/my-rooms'));
    }

    // =============== CHECK-OUT (Đang sử dụng -> Hoàn thành kỳ) ===============
    static async checkOut(req, res) {
        const id = Number(req.params.id);
        const roomService = new RoomService();
        const revenueService = new RevenueService();

        try {
            if (!req.session.login || !req.session.login.maNguoiDung) {
                req.session.message = {
                    type: 'danger',
                    mess: 'Vui lòng đăng nhập.',
                };
                return req.session.save(() => res.redirect('/login.html'));
            }

            const room = await roomService.findById(id);

            if (!room) {
                req.session.message = {
                    type: 'danger',
                    mess: 'Không tìm thấy phòng.',
                };
                return req.session.save(() => res.redirect('/rooms/my-rooms'));
            }

            await roomService.updateStatus(id, 'Hoàn thành kỳ');

            function getVietnamDateTime() {
                const now = new Date();
                const vietnamTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));
                return vietnamTime.toISOString().replace("T", " ").slice(0, 19);
            }

            const formattedDate = getVietnamDateTime();
            console.log(formattedDate);

            const doanhThu = {
                NgayLap: formattedDate,
                DoanhThuTuPhong: room.Gia ?? 0,
                DoanhThuTuDichVu: 0,
                MoTa: `Doanh thu phòng số ${room.SoPhong} - Mã phòng ${room.MaPhong}`,
                TenDoanhThu: `Doanh thu phòng ${room.MaPhong}`,
            };

            await revenueService.create(doanhThu);

            req.session.message = {
                type: 'success',
                mess: 'Check-out thành công. Phòng đã chuyển sang Hoàn thành kỳ và doanh thu được ghi nhận.',
            };

        } catch (error) {
            console.error('Error checking out room:', error);

            req.session.message = {
                type: 'danger',
                mess: 'Không thể check-out. Vui lòng thử lại sau.',
            };
        }

        req.session.save(() => res.redirect('/rooms/my-rooms'));
    }

    static async cancelBooking(req, res) {
        try {
            const id = Number(req.params.id);
            const roomService = new RoomService();

            await roomService.updateStatus(id, 'Trống');

            req.session.message = {
                type: 'success',
                mess: `Đã hủy đặt phòng thành công!`
            };

            res.redirect('/rooms/my-rooms');
        } catch (error) {
            console.error(error);
            req.session.message = {
                type: 'danger',
                mess: 'Không thể hủy đặt phòng. Vui lòng thử lại.'
            };
            res.redirect('/rooms/my-rooms');
        }
    }

    static async resetRoom(req, res) {
        try {
            const id = Number(req.params.id);
            const roomService = new RoomService();

            await roomService.updateStatus(id, 'Trống');

            req.session.message = {
                type: 'success',
                mess: 'Phòng đã được đưa trở lại trạng thái TRỐNG.'
            };
            res.redirect('/rooms/my-rooms');

        } catch (error) {
            console.error(error);
            req.session.message = {
                type: 'danger',
                mess: 'Không thể cho đặt lại. Vui lòng thử lại.'
            };
            res.redirect('/rooms/my-rooms');
        }
    }
}

module.exports = RoomController;
