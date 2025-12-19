const pool = require('../database/client');
const district = require('../models/district');

class DistrictService {
    async getByIdProvince(idProvince) {
        const sql = 'SELECT * FROM district WHERE province_id = ?';
        try {
            const [rows] = await pool.execute(sql, [idProvince]);
            return rows.map(row => new district(row.id, row.name, row.type, row.province_id));
        } catch (error) {
            console.log(error);
            return []
        }
    }

    async getById(id) {
        const sql = 'SELECT * FROM district WHERE id = ?';
        try {
            const [rows] = await pool.execute(sql, [id]);
            return rows.map(row => new district(row.id, row.name, row.type, row.province_id));
        } catch (error) {
            console.log(error);
            return []
        }
    }
}

module.exports = DistrictService