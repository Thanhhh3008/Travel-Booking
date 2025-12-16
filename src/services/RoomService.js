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
     * ✅ NEW: Lấy phòng của owner + danh sách đơn đặt (chitietdatphong)
     * Mỗi phòng có thể có nhiều booking.
     */
    getOwnerRoomsWithBookings = async (ownerId) => {
        try {
            const query = `
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
                    lp.TenLoaiPhong,

                    ctdp.MaChiTietDatPhong,
                    ctdp.MaNguoiDung AS BookingUserId,
                    ctdp.NgayNhanPhong,
                    ctdp.NgayTraPhong,
                    ctdp.SoLuongKhach,
                    ctdp.TrangThai AS TrangThaiDat,
                    ctdp.MaKhuyenMai,
                    ctdp.TongTien,
                    ctdp.LichSu,
                    ctdp.DanhGia
                FROM phong p
                JOIN loaiphong lp ON p.MaLoaiPhong = lp.MaLoaiPhong
                LEFT JOIN chitietdatphong ctdp 
                    ON ctdp.MaPhong = p.MaPhong
                WHERE p.MaNguoiDung = ?
                ORDER BY 
                    p.MaPhong DESC,
                    ctdp.NgayNhanPhong DESC,
                    ctdp.MaChiTietDatPhong DESC
            `;

            const [rows] = await pool.execute(query, [ownerId]);

            // Gom rows thành rooms[], mỗi room có bookings[]
            const map = new Map();

            for (const r of rows) {
                if (!map.has(r.MaPhong)) {
                    map.set(r.MaPhong, {
                        MaPhong: r.MaPhong,
                        SoPhong: r.SoPhong,
                        ViTriTang: r.ViTriTang,
                        TrangThaiPhong: r.TrangThaiPhong,
                        MaLoaiPhong: r.MaLoaiPhong,
                        View: r.View,
                        DiaChi: r.DiaChi,
                        Rating: r.Rating,
                        MoTa: r.MoTa,
                        HinhAnh: r.HinhAnh,
                        MaThietBi: r.MaThietBi,
                        MaNguoiDung: r.MaNguoiDung,
                        Gia: r.GiaPhong ?? null,
                        ThanhPho: r.ThanhPho,
                        TenChoO: r.TenChoO,
                        TenLoaiPhong: r.TenLoaiPhong,
                        bookings: [],
                    });
                }

                // Nếu có booking thì push vào bookings
                if (r.MaChiTietDatPhong != null) {
                    map.get(r.MaPhong).bookings.push({
                        MaChiTietDatPhong: r.MaChiTietDatPhong,
                        BookingUserId: r.BookingUserId,
                        NgayNhanPhong: r.NgayNhanPhong,
                        NgayTraPhong: r.NgayTraPhong,
                        SoLuongKhach: r.SoLuongKhach,
                        TrangThaiDat: r.TrangThaiDat,
                        MaKhuyenMai: r.MaKhuyenMai,
                        TongTien: r.TongTien,
                        LichSu: r.LichSu,
                        DanhGia: r.DanhGia,
                    });
                }
            }

            return Array.from(map.values());
        } catch (err) {
            console.error('RoomService.getOwnerRoomsWithBookings error:', err);
            return [];
        }
    };

    /**
     * Tìm phòng theo MaPhong
     */
    findById = async (id) => {
        try {
            const query = `
                SELECT 
                    p.*,
                    lp.TenLoaiPhong,
                    nd.Username,
                    nd.HoTen,
                    p.gia AS GiaPhong,
                    p.TenChoO,
                    p.ThanhPho,
                    p.MaNguoiDung
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
            room.HoTen = row.HoTen;
            room.TenChoO = row.TenChoO;
            room.ThanhPho = row.ThanhPho;
            room.MaNguoiDung = row.MaNguoiDung;
            room.TrangThaiPhong = row.TrangThaiPhong;

            return room;
        } catch (err) {
            console.error("RoomService.findById error:", err);
            return null;
        }
    };

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

    updateStatus = async (id, newStatus) => {
        try {
            const query = `
                UPDATE phong
                SET TrangThaiPhong = ?
                WHERE MaPhong = ?
            `;

            const [result] = await pool.execute(query, [newStatus, id]);
            return result.affectedRows > 0;
        } catch (err) {
            console.error('RoomService.updateStatus error:', err);
            throw err;
        }
    };
}

module.exports = RoomService;
