const loaiphong = require("../models/loaiphong");
const pool = require('../database/client');


class CategoryRoomService {
    getAll = async (cond = null) => {
        try {
            let query = `SELECT * FROM loaiphong`;
            if (cond) {
                query += cond;
            }

            const [result, fields] = await pool.execute(query);
            return result.map(row => {
                return new loaiphong(
                    row.MaLoaiPhong,
                    row.DienTich,
                    row.SoKhachToiDa,
                    row.TenLoaiPhong,
                    row.Gia,
                    row.MoTa
                );
            });
        } catch (err) {
            console.error(err);
            return [];
        }
    }

    findById = async (id) => {
        const cond = ` WHERE MaLoaiPhong = ${id}`;

        const tmp = await this.getAll(cond);

        if (tmp.length == 0) {
            return null;
        }


        const categoryRoomItem = tmp[0];
        return categoryRoomItem;
    }


}

module.exports = CategoryRoomService;