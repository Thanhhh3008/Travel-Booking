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
                p.gia AS GiaPhong
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
            row.MaNguoiDung
        );

        room.TenLoaiPhong = row.TenLoaiPhong;
        room.Gia = row.GiaPhong ?? null;
        room.Username = row.Username;   
        room.TenChoO = row.TenChoO;
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
            INSERT INTO phong
                (SoPhong, ViTriTang, TrangThaiPhong, MaLoaiPhong, View, DiaChi,
                 Rating, Gia, MoTa, GiayToPhong, HinhAnh, MaThietBi, MaNguoiDung)
            VALUES
                (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const params = [
            data.SoPhong,
            data.ViTriTang ?? null,
            data.TrangThaiPhong ?? 'Chờ xét duyệt',
            data.MaLoaiPhong,
            data.View ?? null,
            data.DiaChi ?? null,
            data.Rating ?? null,
            data.Gia ?? null,
            data.MoTa ?? null,
            data.GiayToPhong ?? null,   // <── thêm đúng vị trí
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

}

module.exports = RoomService;
