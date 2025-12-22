const pool = require('../../config/db');
const BookingModel = {

  // Đếm tổng số chi tiết đặt phòng
  countAll: async (status) => {
    let sql = 'SELECT COUNT(*) AS total FROM chitietdatphong';
  const params = [];

  if (status === '0' || status === '1') {
    sql += ' WHERE TrangThai = ?';
    params.push(status);
  }

  const [rows] = await pool.execute(sql, params);
  return rows[0].total;
  },

  // Lấy danh sách chi tiết đặt phòng có phân trang
  getAllWithPagination: async (limit, offset,status) => {
    let sql = `
    SELECT ctdp.*, nd.Username, p.TenChoO, ctdp.NgayNhanPhong, ctdp.NgayTraPhong
    FROM chitietdatphong ctdp
    JOIN nguoidung nd ON ctdp.MaNguoiDung = nd.MaNguoiDung
    JOIN phong p ON ctdp.MaPhong = p.MaPhong
  `;
  const params = [];

  if (status === '0' || status === '1') {
    sql += ' WHERE ctdp.TrangThai = ?';
    params.push(status);
  }

  sql += ' ORDER BY ctdp.NgayDatPhong DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const [rows] = await pool.execute(sql, params);
  return rows;
  },
getById: async (id) => {
    const [rows] = await pool.query(`
      SELECT ctdp.*,
             nd.HoTen, nd.Username, nd.Email,
             p.TenChoO, p.Gia, p.SoPhong, p.DiaChi
      FROM chitietdatphong ctdp
      JOIN nguoidung nd ON ctdp.MaNguoiDung = nd.MaNguoiDung
      JOIN phong p ON ctdp.MaPhong = p.MaPhong
      WHERE ctdp.MaChiTietDatPhong = ?
    `, [id]);

    return rows[0] || null;
  }
};

module.exports = BookingModel;