// const express = require("express");
// const router = express.Router();

// // Trang chat của user
// router.get("/", (req, res) => {
//   res.render("home");
// });

// // Trang chat của admin
// router.get('/admin', (req, res) => {
//   res.render('admin/chat',{title: 'Xử lý khiếu nại'}); // views/admin/chat.ejs
// });
// router.get('/users', async (req, res) => {
//   try {
//     const [rows] = await pool.query("SELECT MaNguoiDung, HoTen FROM NguoiDung");
//     res.json(rows);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Lỗi server" });
//   }
// });
// module.exports = router;
