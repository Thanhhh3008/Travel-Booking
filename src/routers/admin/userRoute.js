const express = require('express');
const router = express.Router();
const userController = require('../../controllers/admin/userController');

//  Danh sách người dùng
router.get('/', userController.getAllUsers);

//  Xem chi tiết
router.get('/detail/:id', userController.getUserDetail);

//  Cập nhật người dùng (AJAX inline edit)
router.post('/update/:id', userController.updateUser);

//  Xóa người dùng
router.get('/delete/:id', userController.deleteUser);

module.exports = router;
