const pool = require('../../config/db');

const ThongBaoModel = {
  // ========== CÁC HÀM GỐC ==========
  
  //  Lấy tất cả thông báo (không phân trang - giữ lại cho tương thích)
  getAll: async () => {
    const [rows] = await pool.query(`
      SELECT tb.*, 
             nd.Email AS EmailNguoiNhan,
             vt.TenVaiTro AS VaiTroNguoiNhan
      FROM thongbao tb
      LEFT JOIN nguoidung nd ON tb.MaNguoiDung = nd.MaNguoiDung
      LEFT JOIN vaitro vt ON nd.MaVaiTro = vt.MaVaiTro
      ORDER BY tb.MaThongBao DESC
    `);
    return rows;
  },

  //  Cập nhật đầy đủ thông báo (bao gồm loại và người nhận)
  updateFull: async (id, TieuDe, NoiDung, LoaiThongBao, MaNguoiDung = null) => {
    await pool.query(
      `UPDATE thongbao 
       SET TieuDe = ?, NoiDung = ?, LoaiThongBao = ?, MaNguoiDung = ? 
       WHERE MaThongBao = ?`,
      [TieuDe, NoiDung, LoaiThongBao, MaNguoiDung, id]
    );
  },

  //  Tìm kiếm thông báo theo tiêu đề (không phân trang - giữ lại cho tương thích)
  search: async (search) => {
    let sql = `
      SELECT tb.*, nd.Email AS EmailNguoiNhan, vt.TenVaiTro AS VaiTroNguoiNhan
      FROM thongbao tb
      LEFT JOIN nguoidung nd ON tb.MaNguoiDung = nd.MaNguoiDung
      LEFT JOIN vaitro vt ON nd.MaVaiTro = vt.MaVaiTro
      WHERE 1=1
    `;

    const params = [];

    if (search && search.trim() !== '') {
      sql += ` AND tb.TieuDe LIKE ?`;
      params.push(`%${search.trim()}%`);
    }

    sql += ` ORDER BY tb.MaThongBao DESC`;

    const [rows] = await pool.query(sql, params);
    return rows;
  },

  // ➕ Thêm mới thông báo 
  add: async (TieuDe, NoiDung, LoaiThongBao = 'toan_cuc', MaNguoiDung = null, Thumbnail = null) => {
    await pool.query(`
      INSERT INTO thongbao (TieuDe, NoiDung, LoaiThongBao, MaNguoiDung, Thumbnail, NgayTao)
      VALUES (?, ?, ?, ?, ?, NOW())
    `, [TieuDe, NoiDung, LoaiThongBao, MaNguoiDung, Thumbnail]);
  },

  //  Cập nhật thông báo
  update: async (id, TieuDe, NoiDung) => {
    await pool.query(`
      UPDATE thongbao
      SET TieuDe = ?, NoiDung = ?
      WHERE MaThongBao = ?
    `, [TieuDe, NoiDung, id]);
  },

  //  Xóa thông báo
  delete: async (id) => {
    await pool.query(`
      DELETE FROM thongbao
      WHERE MaThongBao = ?
    `, [id]);
  },

  //  Lấy 1 thông báo theo ID
  getById: async (id) => {
    const [rows] = await pool.query(`
      SELECT * FROM thongbao
      WHERE MaThongBao = ?
    `, [id]);
    return rows[0];
  },

  // Lấy chi tiết 1 thông báo với đầy đủ thông tin
  getDetailById: async (id) => {
    const [rows] = await pool.query(`
      SELECT tb.*, 
             nd.Email AS EmailNguoiNhan,
             nd.HoTen AS TenNguoiNhan,
             vt.TenVaiTro AS VaiTroNguoiNhan
      FROM thongbao tb
      LEFT JOIN nguoidung nd ON tb.MaNguoiDung = nd.MaNguoiDung
      LEFT JOIN vaitro vt ON nd.MaVaiTro = vt.MaVaiTro
      WHERE tb.MaThongBao = ?
    `, [id]);
    return rows[0];
  },

  // Lấy thông báo toàn cục và thông báo gửi riêng cho người dùng
  getByUser: async (userId) => {
    const [rows] = await pool.query(`
      SELECT tb.*, 
             nd.Email AS EmailNguoiNhan
      FROM thongbao tb
      LEFT JOIN nguoidung nd ON tb.MaNguoiDung = nd.MaNguoiDung
      WHERE 
          tb.LoaiThongBao = 'toan_cuc'
          OR tb.MaNguoiDung = ?
      ORDER BY tb.MaThongBao DESC
    `, [userId]);

    return rows;
  },

  deleteByUser: async (userId) => {
    const [result] = await pool.query(`
      DELETE FROM thongbao
      WHERE MaNguoiDung = ?
    `, [userId]);
    return result;
  },

  // ========== CÁC HÀM MỚI CHO PHÂN TRANG ==========

  // Đếm tổng số thông báo
  countAll: async () => {
    const [result] = await pool.query(`
      SELECT COUNT(*) as total FROM thongbao
    `);
    return result[0].total;
  },

  // Đếm số thông báo tìm kiếm được
  countSearch: async (search) => {
    const query = `
      SELECT COUNT(*) as total
      FROM thongbao tb
      WHERE tb.TieuDe LIKE ?
    `;
    const [result] = await pool.query(query, [`%${search.trim()}%`]);
    return result[0].total;
  },

  // Lấy tất cả thông báo với phân trang
  getAllWithPagination: async (limit, offset) => {
    const [rows] = await pool.query(`
      SELECT tb.*, 
             nd.Email AS EmailNguoiNhan,
             vt.TenVaiTro AS VaiTroNguoiNhan
      FROM thongbao tb
      LEFT JOIN nguoidung nd ON tb.MaNguoiDung = nd.MaNguoiDung
      LEFT JOIN vaitro vt ON nd.MaVaiTro = vt.MaVaiTro
      ORDER BY tb.MaThongBao DESC
      LIMIT ? OFFSET ?
    `, [limit, offset]);
    return rows;
  },

  // Tìm kiếm thông báo với phân trang
  searchWithPagination: async (search, limit, offset) => {
    const [rows] = await pool.query(`
      SELECT tb.*, 
             nd.Email AS EmailNguoiNhan,
             vt.TenVaiTro AS VaiTroNguoiNhan
      FROM thongbao tb
      LEFT JOIN nguoidung nd ON tb.MaNguoiDung = nd.MaNguoiDung
      LEFT JOIN vaitro vt ON nd.MaVaiTro = vt.MaVaiTro
      WHERE tb.TieuDe LIKE ?
      ORDER BY tb.MaThongBao DESC
      LIMIT ? OFFSET ?
    `, [`%${search.trim()}%`, limit, offset]);
    return rows;
  },
};

module.exports = ThongBaoModel;