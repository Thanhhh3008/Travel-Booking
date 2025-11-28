const pool = require('../../config/db');

const NguoiDungModel = {
  // 📋 Lấy danh sách người dùng (chỉ hiển thị Username, Họ tên, Email, SĐT)
  getAll: async () => {
    const [rows] = await pool.query(`
      SELECT MaNguoiDung, Username, HoTen, Email, SDT
      FROM nguoidung
      ORDER BY MaNguoiDung DESC
    `);
    return rows;
  },

  // 🔍 Tìm kiếm theo họ tên, SĐT hoặc email
  search: async (keyword) => {
    if (!keyword) {
      const [rows] = await pool.query('SELECT * FROM nguoidung ORDER BY MaNguoiDung DESC');
      return rows;
    }
    const likeKeyword = `%${keyword}%`;
    const [rows] = await pool.query(
      `SELECT * FROM nguoidung 
       WHERE HoTen LIKE ? OR SDT LIKE ? OR Email LIKE ? 
       ORDER BY MaNguoiDung DESC`,
      [likeKeyword, likeKeyword, likeKeyword]
    );
    return rows;
  },


  // 🔍 Xem chi tiết 1 người dùng
  getById: async (id) => {
    const [rows] = await pool.query(`
      SELECT MaNguoiDung, HoTen, NgaySinh, CCCD, Username, Password,
             Email, DiaChi, SDT, QuocTich, Rating
      FROM nguoidung
      WHERE MaNguoiDung = ?
    `, [id]);
    return rows[0];
  },

  
  // 📝 Cập nhật người dùng
  update: async (id, data) => {
    const { HoTen, NgaySinh, CCCD, Email, DiaChi, SDT, QuocTich, Rating } = data;
    await pool.query(`
      UPDATE nguoidung 
      SET HoTen=?, NgaySinh=?, CCCD=?, 
          Email=?, DiaChi=?, SDT=?, QuocTich=?, Rating=?
      WHERE MaNguoiDung=?
    `, [HoTen, NgaySinh, CCCD, Email, DiaChi, SDT, QuocTich, Rating, id]);
  },

  // ❌ Xóa người dùng
  delete: async (id) => {
    await pool.query('DELETE FROM nguoidung WHERE MaNguoiDung=?', [id]);
  },

  findByEmail: async (email) => {
    const [rows] = await pool.query(
      'SELECT MaNguoiDung, Email FROM nguoidung WHERE Email = ?',
      [email]
    );
    return rows[0] || null;
  },


  updateRole: async (userId, roleId) => {
  const [result] = await pool.query(
    'UPDATE nguoidung SET MaVaiTro = ? WHERE MaNguoiDung = ?',
    [roleId, userId]
  );
  return result.affectedRows > 0; 
},
getByRole : async (roleId) => {
  const [rows] = await pool.query(
    'SELECT Email FROM nguoidung WHERE MaVaiTro = ? AND Email IS NOT NULL',
    [roleId]
  );
  return rows;
},

getByEmail : async (email) => {
  const [rows] = await pool.query('SELECT * FROM nguoidung WHERE Email = ?', [email]);
  return rows[0];
}
  
 
};


module.exports = NguoiDungModel;
