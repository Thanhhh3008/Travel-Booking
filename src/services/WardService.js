const ward = require('../models/ward');
const pool = require('../database/client');

class WardService {
    async getByDistrict(district_id) {
        const sql = 'SELECT * FROM ward WHERE district_id = ?';
        try {
            const [rows] = await pool.execute(sql, [district_id]);
            return rows.map(row => new ward(row.id, row.name, row.district_id, row.type));
        } catch (error) {
            console.log(error);
            return []
        }
    }   


    async getById(id) {
        const sql = 'SELECT * FROM ward WHERE id = ?';
        try {
            const [rows] = await pool.execute(sql, [id]);
            const rs = rows.map(row => new ward(row.id, row.name, row.district_id, row.type));
            if (!rs.length) {
                return null;
            }

            return rs[0];
        } catch (error) {
            console.log(error);
            return []
        }
    }
}

module.exports = WardService;