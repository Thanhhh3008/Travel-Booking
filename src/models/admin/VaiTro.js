// src/models/admin/VaiTro.js
const pool = require('../../config/db');

const VaiTroModel = {
  // 📋 Lấy tất cả vai trò
  getAll: async () => {
    const [rows] = await pool.query(`
      SELECT MaVaiTro, TenVaiTro 
      FROM vaitro
      ORDER BY MaVaiTro ASC
    `);
    return rows;
  },

  // 🔍 Lấy chi tiết 1 vai trò theo id
  getById: async (id) => {
    const [rows] = await pool.query(`
      SELECT MaVaiTro, TenVaiTro 
      FROM vaitro
      WHERE MaVaiTro = ?
    `, [id]);
    return rows[0];
  },

  // 📝 Tạo vai trò mới
  create: async (data) => {
    const { TenVaiTro } = data;
    const [result] = await pool.query(`
      INSERT INTO vaitro (TenVaiTro) VALUES (?)
    `, [TenVaiTro]);
    return result.insertId;
  },

  // 📝 Cập nhật vai trò
  update: async (id, data) => {
    const { TenVaiTro } = data;
    const [result] = await pool.query(`
      UPDATE vaitro 
      SET TenVaiTro = ?
      WHERE MaVaiTro = ?
    `, [TenVaiTro, id]);
    return result.affectedRows > 0;
  },

  // ❌ Xóa vai trò
  delete: async (id) => {
    const [result] = await pool.query(`
      DELETE FROM vaitro WHERE MaVaiTro = ?
    `, [id]);
    return result.affectedRows > 0;
  }
};

module.exports = VaiTroModel;
