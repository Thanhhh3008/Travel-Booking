const pool = require('../database/client');
class ReviewService {
    async hasReviewed(roomId, userId) {
        const query = `
            SELECT 1
            FROM danhgia
            WHERE MaPhong = ? AND MaNguoiDung = ?
            LIMIT 1
        `;
        const [rows] = await pool.execute(query, [roomId, userId]);
        return rows.length > 0;
    }

    async create({ roomId, userId, rate, content }) {
        const query = `
            INSERT INTO danhgia (MaPhong, MaNguoiDung, SoSao, NoiDung)
            VALUES (?, ?, ?, ?)
        `;
        await pool.execute(query, [roomId, userId, rate, content]);
    }

    async getByRoom(roomId) {
        const query = `
            SELECT dg.*, nd.HoTen,nd.avartar
            FROM danhgia dg
            JOIN nguoidung nd ON dg.MaNguoiDung = nd.MaNguoiDung
            WHERE dg.MaPhong = ?
            ORDER BY dg.NgayDanhGia DESC
        `;
        const [rows] = await pool.execute(query, [roomId]);
        return rows;
    }
}

module.exports = ReviewService;
