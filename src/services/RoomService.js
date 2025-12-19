// src/services/RoomService.js

const Phong = require('../models/phong');
const pool = require('../database/client');

class RoomService {
    /**
     * Lấy danh sách phòng (kèm thông tin loại phòng)
     * @param {string} cond  - điều kiện bổ sung cho câu query (VD: 'WHERE p.MaPhong = ?')
     * @param {Array} params - mảng tham số truyền cho câu query
     * @returns {Promise<Phong[]>}
     */
    getAll = async (cond = '', params = []) => {
        try {
            let query = `
                SELECT
                    p.MaPhong,
                    p.SoPhong,
                    p.ViTriTang,
                    p.TrangThaiPhong,
                    p.MaLoaiPhong,
                    p.View,
                    p.DiaChi,
                    p.Rating,
                    p.MoTa,
                    p.HinhAnh,
                    p.MaThietBi,
                    p.MaNguoiDung,
                    p.gia AS GiaPhong,
                    p.ThanhPho,
                    p.TenChoO,
                    lp.TenLoaiPhong
                FROM phong p
                JOIN loaiphong lp ON p.MaLoaiPhong = lp.MaLoaiPhong
            `;

            if (cond && cond.trim() !== '') {
                query += ` ${cond}`;
            }

            query += ' ORDER BY p.MaPhong DESC';

            const [rows] = await pool.execute(query, params);

            return rows.map((row) => {
                const room = new Phong(
                    row.MaPhong,
                    row.SoPhong,
                    row.ViTriTang,
                    row.TrangThaiPhong,
                    row.MaLoaiPhong,
                    row.View,
                    row.DiaChi,
                    row.Rating,
                    row.MoTa,
                    row.HinhAnh,
                    row.MaThietBi,
                    row.MaNguoiDung
                );
                room.ThanhPho = row.ThanhPho;
                room.TenChoO = row.TenChoO;
                room.TenLoaiPhong = row.TenLoaiPhong;
                room.Gia = row.GiaPhong ?? null;

                return room;
            });
        } catch (err) {
            console.error('RoomService.getAll error:', err);
            return [];
        }
    };

    /**
     * Lấy tất cả phòng của 1 người dùng
     * @param {number} ownerId
     */
    getByOwner = async (ownerId) => {
        return this.getAll('WHERE p.MaNguoiDung = ?', [ownerId]);
    };

    /**
     * Tìm phòng theo MaPhong (không check chủ)
     * @param {number} id
     */
    findById = async (id) => {
    try {
        const query = `
            SELECT 
                p.*,
                lp.TenLoaiPhong,
                nd.Username,
                nd.HoTen,
                nd.Email,
                p.gia AS GiaPhong,
                p.TenChoO,
                p.ThanhPho,
                p.MaNguoiDung,
                nd.avartar
            FROM phong p
            JOIN loaiphong lp ON p.MaLoaiPhong = lp.MaLoaiPhong
            JOIN nguoidung nd ON p.MaNguoiDung = nd.MaNguoiDung
            WHERE p.MaPhong = ?
        `;

        const [rows] = await pool.execute(query, [id]);

        if (!rows.length) return null;

        const row = rows[0];

        const room = new Phong(
            row.MaPhong,
            row.SoPhong,
            row.ViTriTang,
            row.TrangThaiPhong,
            row.MaLoaiPhong,
            row.View,
            row.DiaChi,
            row.Rating,
            row.MoTa,
            row.HinhAnh,
            row.MaThietBi,
            row.MaNguoiDung,
            
        );s
        //
        room.Email = row.Email
        room.TenLoaiPhong = row.TenLoaiPhong;
        room.Gia = row.GiaPhong ?? null;
        room.Username = row.Username;
        room.HoTen = row.HoTen;       
        room.TenChoO = row.TenChoO;  
        room.ThanhPho = row.ThanhPho;  
        room.MaNguoiDung = row.MaNguoiDung; 
        room.TrangThaiPhong = row.TrangThaiPhong; 
        room.avartar = row.avartar; 
        return room;

    } catch (err) {
        console.error("RoomService.findById error:", err);
        return null;
    }
};


    /**
     * Tìm phòng theo MaPhong & MaNguoiDung (chỉ chủ phòng)
     * @param {number} id
     * @param {number} ownerId
     */
    findByIdForOwner = async (id, ownerId) => {
        const rooms = await this.getAll(
            'WHERE p.MaPhong = ? AND p.MaNguoiDung = ?',
            [id, ownerId]
        );
        return rooms.length ? rooms[0] : null;
    };

