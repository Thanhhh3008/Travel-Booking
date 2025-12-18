const pool = require('../../config/db');

const PhongModel = {

  // Lấy tất cả phòng
getAllRooms: async () => {
  const [rows] = await pool.query(`
    SELECT 
      p.*, 
      nd.Username, 
      lp.TenLoaiPhong
    FROM phong p
    LEFT JOIN nguoidung nd ON p.MaNguoiDung = nd.MaNguoiDung
    LEFT JOIN loaiphong lp ON p.MaLoaiPhong = lp.MaLoaiPhong
    ORDER BY p.MaPhong DESC
  `);
  return rows;
},


  // Lấy danh sách phòng chờ duyệt
 getPendingRooms: async () => {
  const [rows] = await pool.query(`
    SELECT p.*, nd.Username
    FROM phong p
    LEFT JOIN nguoidung nd ON p.MaNguoiDung = nd.MaNguoiDung
    WHERE p.TrangThaiPhong = 'Chờ xét duyệt'
    ORDER BY p.MaPhong DESC
  `);
  return rows;
},

  //  Lấy chi tiết 1 phòng (kèm thông tin loại phòng)
getById: async (id) => {
  const [rows] = await pool.query(`
    SELECT 
      p.*, 
      lp.TenLoaiPhong, 
      lp.DienTich, 
      lp.SoKhachToiDa, 
      p.Gia,
      p.ThanhPho
    FROM phong p
    LEFT JOIN loaiphong lp ON p.MaLoaiPhong = lp.MaLoaiPhong
    WHERE p.MaPhong = ?
  `, [id]);
  return rows[0];
},
// Lấy danh sách phòng theo trạng thái
getRoomsByStatus: async (status) => {
  const [rows] = await pool.query(`
    SELECT 
      p.*, 
      nd.Username, 
      lp.TenLoaiPhong
    FROM phong p
    LEFT JOIN nguoidung nd ON p.MaNguoiDung = nd.MaNguoiDung
    LEFT JOIN loaiphong lp ON p.MaLoaiPhong = lp.MaLoaiPhong
    WHERE p.TrangThaiPhong = ?
    ORDER BY p.MaPhong DESC
  `, [status]);

  return rows;
},

  // Cập nhật trạng thái phòng
  
  updateTrangThai: async (id, trangThai) => {
  const [result] = await pool.query(
    'UPDATE phong SET TrangThaiPhong = ? WHERE MaPhong = ?',
    [trangThai, id]
  );
  return result.affectedRows > 0;
},
approveRoom: async (id) => {
    await pool.query(`
      UPDATE phong
      SET TrangThaiPhong = 'Đang hoạt động'
      WHERE MaPhong = ?
    `, [id]);
  },
 countAll: async () => {
  const [rows] = await pool.query(
    'SELECT COUNT(*) AS total FROM phong'
  );
  return rows[0].total;
},

deleteRoom: async (maPhong) => {
  await pool.query('DELETE FROM phong WHERE MaPhong = ?', [maPhong]);
},
 deleteByUser: async (userId) => {
    const [result] = await pool.query('DELETE FROM phong WHERE MaNguoiDung = ?', [userId]);
    return result;
  }
};

module.exports = PhongModel;
