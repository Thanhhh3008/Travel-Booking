// const KhieuNaiModel = require('../models/KhieuNai');
// const NguoiDungModel = require('../models/NguoiDung');
// const ThongBaoModel = require('../models/ThongBao');
// const { sendMail } = require('../utils/mailer');

// // Hiển thị danh sách khiếu nại
// exports.getAll = async (req, res) => {
//   try {
//     const reports = await KhieuNaiModel.getAll();
//     res.render('admin/khieunai', {
//       title: 'Quản lý khiếu nại',
//       reports
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Lỗi khi lấy danh sách khiếu nại: " + err.message);
//   }
// };

// // Xem chi tiết 1 khiếu nại
// exports.getDetail = async (req, res) => {
//   try {
//     const id = req.params.id;
//     const report = await KhieuNaiModel.getById(id);

//     if (!report) return res.status(404).send("Không tìm thấy khiếu nại");

//     res.render('admin/chitietKhieuNai', {
//       title: 'Chi tiết khiếu nại',
//       report
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Lỗi khi lấy chi tiết khiếu nại: " + err.message);
//   }
// };

// // Admin trả lời khiếu nại
// exports.reply = async (req, res) => {
//   try {
//     const id = req.params.id;
//     const { reply } = req.body;

//     await KhieuNaiModel.reply(id, reply);

//     const report = await KhieuNaiModel.getById(id);
//     const user = await NguoiDungModel.getById(report.MaNguoiDung);

//     // Thêm thông báo nội bộ
//     await ThongBaoModel.add(
//       'Phản hồi khiếu nại',
//       `Admin đã phản hồi khiếu nại của bạn: "${reply}"`,
//       'Người dùng',
//       'ca_nhan',
//       report.MaNguoiDung
//     );

//     // Gửi email cho người dùng
//     if (user && user.Email) {
//       await sendMail(
//         user.Email,
//         'Phản hồi khiếu nại từ hệ thống',
//         `
//           <h3>Xin chào ${user.HoTen || user.Username},</h3>
//           <p>Hệ thống đã phản hồi khiếu nại của bạn:</p>
//           <blockquote>${reply}</blockquote>
//         `
//       );
//     }

//     res.redirect('/admin/khieunai?reply=1');

//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Lỗi khi phản hồi khiếu nại: " + err.message);
//   }
// };

// // Xóa khiếu nại
// exports.delete = async (req, res) => {
//   try {
//     await KhieuNaiModel.delete(req.params.id);
//     res.redirect('/admin/khieunai?deleted=1');
//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Lỗi khi xóa: " + err.message);
//   }
// };
