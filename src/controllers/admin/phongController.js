const PhongModel = require('../../models/admin/Phong');
const ThongBaoModel = require('../../models/admin/ThongBao'); 
const NguoiDungModel = require('../../models/admin/NguoiDung');
const { sendMail } = require('../../util/admin/mailer'); 
//  Hiển thị danh sách phòng chờ duyệt
exports.getPendingRooms = async (req, res) => {
  try {
    const rooms = await PhongModel.getPendingRooms();
    res.render('admin/duyetphong', { 
      title: 'Xét duyệt chỗ ở',
      rooms });
  } catch (err) {
    console.error(err);
    res.status(500).send('Lỗi khi lấy danh sách phòng chờ duyệt: ' + err.message);
  }
};
//  Hiển thị danh sách tất cả phòng
exports.getAllRooms = async (req, res) => {
  try {
    const { status } = req.query;

    let rooms;
    if (status) {
      rooms = await PhongModel.getRoomsByStatus(status);
    } else {
      rooms = await PhongModel.getAllRooms();
    }

    res.render('admin/tatcaphong', {
      title: 'Tất cả chỗ ở',
      rooms,
      status 
    });

  } catch (error) {
    console.error('Lỗi lấy danh sách phòng:', error);
    res.status(500).send('Lỗi server: ' + error.message);
  }
};

// Xem chi tiết phòng
exports.getRoomDetail = async (req, res) => {
  try {
    const roomId = req.params.id;
    const room = await PhongModel.getById(roomId);
    if (!room) return res.status(404).send('Không tìm thấy phòng');

    res.render('admin/chitietPhong', { 
      title: 'Xét duyệt chỗ ở',
      room });
  } catch (err) {
    console.error(err);
    res.status(500).send('Lỗi khi lấy chi tiết phòng: ' + err.message);
  }
};




//  Phê duyệt phòng
exports.approveRoom = async (req, res) => {
  try {
    const roomId = req.params.id;
    await PhongModel.approveRoom(roomId);

    // Lấy thông tin phòng và chủ phòng
    const room = await PhongModel.getById(roomId);
    if (!room) return res.status(404).send('Không tìm thấy phòng');

    //  Gán vai trò "Nhà cung cấp" cho người đăng phòng (nếu chưa)
    await NguoiDungModel.updateRole(room.MaNguoiDung, 2);

    //  Thông báo hệ thống
    const message = `Phòng "${room.SoPhong}" của bạn đã được phê duyệt và đăng công khai trên hệ thống.`;
    await ThongBaoModel.add(
      'Phòng được phê duyệt',
      message,
      
      'ca_nhan',
      room.MaNguoiDung
    );

    //  Gửi email cho chủ phòng
    const user = await NguoiDungModel.getById(room.MaNguoiDung);
    if (user && user.Email) {
      await sendMail(
        user.Email,
        ' Phòng của bạn đã được phê duyệt',
        `
          <h3>Xin chào ${user.HoTen || 'bạn'},</h3>
          <p>Phòng <strong>${room.SoPhong}</strong> của bạn đã được phê duyệt và đăng lên hệ thống.</p>
          <p>Hãy truy cập trang quản lý để xem chi tiết.</p>
          <hr>
          <small>Trân trọng,<br>Hệ thống du lịch & chỗ ở</small>
        `
      );
    }

    res.redirect('/admin/duyetphong?approved=1');
  } catch (err) {
    console.error(err);
    res.status(500).send('Lỗi khi phê duyệt phòng: ' + err.message);
  }
};

