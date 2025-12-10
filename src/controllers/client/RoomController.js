// src/controllers/client/RoomController.js

const fs = require('fs');
const path = require('path');
const CategoryRoomService = require('../../services/CategoryRoomService');
const RoomService = require('../../services/RoomService');
const ThongBao = require('../../models/admin/ThongBao');
const User = require('../../models/admin/NguoiDung');
class RoomController {
    // =============== TRANG DANH SÁCH PHÒNG ===============
    static async index(req, res) {
        console.log("LOGIN SESSION:", req.session.login);

        const message = req.session.message;
        delete req.session.message;
const thongbao = req.session.login  ? await ThongBao.getByUser(req.session.login.maNguoiDung) : [];
 let currentUser = null;
        if(req.session.login)
            console.log("ma nguoi dung",req.session.login.maNguoiDung)
            if (req.session.login) {
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
                currentUser:[],
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
const thongbao = req.session.login  ? await ThongBao.getByUser(req.session.login.maNguoiDung) : [];
 let currentUser = null;
 if(req.session.login)
            console.log("ma nguoi dung",req.session.login.maNguoiDung)
            if (req.session.login) {
                currentUser = await User.getById(req.session.login.maNguoiDung);
      }
        try {
            const categoryRoomService = new CategoryRoomService();
            const roomTypes = await categoryRoomService.getAll();

            res.render('client/home/add-room', { message, roomTypes,thongbao,currentUser });
        } catch (error) {
            console.error('Error loading add room form:', error);
            res.status(500).send('Internal Server Error');
        }
    }

static async listByCity(req, res) {
    const thongbao = req.session.login  ? await ThongBao.getByUser(req.session.login.maNguoiDung) : [];
    let currentUser = null;
    if(req.session.login)
            console.log("ma nguoi dung",req.session.login.maNguoiDung)
            if (req.session.login) {
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
            thongbao,currentUser
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
        // ======== KIỂM TRA LOGIN ========
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

        // ======== VALIDATE CƠ BẢN ========
        if (!SoPhong || !MaLoaiPhong || !Gia) {
            throw new Error('Vui lòng nhập đầy đủ Số phòng, Loại phòng và Giá.');
        }

        // Parse
        const parsedLoaiPhong  = Number(MaLoaiPhong);
        const parsedGia        = Number(Gia);
        const parsedTang       = ViTriTang ? Number(ViTriTang) : null;
        const parsedRating     = Rating ? Number(Rating) : null;
        const parsedThietBi    = MaThietBi ? Number(MaThietBi) : null;

        // Validate
        if (!Number.isInteger(parsedLoaiPhong) || parsedLoaiPhong <= 0)
            throw new Error('Loại phòng không hợp lệ.');

        if (!Number.isFinite(parsedGia) || parsedGia <= 0)
            throw new Error('Giá phòng phải là số lớn hơn 0.');

        if (parsedTang !== null && (!Number.isInteger(parsedTang) || parsedTang < 0))
            throw new Error('Vị trí tầng phải là số nguyên không âm.');

        if (parsedRating !== null && (parsedRating < 0 || parsedRating > 5))
            throw new Error('Đánh giá phải nằm trong khoảng từ 0 đến 5.');

        // ======== LẤY DANH SÁCH ẢNH ========
        const imagesPhong = req.files?.HinhAnh
            ? req.files.HinhAnh.map(f => f.filename).join(',')
            : null;

        const imagesGiayTo = req.files?.GiayToPhong
            ? req.files.GiayToPhong.map(f => f.filename).join(',')
            : null;

        // ======== LƯU DB ========
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

        // ======== XOÁ FILE KHI LỖI ========
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

    // Lưu session + redirect
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
         if(req.session.login)
            console.log("ma nguoi dung",req.session.login.maNguoiDung)
            if (req.session.login) {
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

            // ảnh mới nếu có, còn không giữ ảnh cũ
            const newImagePath = req.file ? `/uploads/${req.file.filename}` : oldRoom.HinhAnh;

            const updated = await roomService.update(id, {
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
                // xóa ảnh cũ nếu có ảnh mới
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

            // nếu upload ảnh mới mà bị lỗi thì xoá file mới
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
const thongbao = req.session.login  ? await ThongBao.getByUser(req.session.login.maNguoiDung) : [];
 let currentUser = null;
 if(req.session.login)
            console.log("ma nguoi dung",req.session.login.maNguoiDung)
            if (req.session.login) {
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
}

module.exports = RoomController;
