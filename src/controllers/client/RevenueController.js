const RevenueService = require('../../services/RevenueService');
const ThongBao = require('../../models/admin/ThongBao');
const User = require('../../models/admin/NguoiDung');
class RevenueController {
    // =============== TRANG DANH SÁCH DOANH THU ===============
    static async index(req, res) {
        const message = req.session.message;
        delete req.session.message;
const thongbao = req.session.login  ? await ThongBao.getByUser(req.session.login.maNguoiDung) : [];
 let currentUser = null;
            console.log("ma nguoi dung",req.session.login.maNguoiDung)
            if (req.session.login) {
                currentUser = await User.getById(req.session.login.maNguoiDung);
      }
        try {
            const revenueService = new RevenueService();
            const revenues = await revenueService.getAll();

            res.render('client/home/list-revenue', {
                message,
                revenues,
                thongbao, 
                currentUser,
                helpers: {
                    formatMoney: (value) =>
                        (value || 0).toLocaleString('vi-VN', {
                            style: 'currency',
                            currency: 'VND',
                            maximumFractionDigits: 0,
                        }),
                    formatDateTime: (value) => {
                        if (!value) return '';
                        const d = new Date(value);
                        return d.toLocaleString('vi-VN');
                    },
                    calcTotal: (r) =>
                        (Number(r.DoanhThuTuPhong || 0) +
                            Number(r.DoanhThuTuDichVu || 0)),
                },
            });
        } catch (error) {
            console.error('Error loading revenue list:', error);

            res.render('client/home/list-revenue', {
                message: {
                    type: 'danger',
                    mess: 'Không thể tải danh sách doanh thu. Vui lòng thử lại sau.',
                },
                revenues: [],
                currentUser:[],
                helpers: {
                    formatMoney: (value) =>
                        (value || 0).toLocaleString('vi-VN', {
                            style: 'currency',
                            currency: 'VND',
                            maximumFractionDigits: 0,
                        }),
                    formatDateTime: () => '',
                    calcTotal: () => 0,
                },
            });
        }
    }

    // =============== FORM THÊM DOANH THU ===============
    static async createView(req, res) {
        const message = req.session.message;
        delete req.session.message;
        
        res.render('client/home/add-revenue', { message });
    }

    // =============== LƯU DOANH THU MỚI ===============
    static async store(req, res) {
        const revenueService = new RevenueService();
        const {
            TenDoanhThu,
            NgayLap,
            DoanhThuTuPhong,
            DoanhThuTuDichVu,
            MoTa,
        } = req.body;

        let redirectPath = '/revenues';

        try {
            if (!TenDoanhThu) {
                throw new Error('Vui lòng nhập Tên doanh thu.');
            }

            const parsedPhong = DoanhThuTuPhong ? Number(DoanhThuTuPhong) : 0;
            const parsedDichVu = DoanhThuTuDichVu ? Number(DoanhThuTuDichVu) : 0;

            if (parsedPhong < 0 || parsedDichVu < 0) {
                throw new Error('Doanh thu phải là số không âm.');
            }

            // Nếu dùng input type="datetime-local": 2025-11-26T19:30
            let ngayLapDb = null;
            if (NgayLap) {
                const d = new Date(NgayLap);
                if (Number.isNaN(d.getTime())) {
                    throw new Error('Ngày lập không hợp lệ.');
                }
                ngayLapDb = d.toISOString().slice(0, 19).replace('T', ' ');
            }

            await revenueService.create({
                TenDoanhThu,
                NgayLap: ngayLapDb,
                DoanhThuTuPhong: parsedPhong,
                DoanhThuTuDichVu: parsedDichVu,
                MoTa,
            });

            req.session.message = {
                mess: 'Thêm doanh thu thành công.',
                type: 'success',
            };
        } catch (error) {
            console.error('Error saving revenue:', error);
            req.session.message = {
                mess: error.message || 'Không thể thêm doanh thu. Vui lòng thử lại sau.',
                type: 'danger',
            };
            redirectPath = '/revenues/add';
        }

        req.session.save(() => {
            res.redirect(redirectPath);
        });
    }

    // =============== FORM SỬA DOANH THU ===============
    static async editView(req, res) {
        const message = req.session.message;
        delete req.session.message;

        const id = Number(req.params.id);
        const revenueService = new RevenueService();

        try {
            const revenue = await revenueService.findById(id);
            if (!revenue) {
                req.session.message = {
                    type: 'danger',
                    mess: 'Không tìm thấy bản ghi doanh thu.',
                };
                return req.session.save(() => res.redirect('/revenues'));
            }

            // Chuẩn bị NgayLap cho input datetime-local (format: YYYY-MM-DDTHH:MM)
            let ngayLapInput = '';
            if (revenue.NgayLap) {
                const d = new Date(revenue.NgayLap);
                const iso = d.toISOString().slice(0, 16); // 2025-11-26T19:30
                ngayLapInput = iso;
            }

            res.render('client/home/edit-revenue', {
                message,
                revenue,
                ngayLapInput,
            });
        } catch (error) {
            console.error('Error loading revenue edit form:', error);
            req.session.message = {
                type: 'danger',
                mess: 'Đã xảy ra lỗi khi tải form chỉnh sửa.',
            };
            req.session.save(() => res.redirect('/revenues'));
        }
    }

    // =============== CẬP NHẬT DOANH THU ===============
    static async update(req, res) {
        const id = Number(req.params.id);
        const revenueService = new RevenueService();

        const {
            TenDoanhThu,
            NgayLap,
            DoanhThuTuPhong,
            DoanhThuTuDichVu,
            MoTa,
        } = req.body;

        let redirectPath = '/revenues';

        try {
            if (!TenDoanhThu) {
                throw new Error('Vui lòng nhập Tên doanh thu.');
            }

            const parsedPhong = DoanhThuTuPhong ? Number(DoanhThuTuPhong) : 0;
            const parsedDichVu = DoanhThuTuDichVu ? Number(DoanhThuTuDichVu) : 0;

            if (parsedPhong < 0 || parsedDichVu < 0) {
                throw new Error('Doanh thu phải là số không âm.');
            }

            let ngayLapDb = null;
            if (NgayLap) {
                const d = new Date(NgayLap);
                if (Number.isNaN(d.getTime())) {
                    throw new Error('Ngày lập không hợp lệ.');
                }
                ngayLapDb = d.toISOString().slice(0, 19).replace('T', ' ');
            }

            const affected = await revenueService.update(id, {
                TenDoanhThu,
                NgayLap: ngayLapDb,
                DoanhThuTuPhong: parsedPhong,
                DoanhThuTuDichVu: parsedDichVu,
                MoTa,
            });

            if (!affected) {
                throw new Error('Không tìm thấy bản ghi để cập nhật.');
            }

            req.session.message = {
                mess: 'Cập nhật doanh thu thành công.',
                type: 'success',
            };
        } catch (error) {
            console.error('Error updating revenue:', error);
            req.session.message = {
                mess: error.message || 'Không thể cập nhật doanh thu. Vui lòng thử lại sau.',
                type: 'danger',
            };
            redirectPath = `/revenues/${id}/edit`;
        }

        req.session.save(() => {
            res.redirect(redirectPath);
        });
    }
}

module.exports = RevenueController;
