const pool = require('../../config/db');

const NguoiDungModel = {
  // Lấy danh sách người dùng (chỉ hiển thị Username, Họ tên, Email, SĐT)
  getAll: async () => {
    const [rows] = await pool.query(`
      SELECT *
      FROM nguoidung
      ORDER BY MaNguoiDung DESC
    `);
    return rows;
  },
countAll: async () => {
  const [rows] = await pool.query(
    'SELECT COUNT(*) AS total FROM nguoidung'
  );
  return rows[0].total;
},

// Lấy danh sách người dùng gần đây
   getRecentUsers : async (limit = 5) => {
    const query = `
      SELECT 
        nd.MaNguoiDung,
        nd.HoTen,
        nd.Email,
        nd.avartar,
        nd.status,
        vt.TenVaiTro as vaiTro
      FROM NguoiDung nd
      LEFT JOIN VaiTro vt ON nd.MaVaiTro = vt.MaVaiTro
      ORDER BY nd.MaNguoiDung DESC
      LIMIT ?
    `;
    
    try {
      const [rows] = await pool.query(query, [limit]);
      return rows;
    } catch (error) {
      console.error('Error getting recent users:', error);
      throw error;
    }
  },
 // Tìm kiếm theo họ tên, Username, SĐT hoặc email
search: async (keyword) => {
  if (!keyword) {
    const [rows] = await pool.query(
      'SELECT * FROM nguoidung ORDER BY MaNguoiDung DESC'
    );
    return rows;
  }

  const likeKeyword = `%${keyword}%`;

  const [rows] = await pool.query(
    `SELECT * FROM nguoidung 
     WHERE HoTen LIKE ?
        OR Username LIKE ?
        OR SDT LIKE ?
        OR Email LIKE ?
     ORDER BY MaNguoiDung DESC`,
    [likeKeyword, likeKeyword, likeKeyword, likeKeyword]
  );

  return rows;
},



  // Xem chi tiết 1 người dùng
  getById: async (id) => {
    const [rows] = await pool.query(`
      SELECT *
      FROM nguoidung
      WHERE MaNguoiDung = ?
    `, [id]);
    return rows[0];
  },

  
//  Cập nhật người dùng
update: async (id, data) => {
  const { HoTen, NgaySinh, CCCD, Email, DiaChi, SDT, QuocTich, Rating, MaVaiTro } = data;
  await pool.query(`
    UPDATE nguoidung 
    SET HoTen=?, NgaySinh=?, CCCD=?, 
        Email=?, DiaChi=?, SDT=?, QuocTich=?, Rating=?, MaVaiTro=?
    WHERE MaNguoiDung=?
  `, [HoTen, NgaySinh, CCCD, Email, DiaChi, SDT, QuocTich, Rating, MaVaiTro, id]);
},

  //  Xóa người dùng
  delete: async (id) => {
    await pool.query('DELETE FROM nguoidung WHERE MaNguoiDung=?', [id]);
  },

  findByEmail: async (email) => {
    const [rows] = await pool.query(
      'SELECT * FROM nguoidung WHERE Email = ?',
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
