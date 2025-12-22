const pool = require('../../config/db');

const PhongModel = {

  // Lấy tất cả phòng
getAllRooms: async () => {
  const [rows] = await pool.query(`
    SELECT 
      p.*, 
      nd.Username, 
      lp.TenLoaiPhong,
       pr.name AS ProvinceName,
       d.name  AS DistrictName,
       w.name  AS WardName
    FROM phong p
    LEFT JOIN nguoidung nd ON p.MaNguoiDung = nd.MaNguoiDung
    LEFT JOIN loaiphong lp ON p.MaLoaiPhong = lp.MaLoaiPhong
    JOIN ward w ON p.ward_id = w.id
    JOIN district d ON w.district_id = d.id
    JOIN province pr ON d.province_id = pr.id
    ORDER BY p.MaPhong DESC
  `);
  return rows;
},

// Đếm tổng số phòng chờ duyệt
countPendingRooms : async () => {
  const query = `
    SELECT COUNT(*) as total 
    FROM phong 
    WHERE TrangThaiPhong = 'Chờ xét duyệt'
  `;
  const [result] = await pool.query(query);
  return result[0].total;
},

// Lấy danh sách phòng chờ duyệt với phân trang
getPendingRoomsWithPagination : async (limit, offset) => {
  const query = `
    SELECT p.*, nd.Username,
     pr.name AS ProvinceName,
       d.name  AS DistrictName,
       w.name  AS WardName
    FROM phong p
    LEFT JOIN nguoidung nd ON p.MaNguoiDung = nd.MaNguoiDung
      JOIN ward w ON p.ward_id = w.id
    JOIN district d ON w.district_id = d.id
    JOIN province pr ON d.province_id = pr.id
    WHERE p.TrangThaiPhong = 'Chờ xét duyệt'
    ORDER BY p.MaPhong DESC
    LIMIT ? OFFSET ?
  `;
  const [rooms] = await pool.query(query, [limit, offset]);
  return rooms;
},
  // Lấy danh sách phòng chờ duyệt
 getPendingRooms: async () => {
  const [rows] = await pool.query(`
    SELECT p.*, nd.Username,
     pr.name AS ProvinceName,
       d.name  AS DistrictName,
       w.name  AS WardName
    FROM phong p
    LEFT JOIN nguoidung nd ON p.MaNguoiDung = nd.MaNguoiDung
      JOIN ward w ON p.ward_id = w.id
    JOIN district d ON w.district_id = d.id
    JOIN province pr ON d.province_id = pr.id
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
  },
  // Thêm vào PhongModel của bạn

// Đếm tổng số phòng
 countAllRooms : async () => {
  const query = `SELECT COUNT(*) as total FROM phong`;
  const [result] = await pool.query(query);
  return result[0].total;
},

// Đếm số phòng theo trạng thái
countRoomsByStatus : async (status) => {
  const query = `SELECT COUNT(*) as total FROM phong WHERE TrangThaiPhong = ?`;
  const [result] = await pool.query(query, [status]);
  return result[0].total;
},

// Lấy tất cả phòng với phân trang
getAllRoomsWithPagination : async (limit, offset) => {
  const query = `
    SELECT 
      p.*,
      lp.TenLoaiPhong,
      u.Username,
      pr.name AS ProvinceName
    FROM phong p
    LEFT JOIN LoaiPhong lp ON p.MaLoaiPhong = lp.MaLoaiPhong
    LEFT JOIN NguoiDung u ON p.MaNguoiDung = u.MaNguoiDung
    JOIN ward w ON p.ward_id = w.id
    JOIN district d ON w.district_id = d.id
    JOIN province pr ON d.province_id = pr.id
    ORDER BY p.MaPhong DESC
    LIMIT ? OFFSET ?
  `;
  const [rooms] = await pool.query(query, [limit, offset]);
  return rooms;
},

// Lấy phòng theo trạng thái với phân trang
getRoomsByStatusWithPagination : async (status, limit, offset) => {
  const query = `
    SELECT 
      p.*,
      lp.TenLoaiPhong,
      u.Username,
      pr.name AS ProvinceName
    FROM phong p
    LEFT JOIN LoaiPhong lp ON p.MaLoaiPhong = lp.MaLoaiPhong
     LEFT JOIN NguoiDung u ON p.MaNguoiDung = u.MaNguoiDung
     JOIN ward w ON p.ward_id = w.id
    JOIN district d ON w.district_id = d.id
    JOIN province pr ON d.province_id = pr.id
    WHERE p.TrangThaiPhong = ?
    ORDER BY p.MaPhong DESC
    LIMIT ? OFFSET ?
  `;
  const [rooms] = await pool.query(query, [status, limit, offset]);
  return rooms;
}
};

module.exports = PhongModel;
