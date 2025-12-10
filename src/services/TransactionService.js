const pool = require('../database/client');

class TransactionService {
    saveTranSacTion = async (data) => {
        try {
            const query = `
            INSERT INTO giaodich
            (
                MaNguoiDung,
                MaPhong,
                NgayThanhToan,
                TongTien
            )
            VALUES (?, ?, ?, ?)
            `;

            const params = [
                data.MaNguoiDung,
                data.MaPhong ?? null,
                data.NgayThanhToan,
                data.TongTien,

            ];

            const [result] = await pool.execute(query, params);
            return result.affectedRows > 0;
        } catch (err) {
            console.error('RoomService.update error:', err);
            throw err;
        }
    }
}

module.exports = TransactionService;
