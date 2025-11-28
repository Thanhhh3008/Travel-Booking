// const pool = require('../../config/db');

// const KhieuNaiModel = {

//   // Lấy tất cả khiếu nại
//   getAll: async () => {
//     const [rows] = await pool.query(`
//       SELECT k.*, nd.Username, nd.HoTen
//       FROM khieunai k
//       LEFT JOIN nguoidung nd ON k.MaNguoiDung = nd.MaNguoiDung
//       ORDER BY k.MaKhieuNai DESC
//     `);
//     return rows;
//   },

//   // Lấy chi tiết 1 khiếu nại
//   getById: async (id) => {
//     const [rows] = await pool.query(`
//       SELECT k.*, nd.Username, nd.HoTen, nd.Email
//       FROM khieunai k
//       LEFT JOIN nguoidung nd ON k.MaNguoiDung = nd.MaNguoiDung
//       WHERE k.MaKhieuNai = ?
//     `, [id]);
//     return rows[0];
//   },

//   // Người dùng gửi khiếu nại
//   add: async (maNguoiDung, noiDung) => {
//     await pool.query(`
//       INSERT INTO khieunai (MaNguoiDung, NoiDung, TrangThai, ThoiGianGui)
//       VALUES (?, ?, 'Chờ phản hồi', NOW())
//     `, [maNguoiDung, noiDung]);
//   },

//   // Admin phản hồi
//   reply: async (id, traLoi) => {
//     await pool.query(`
//       UPDATE khieunai
//       SET TraLoi = ?, TrangThai = 'Đã phản hồi'
//       WHERE MaKhieuNai = ?
//     `, [traLoi, id]);
//   },

//   // Xóa khiếu nại
//   delete: async (id) => {
//     await pool.query(`DELETE FROM khieunai WHERE MaKhieuNai = ?`, [id]);
//   }

// };

// module.exports = KhieuNaiModel;
