// src/services/BookingService.js
const pool = require('../database/client');

class BookingService {
    async create(data) {
        const query = `
            INSERT INTO chitietdatphong
            (
                MaNguoiDung,
                MaPhong,
                PHONGMaPhong,
                NgayNhanPhong,
                NgayTraPhong,
                SoLuongKhach,
                TrangThai,
                MaKhuyenMai,
                TongTien,
                LichSu,
                DanhGia
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await pool.execute(query, [
            data.MaNguoiDung,
            data.MaPhong,
            data.MaPhong, // ✅ FIX: bắt buộc vì bảng bạn có cột PHONGMaPhong NOT NULL
            data.NgayNhanPhong,
            data.NgayTraPhong,
            data.SoLuongKhach,
            '0',      // bạn đang dùng '0' cho trạng thái hiện tại
            null,
            data.TongTien,
            'BOOKED', // ✅ thêm trạng thái booking vào LichSu
            null
        ]);

        return result.insertId;
    }

    /**
     * ✅ KIỂM TRA PHÒNG CÓ TRÙNG LỊCH KHÔNG
     * Overlap: NOT (oldCheckout <= newCheckin OR oldCheckin >= newCheckout)
     */
    async isRoomAvailable(roomId, checkinDate, checkoutDate) {
        const sql = `
            SELECT COUNT(*) AS total
            FROM chitietdatphong
            WHERE MaPhong = ?
              AND TrangThai = '0'
              AND NOT (
                NgayTraPhong <= ?
                OR NgayNhanPhong >= ?
              )
        `;
        const [rows] = await pool.execute(sql, [roomId, checkinDate, checkoutDate]);
        return Number(rows?.[0]?.total || 0) === 0;
    }

    /**
     *  LẤY DANH SÁCH NGÀY ĐÃ ĐƯỢC ĐẶT (để disable lịch)
     */
    async getBookedDates(roomId) {
    const sql = `
        SELECT
            DATE(NgayNhanPhong) AS startDate,
            DATE(NgayTraPhong) AS endDate
        FROM chitietdatphong
        WHERE MaPhong = ?
          AND TrangThai != 'Đã hoàn thành'
    `;

    const [rows] = await pool.execute(sql, [roomId]);

    const disabled = [];

    rows.forEach(r => {
        if (!r.startDate || !r.endDate) return;

        let cur = new Date(r.startDate);
        const end = new Date(r.endDate);

        while (cur < end) {
            disabled.push(cur.toISOString().split('T')[0]);
            cur.setDate(cur.getDate() + 1);
        }
    });

    return [...new Set(disabled)];
}

async markCompleted(bookingId) {
    const sql = `
        UPDATE chitietdatphong
        SET TrangThai = 'Đã hoàn thành'
        WHERE MaChiTietDatPhong = ?
    `;
    const [result] = await pool.execute(sql, [bookingId]);
    return result.affectedRows > 0;
}

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
                    cdp.LichSu,
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
                    cdp.LichSu,
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
                    cdp.LichSu,
                    p.SoPhong,
                    p.HinhAnh,
                    lp.TenLoaiPhong,
                    p.MaNguoiDung AS OwnerId,
                    p.TrangThaiPhong
                FROM chitietdatphong cdp
                JOIN phong p ON cdp.MaPhong = p.MaPhong
                JOIN loaiphong lp ON p.MaLoaiPhong = lp.MaLoaiPhong
                WHERE cdp.MaChiTietDatPhong = ${id}
            `;

            const [rows] = await pool.execute(query);
            return rows[0];
        } catch (err) {
            console.error('BookingService.getBookingByiD error:', err);
            return null;
        }
    }

    // =====================================================
    //  LẤY TẤT CẢ ĐƠN ĐẶT CỦA CÁC PHÒNG THUỘC CHỦ PHÒNG
    // =====================================================
    async getOwnerBookings(ownerId) {
    try {
        const sql = `
            SELECT
                cdp.MaChiTietDatPhong,
                cdp.MaNguoiDung,
                nd.Username ,
                cdp.MaPhong,
                cdp.NgayNhanPhong,
                cdp.NgayTraPhong,
                cdp.SoLuongKhach,
                cdp.TrangThai,
                cdp.TongTien,
                cdp.LichSu,

                p.SoPhong,
                p.HinhAnh,
                p.TrangThaiPhong,

                lp.TenLoaiPhong
            FROM chitietdatphong cdp
            JOIN phong p ON cdp.MaPhong = p.MaPhong
            JOIN loaiphong lp ON p.MaLoaiPhong = lp.MaLoaiPhong
            JOIN nguoidung nd ON cdp.MaNguoiDung = nd.MaNguoiDung
            WHERE p.MaNguoiDung = ?
            ORDER BY cdp.NgayNhanPhong DESC
        `;

        const [rows] = await pool.execute(sql, [ownerId]);
        return rows || [];

    } catch (err) {
        console.error('BookingService.getOwnerBookings error:', err);
        return [];
    }
}


    //  UPDATE TRẠNG THÁI BOOKING (lưu vào LichSu)
    // =====================================================
    async updateBookingLifeStatus(bookingId, newLifeStatus) {
        try {
            const sql = `
                UPDATE chitietdatphong
                SET LichSu = ?
                WHERE MaChiTietDatPhong = ?
            `;
            const [rs] = await pool.execute(sql, [newLifeStatus, bookingId]);
            return rs.affectedRows > 0;
        } catch (err) {
            console.error('BookingService.updateBookingLifeStatus error:', err);
            return false;
        }
    }
}

module.exports = BookingService;
