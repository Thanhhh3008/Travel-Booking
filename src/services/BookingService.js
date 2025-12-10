const pool = require('../database/client');

class BookingService {
    async create(data) {

        // console.log(data)
        const query = `
            INSERT INTO chitietdatphong
            (
                MaNguoiDung,
                MaPhong,
                NgayNhanPhong,
                NgayTraPhong,
                SoLuongKhach,
                TrangThai,
                MaKhuyenMai,
                TongTien,
                LichSu,
                DanhGia
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        // const rawParams = [
        //     data.MaNguoiDung,                 // MaNguoiDung - BẮT BUỘC PHẢI CÓ
        //     data.MaPhong,                     // MaPhong
        //     data.NgayNhanPhong,               // NgayNhanPhong
        //     data.NgayTraPhong,                // NgayTraPhong
        //     data.SoLuongKhach || 1,           // SoLuongKhach
        //     // data.SoLuongPhong || 1,           // SoLuongPhong
        //     data.TrangThai || 0,      // TrangThai
        //     data.MaKhuyenMai || null,         // MaKhuyenMai
        //     data.TongTien || 0,               // TongTien
        //     null,                             // LichSu
        //     null,                             // DanhGia
        // ];

        // Không cho undefined xuống MySQL
        // const params = rawParams.map((p) => (p === undefined ? null : p));

        const [result] = await pool.execute(query, [data.MaNguoiDung, data.MaPhong, data.NgayNhanPhong, data.NgayTraPhong, data.SoLuongKhach, 0, null, data.TongTien, null, null]);
        return result.insertId;
    }

    /**
     * Lấy lịch sử đặt phòng của người dùng
     * @param {number} userId - MaNguoiDung
     * @returns {Promise<Array>} Danh sách booking
     */
    async getBookingHistory(userId, stas) {
        try {
            let query = `
                SELECT
                    cdp.MaChiTietDatPhong,
                    cdp.MaNguoiDung,
                    cdp.MaPhong,
                    cdp.NgayNhanPhong,
                    cdp.NgayTraPhong,
                    cdp.SoLuongKhach,
                    cdp.TrangThai,
                    cdp.TongTien,
                    p.SoPhong,
                    p.HinhAnh,
                    lp.TenLoaiPhong
                FROM chitietdatphong cdp
                JOIN phong p ON cdp.MaPhong = p.MaPhong
                JOIN loaiphong lp ON p.MaLoaiPhong = lp.MaLoaiPhong
                WHERE cdp.MaNguoiDung = ${userId}
                ORDER BY cdp.NgayNhanPhong DESC
            `;

            if (stas) {
                query = `
                SELECT
                    cdp.MaChiTietDatPhong,
                    cdp.MaNguoiDung,
                    cdp.MaPhong,
                    cdp.NgayNhanPhong,
                    cdp.NgayTraPhong,
                    cdp.SoLuongKhach,
                    cdp.TrangThai,
                    cdp.TongTien,
                    p.SoPhong,
                    p.HinhAnh,
                    lp.TenLoaiPhong
                FROM chitietdatphong cdp
                JOIN phong p ON cdp.MaPhong = p.MaPhong
                JOIN loaiphong lp ON p.MaLoaiPhong = lp.MaLoaiPhong
                WHERE cdp.MaNguoiDung = ${userId} AND cdp.TrangThai = ${stas}
                ORDER BY cdp.NgayNhanPhong DESC`;
            }

            const [rows] = await pool.execute(query, [userId]);
            return rows;
        } catch (err) {
            console.error('BookingService.getBookingHistory error:', err);
            return [];
        }
    }

    /**
     * Cập nhật trạng thái thanh toán
     * @param {number} bookingId - MaChiTietDatPhong
     * @param {number} userId - MaNguoiDung
     * @returns {Promise<boolean>}
     */
    async updatePaymentStatus(bookingId, userId) {
        try {
            const query = `
                UPDATE chitietdatphong
                SET TrangThai = 1
                WHERE MaChiTietDatPhong = ? AND MaNguoiDung = ?
                    `;

            const [result] = await pool.execute(query, [bookingId, userId]);
            return result.affectedRows > 0;
        } catch (err) {
            console.error('BookingService.updatePaymentStatus error:', err);
            throw err;
        }
    }


    async getBookingByiD(id) {
        try {
            let query = `
                SELECT
                    cdp.MaChiTietDatPhong,
                    cdp.MaNguoiDung,
                    cdp.MaPhong,
                    cdp.NgayNhanPhong,
                    cdp.NgayTraPhong,
                    cdp.SoLuongKhach,
                    cdp.TrangThai,
                    cdp.TongTien,
                    p.SoPhong,
                    p.HinhAnh,
                    lp.TenLoaiPhong
                FROM chitietdatphong cdp
                JOIN phong p ON cdp.MaPhong = p.MaPhong
                JOIN loaiphong lp ON p.MaLoaiPhong = lp.MaLoaiPhong
                WHERE cdp.MaChiTietDatPhong = ${id}
            `;

            const [rows] = await pool.execute(query);
            return rows[0];
        } catch (err) {
            console.error('BookingService.getBookingHistory error:', err);
            return [];
        }
    }

}

module.exports = BookingService;