//  Từ chối phòng
exports.rejectRoom = async (req, res) => {
  try {
    const roomId = req.params.id;
    const { reason } = req.body;

    if (!reason || reason.trim() === '') {
      return res.status(400).send('Vui lòng nhập lý do từ chối');
    }

    await PhongModel.updateTrangThai(roomId, 'Đã từ chối');

    const room = await PhongModel.getById(roomId);
    if (!room) return res.status(404).send('Không tìm thấy phòng');

    //  Gửi thông báo nội bộ
    const message = `Phòng "${room.SoPhong}" của bạn đã bị từ chối. Lý do: ${reason}`;
    await ThongBaoModel.add(
      'Phòng bị từ chối',
      message,
      'ca_nhan',
      room.MaNguoiDung
    );

    //  Gửi email cho chủ phòng
    const user = await NguoiDungModel.getById(room.MaNguoiDung);
    if (user && user.Email) {
      await sendMail(
        user.Email,
        ' Phòng của bạn bị từ chối',
        `
          <h3>Xin chào ${user.HoTen || 'bạn'},</h3>
          <p>Rất tiếc, phòng <strong>${room.SoPhong}</strong> của bạn đã bị từ chối.</p>
          <p><strong>Lý do:</strong> ${reason}</p>
          <p>Bạn có thể chỉnh sửa và gửi lại yêu cầu phê duyệt.</p>
          <hr>
          <small>Trân trọng,<br>Hệ thống du lịch & chỗ ở</small>
        `
      );
    }

    res.redirect('/admin/duyetphong?rejected=1');
  } catch (err) {
    console.error('Lỗi khi từ chối phòng:', err);
    res.redirect('/admin/duyetphong?error=1');
  }
};

//  Ẩn phòng khỏi web
exports.hideRoom = async (req, res) => {
  try {
    const roomId = req.params.id;
    await PhongModel.updateTrangThai(roomId, 'Ẩn');
    res.redirect(`/admin/duyetphong/${roomId}?hidden=1`);
  } catch (err) {
    console.error('Lỗi khi ẩn phòng:', err);
    res.status(500).send('Lỗi khi ẩn phòng: ' + err.message);
  }
};

//  Hiển thị lại phòng
exports.showRoom = async (req, res) => {
  try {
    const roomId = req.params.id;
    await PhongModel.updateTrangThai(roomId, 'Đang hoạt động');
    res.redirect(`/admin/duyetphong/${roomId}?shown=1`);
  } catch (err) {
    console.error('Lỗi khi hiển thị lại phòng:', err);
    res.status(500).send('Lỗi khi hiển thị lại phòng: ' + err.message);
  }
};

// 🗑️ Xóa phòng
exports.deleteRoom = async (req, res) => {
  try {
    const roomId = req.params.id;

    // Lấy thông tin phòng trước khi xóa
    const room = await PhongModel.getById(roomId);
    if (!room) return res.status(404).send('Không tìm thấy phòng để xóa');

    // Xóa phòng trong CSDL
    await PhongModel.deleteRoom(roomId);

    //  Thêm thông báo
    const message = `Phòng "${room.SoPhong}" của bạn đã bị quản trị viên xóa khỏi hệ thống.`;
    await ThongBaoModel.add(
      'Phòng bị xóa',
      message,
      
      'ca_nhan',
      room.MaNguoiDung
    );

    //  Gửi email cho chủ phòng
    const user = await NguoiDungModel.getById(room.MaNguoiDung);
    if (user && user.Email) {
      await sendMail(
        user.Email,
        ' Phòng của bạn đã bị xóa',
        `
          <h3>Xin chào ${user.HoTen || 'bạn'},</h3>
          <p>Phòng <strong>${room.SoPhong}</strong> của bạn đã bị quản trị viên xóa khỏi hệ thống.</p>
          <p>Nếu bạn cho rằng đây là nhầm lẫn, vui lòng liên hệ với bộ phận hỗ trợ.</p>
          <hr>
          <small>Trân trọng,<br>Hệ thống du lịch & chỗ ở</small>
        `
      );
    }

    res.redirect('/admin/duyetphong/tatca?deleted=1');
  } catch (err) {
    console.error('Lỗi khi xóa phòng:', err);
    res.status(500).send('Lỗi khi xóa phòng: ' + err.message);
  }
};




