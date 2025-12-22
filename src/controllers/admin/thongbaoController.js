// controllers/thongbaoController.js
const ThongBao = require('../../models/admin/ThongBao');
const { sendMail } = require('../../util/admin/mailer');
const NguoiDungModel = require('../../models/admin/NguoiDung');

//  Lấy danh sách thông báo với phân trang
exports.getAllThongBao = async (req, res) => {
  try {
    const search = req.query.search || '';
    const page = parseInt(req.query.page) || 1;
    const limit = 10; // Số thông báo mỗi trang
    const offset = (page - 1) * limit;

    let thongbaos, totalThongBaos;

    if (search.trim() !== '') {
      // Đếm tổng số thông báo tìm kiếm được
      totalThongBaos = await ThongBao.countSearch(search);
      // Lấy danh sách thông báo có phân trang
      thongbaos = await ThongBao.searchWithPagination(search, limit, offset);
    } else {
      // Đếm tổng số thông báo
      totalThongBaos = await ThongBao.countAll();
      // Lấy tất cả thông báo có phân trang
      thongbaos = await ThongBao.getAllWithPagination(limit, offset);
    }

    // Tính tổng số trang
    const totalPages = Math.ceil(totalThongBaos / limit);
    const currentPage = page;

    res.render('admin/thongbao', {
      title: 'Quản lý thông báo',
      thongbaos,
      search,
      currentPage,
      totalPages,
      totalThongBaos,
      limit
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Lỗi khi lấy danh sách thông báo: ' + err.message);
  }
};


//  Hàm gửi mail đến danh sách người dùng
async function sendNotificationEmails(thongbao) {
  const subject = `📢 ${thongbao.TieuDe}`;
  const html = `
    <h3>${thongbao.TieuDe}</h3>
    <p>${thongbao.NoiDung}</p>
    <hr>
    <small>Hệ thống du lịch & chỗ ở</small>
  `;

  // Nếu là thông báo cá nhân
  if (thongbao.LoaiThongBao === 'ca_nhan') {
    if (!thongbao.EmailNguoiNhan) return;
    await sendMail(thongbao.EmailNguoiNhan, subject, html);
    return;
  }

  // Nếu là toàn cục
  let users = [];
  users = await NguoiDungModel.getAll(); // gửi cho tất cả

  for (const user of users) {
    if (user.Email) await sendMail(user.Email, subject, html);
  }
}


// Xem chi tiết thông báo
exports.viewThongBaoDetail = async (req, res) => {
  const { id } = req.params;
  
  try {
    const thongbao = await ThongBao.getDetailById(id);
    
    if (!thongbao) {
      return res.status(404).send('Không tìm thấy thông báo');
    }

    res.render('admin/thongbao-detail', {
      title: 'Chi tiết Thông báo',
      thongbao
    });
  } catch (err) {
    console.error(' Lỗi khi xem chi tiết thông báo:', err);
    res.status(500).send('Lỗi khi xem chi tiết thông báo: ' + err.message);
  }
};

//  Thêm thông báo mới
exports.addThongBao = async (req, res) => {
  const { TieuDe, NoiDung, LoaiThongBao, NguoiNhan } = req.body;
  const thumbnail = req.file ? req.file.filename : null;

  try {
    let MaNguoiDung = null;
    let EmailNguoiNhan = null;

    // Nếu là cá nhân → kiểm tra email người nhận
    if (LoaiThongBao === 'ca_nhan') {
      if (!NguoiNhan || NguoiNhan.trim() === '') {
        return res.status(400).send(' Bạn cần nhập email người nhận cho thông báo cá nhân.');
      }

      const user = await NguoiDungModel.findByEmail(NguoiNhan.trim());
      
      if (!user) {
        return res.redirect('/admin/thongbao?error=notfound');
      }

      MaNguoiDung = user.MaNguoiDung;
      EmailNguoiNhan = user.Email;
    }

    // Thêm thông báo vào database
    await ThongBao.add(TieuDe, NoiDung, LoaiThongBao, MaNguoiDung, thumbnail);

    //  Gửi email thông báo
    await sendNotificationEmails({
      TieuDe,
      NoiDung,
      LoaiThongBao,
      EmailNguoiNhan
    });

    res.redirect('/admin/thongbao?added=1');
  } catch (err) {
    console.error(' Lỗi khi thêm thông báo:', err);
    res.status(500).send('Lỗi khi thêm thông báo: ' + err.message);
  }
};


//  Sửa thông báo
exports.editThongBao = async (req, res) => {
  const { id } = req.params;
  const { TieuDe, NoiDung, LoaiThongBao, NguoiNhan } = req.body;

  try {
    let MaNguoiDung = null;
    let EmailNguoiNhan = null;

    if (LoaiThongBao === 'ca_nhan') {
      if (!NguoiNhan || NguoiNhan.trim() === '') {
        return res.status(400).send(' Bạn cần nhập email người nhận cho thông báo cá nhân.');
      }

      const user = await NguoiDungModel.findByEmail(NguoiNhan.trim());
      if (!user) {
        return res.redirect('/admin/thongbao?error=notfound');
      }

      MaNguoiDung = user.MaNguoiDung;
      EmailNguoiNhan = user.Email;
    }

    await ThongBao.updateFull(id, TieuDe, NoiDung, LoaiThongBao, MaNguoiDung);

    // Gửi lại email sau khi chỉnh sửa
    await sendNotificationEmails({
      TieuDe,
      NoiDung,
      LoaiThongBao,
      EmailNguoiNhan
    });

    res.redirect('/admin/thongbao?edited=1');
  } catch (err) {
    console.error(' Lỗi khi sửa thông báo:', err);
    res.status(500).send('Lỗi khi sửa thông báo: ' + err.message);
  }
};


//  Xóa thông báo
exports.deleteThongBao = async (req, res) => {
  const { id } = req.params;
  try {
    await ThongBao.delete(id);
    res.redirect('/admin/thongbao?deleted=1');
  } catch (err) {
    res.status(500).send('Lỗi khi xóa thông báo: ' + err.message);
  }
};