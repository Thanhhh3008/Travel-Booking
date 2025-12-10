// src/services/RevenueService.js
const DoanhThu = require('../models/doanhthu');
const pool = require('../database/client');

class RevenueService {
    // Lấy tất cả bản ghi doanh thu
    getAll = async (cond = '', params = []) => {
        try {
            let query = 'SELECT * FROM doanhthu';
            if (cond) {
                query += ` ${cond}`;
            }

            // Nếu cond không có ORDER BY thì tự thêm
            if (!/order by/i.test(cond || '')) {
                query += ' ORDER BY MaDoanhThu DESC';
            }

            const [rows] = await pool.execute(query, params);
            return rows.map((row) => new DoanhThu(
                row.MaDoanhThu,
                row.NgayLap,
                row.DoanhThuTuPhong,
                row.DoanhThuTuDichVu,
                row.MoTa,
                row.TenDoanhThu
            ));
        } catch (err) {
            console.error('RevenueService.getAll error:', err);
            return [];
        }
    };

    // Tìm theo id
    findById = async (id) => {
        const list = await this.getAll('WHERE MaDoanhThu = ?', [id]);
        return list.length ? list[0] : null;
    };

    // Thêm mới
    create = async (data) => {
        try {
            const query = `
                INSERT INTO doanhthu
                    (NgayLap, DoanhThuTuPhong, DoanhThuTuDichVu, MoTa, TenDoanhThu)
                VALUES
                    (?, ?, ?, ?, ?)
            `;

            const params = [
                data.NgayLap ?? null,
                data.DoanhThuTuPhong ?? null,
                data.DoanhThuTuDichVu ?? null,
                data.MoTa ?? null,
                data.TenDoanhThu ?? null,
            ];

            const [result] = await pool.execute(query, params);
            return result.insertId;
        } catch (err) {
            console.error('RevenueService.create error:', err);
            throw err;
        }
    };

    // Cập nhật
    update = async (id, data) => {
        try {
            const query = `
                UPDATE doanhthu
                SET NgayLap = ?,
                    DoanhThuTuPhong = ?,
                    DoanhThuTuDichVu = ?,
                    MoTa = ?,
                    TenDoanhThu = ?
                WHERE MaDoanhThu = ?
            `;

            const params = [
                data.NgayLap ?? null,
                data.DoanhThuTuPhong ?? null,
                data.DoanhThuTuDichVu ?? null,
                data.MoTa ?? null,
                data.TenDoanhThu ?? null,
                id,
            ];

            const [result] = await pool.execute(query, params);
            return result.affectedRows;
        } catch (err) {
            console.error('RevenueService.update error:', err);
            throw err;
        }
    };
}

module.exports = RevenueService;
