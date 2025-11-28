const Phong = require("../models/phong");
const pool = require('../database/client');

class RoomService {
    getAll = async (cond = null) => {
        try {
            let query = `
                SELECT 
                    p.MaPhong, p.SoPhong, p.ViTriTang, p.TrangThaiPhong, p.MaLoaiPhong, 
                    p.View, p.DiaChi, p.Rating, p.MoTa, p.HinhAnh, p.MaThietBi,
                    lp.TenLoaiPhong, lp.Gia
                FROM phong p\
                JOIN loaiphong lp ON p.MaLoaiPhong = lp.MaLoaiPhong
            `;
            if (cond) {
                query += " " + cond;
            }

            const [result, fields] = await pool.execute(query);
            return result.map(row => {
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
                    row.MaThietBi
                );
                // Add TenLoaiPhong and Gia from the joined loaiphong table
                room.TenLoaiPhong = row.TenLoaiPhong;
                room.Gia = row.Gia;
                return room;
            });
        } catch (err) {
            console.error(err);
            return [];
        }
    }

    findById = async (id) => {
        const cond = ` WHERE MaPhong = ${id}`;

        const tmp = await this.getAll(cond);

        if (tmp.length == 0) {
            return null;
        }


        const roomItem = tmp[0];
        return roomItem;
    }


}

module.exports = RoomService;