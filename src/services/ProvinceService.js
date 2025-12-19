const pool = require("../database/client");
const province = require("../models/province");

class ProvinceService {
  async getAll() {
    const sql = "SELECT * FROM province";
    try {
        const [rows] = await pool.execute(sql);
      return rows.map((row) => new province(row.id, row.name, row.type));
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  async getById(id) {
    const sql = "SELECT * FROM province WHERE id = ?";
    try {
      const [rows] = await pool.execute(sql, [id]);
      const rs = rows.map((row) => new province(row.id, row.name, row.type));
      if (!rs.length) {
        return null;
      }

      return rs[0];
    } catch (error) {
      console.log(error);
      return [];
    }
  }
}

module.exports = ProvinceService;