    /**
     * @param {Object} data
     * @returns {Promise<number>} 
     */
   create = async (data) => {
    try {
        const query = `
            INSERT INTO phong (
                SoPhong,
                ViTriTang,
                TrangThaiPhong,
                MaLoaiPhong,
                View,
                DiaChi,
                ThanhPho,
                Rating,
                Gia,
                MoTa,
                GiayToPhong,
                HinhAnh,
                MaThietBi,
                MaNguoiDung
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const params = [
            data.SoPhong,
            data.ViTriTang ?? null,
            data.TrangThaiPhong ?? 'Chờ xét duyệt',
            data.MaLoaiPhong,
            data.View ?? null,
            data.DiaChi ?? null,
            data.ThanhPho ?? null,   
            data.Rating ?? null,
            data.Gia ?? null,
            data.MoTa ?? null,
            data.GiayToPhong ?? null,
            data.HinhAnh ?? null,
            data.MaThietBi ?? null,
            data.MaNguoiDung,
        ];

        const [result] = await pool.execute(query, params);
        return result.insertId;
    } catch (err) {
        console.error('RoomService.create error:', err);
        throw err;
    }
};

    /**
     * @param {number} id       
     * @param {number} ownerId  
     * @param {Object} data
     * @returns {Promise<boolean>}
     */
    update = async (id, ownerId, data) => {
        try {
            const query = `
                UPDATE phong
                SET
                    SoPhong = ?,
                    ViTriTang = ?,
                    TrangThaiPhong = ?,
                    MaLoaiPhong = ?,
                    View = ?,
                    DiaChi = ?,
                    Rating = ?,
                    gia = ?,
                    MoTa = ?,
                    HinhAnh = ?,
                    MaThietBi = ?
                WHERE MaPhong = ? AND MaNguoiDung = ?
            `;

            const params = [
                data.SoPhong,
                data.ViTriTang ?? null,
                data.TrangThaiPhong,
                data.MaLoaiPhong,
                data.View ?? null,
                data.DiaChi ?? null,
                data.Rating ?? null,
                data.Gia ?? null,
                data.MoTa ?? null,
                data.HinhAnh ?? null,
                data.MaThietBi ?? null,
                id,
                ownerId,
            ];

            const [result] = await pool.execute(query, params);
            return result.affectedRows > 0;
        } catch (err) {
            console.error('RoomService.update error:', err);
            throw err;
        }
    };
delete = async (id) => {
    try {
        const query = `
            DELETE FROM phong
            WHERE MaPhong = ?
        `;

        const [result] = await pool.execute(query, [id]);

        return result.affectedRows > 0;
    } catch (err) {
        console.error('RoomService.delete error:', err);
        throw err;
    }
};

async updateRating(roomId) {
    const query = `
        UPDATE phong
        SET
            Rating = (
                SELECT AVG(SoSao)
                FROM danhgia
                WHERE MaPhong = ?
            ),
            SoLuotDanhGia = (
                SELECT COUNT(*)
                FROM danhgia
                WHERE MaPhong = ?
            )
        WHERE MaPhong = ?
    `;
    await pool.execute(query, [roomId, roomId, roomId]);
}

    /**
     * Cập nhật trạng thái phòng theo ID
     * @param {number} id - MaPhong
     * @param {string} newStatus - Trạng thái mới ('Trống', 'Đã đặt', 'Đang sử dụng', etc.)
     * @returns {Promise<boolean>}
     */
    updateStatus = async (id, newStatus) => {
        try {
            const query = `
                UPDATE phong
                SET TrangThaiPhong = ?
                WHERE MaPhong = ?
            `;

            const params = [newStatus, id];

            const [result] = await pool.execute(query, params);
            return result.affectedRows > 0;
        } catch (err) {
            console.error('RoomService.updateStatus error:', err);
            throw err;
        }
    };
    /**
     * Tìm kiếm và lọc phòng
     * @param {Object} filters - Các tiêu chí lọc
     * @returns {Promise<Array>}
     */
    searchAndFilter = async (filters = {}) => {
        try {
            let conditions = ["p.TrangThaiPhong = 'Trống'"];
            let params = [];

            // Tìm theo từ khóa (tên phòng, địa chỉ, mô tả)
            if (filters.keyword && filters.keyword.trim()) {
                conditions.push("(p.SoPhong LIKE ? OR p.DiaChi LIKE ? OR p.MoTa LIKE ? OR lp.TenLoaiPhong LIKE ?)");
                const kw = `%${filters.keyword.trim()}%`;
                params.push(kw, kw, kw, kw);
            }

            // Lọc theo thành phố
            if (filters.city && filters.city.trim()) {
                conditions.push("p.DiaChi LIKE ?");
                params.push(`%${filters.city.trim()}%`);
            }

            // Lọc theo loại phòng
            if (filters.roomType && filters.roomType !== '') {
                conditions.push("p.MaLoaiPhong = ?");
                params.push(filters.roomType);
            }

            // Lọc theo khoảng giá
            if (filters.minPrice && !isNaN(filters.minPrice)) {
                conditions.push("p.gia >= ?");
                params.push(parseFloat(filters.minPrice));
            }
            if (filters.maxPrice && !isNaN(filters.maxPrice)) {
                conditions.push("p.gia <= ?");
                params.push(parseFloat(filters.maxPrice));
            }

            // Lọc theo rating tối thiểu
            if (filters.minRating && !isNaN(filters.minRating)) {
                conditions.push("p.Rating >= ?");
                params.push(parseFloat(filters.minRating));
            }

            let query = `
                SELECT
                    p.MaPhong,
                    p.SoPhong,
                    p.ViTriTang,
                    p.TrangThaiPhong,
                    p.MaLoaiPhong,
                    p.View,
                    p.DiaChi,
                    p.Rating,
                    p.MoTa,
                    p.HinhAnh,
                    p.MaThietBi,
                    p.MaNguoiDung,
                    p.gia AS GiaPhong,
                    lp.TenLoaiPhong
                FROM phong p
                JOIN loaiphong lp ON p.MaLoaiPhong = lp.MaLoaiPhong
                WHERE ${conditions.join(' AND ')}
            `;

            // Sắp xếp
            if (filters.sortBy) {
                switch (filters.sortBy) {
                    case 'price_asc':
                        query += ' ORDER BY p.gia ASC';
                        break;
                    case 'price_desc':
                        query += ' ORDER BY p.gia DESC';
                        break;
                    case 'rating_desc':
                        query += ' ORDER BY p.Rating DESC';
                        break;
                    default:
                        query += ' ORDER BY p.MaPhong DESC';
                }
            } else {
                query += ' ORDER BY p.MaPhong DESC';
            }

            const [rows] = await pool.execute(query, params);

            return rows.map((row) => {
                const room = new Phong(
                    row.MaPhong,
                    row.SoPhong,
                    row.ViTriTang,
                    row.TrangThaiPhong,
                    row.MaLoaiPhong,
                    row.View,
                    row.DiaChi,
                    row.Rating,
                    row.MoTa,
                    row.HinhAnh,
                    row.MaThietBi,
                    row.MaNguoiDung
                );
                room.TenLoaiPhong = row.TenLoaiPhong;
                room.Gia = row.GiaPhong ?? null;
                return room;
            });
        } catch (err) {
            console.error('RoomService.searchAndFilter error:', err);
            return [];
        }
    };

    /**
     * Lấy danh sách thành phố có phòng
     */
    getCities = async () => {
        try {
            const [rows] = await pool.execute(`
                SELECT DISTINCT 
                    SUBSTRING_INDEX(DiaChi, ',', -1) AS City
                FROM phong 
                WHERE DiaChi IS NOT NULL AND TrangThaiPhong = 'Trống'
                ORDER BY City
            `);
            return rows.map(r => r.City?.trim()).filter(Boolean);
        } catch (err) {
            console.error('RoomService.getCities error:', err);
            return [];
        }
    };

    /**
     * Lấy danh sách tất cả thành phố từ DB (từ trường ThanhPho)
     * @returns {Promise<string[]>}
     */
    getAllCities = async () => {
        try {
            const [rows] = await pool.execute(`
                SELECT DISTINCT ThanhPho
                FROM phong 
                WHERE ThanhPho IS NOT NULL 
                    AND ThanhPho != ''
                    AND TrangThaiPhong = 'Đang hoạt động'
                ORDER BY ThanhPho
            `);
            return rows.map(r => r.ThanhPho?.trim()).filter(Boolean);
        } catch (err) {
            console.error('RoomService.getAllCities error:', err);
            return [];
        }
    };


}

module.exports = RoomService;
