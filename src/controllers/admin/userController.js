const User = require('../../models/admin/NguoiDung');
const Notification = require('../../models/admin/ThongBao');
const Room = require('../../models/admin/Phong');
// 📋 Lấy danh sách người dùng (có tìm kiếm)
exports.getAllUsers = async (req, res) => {
  try {
    const search = req.query.search || '';
    let users;

    if (search.trim() !== '') {
      users = await User.search(search);
    } else {
      users = await User.getAll();
    }

    res.render('admin/user', {
      title: 'Quản lý người dùng',
      users,
      search
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Lỗi khi lấy danh sách người dùng: ' + err.message);
  }
};

// 👁️ Xem chi tiết người dùng
exports.getUserDetail = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.getById(id);
    if (!user) return res.status(404).send('Không tìm thấy người dùng');
    res.render('admin/user_detail', { 
      title: 'Chi tiết người dùng',
      user
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Lỗi khi tải chi tiết người dùng');
  }
};

//  Cập nhật người dùng 
exports.updateUser = async (req, res) => {
  try {
    const id = req.params.id;
    await User.update(id, req.body);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: err.message });
  }
};

// ❌ Xóa người dùng
exports.deleteUser = async (req, res) => {
  try {
    const id = req.params.id;

    // Xóa các bản ghi liên quan
    await Notification.deleteByUser(id);
    await Room.deleteByUser(id);
    await User.delete(id);

    res.redirect('/admin/user?deleted=1');
  } catch (err) {
    console.error('Lỗi khi xóa người dùng:', err);
    res.status(500).send('Lỗi khi xóa người dùng: ' + err.message);
  }
};
