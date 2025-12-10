const LoaiPhong = require('../models/loaiphong');
const pool = require('../database/client');

class CategoryRoomService {
    getAll = async (cond = '', params = []) => {
        try {
            let query = 'SELECT * FROM loaiphong';
            if (cond) {
                query += ` ${cond}`;
            }

            const [result] = await pool.execute(query, params);
            return result.map((row) => new LoaiPhong(
                row.MaLoaiPhong,
                row.DienTich,
                row.SoKhachToiDa,
                row.TenLoaiPhong,
                row.Gia,
                row.MoTa,
            ));
        } catch (err) {
            console.error(err);
            return [];
        }
    };

    findById = async (id) => {
        const categories = await this.getAll('WHERE MaLoaiPhong = ?', [id]);
        return categories.length ? categories[0] : null;
    };
}

module.exports = CategoryRoomService;
