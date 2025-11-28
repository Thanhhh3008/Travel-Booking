const express = require('express');
const router = express.Router();
const phongController = require('../../controllers/admin/phongController');
//  Danh sách tất cả phòng 
router.get('/tatca', phongController.getAllRooms);
// Danh sách phòng chờ duyệt
router.get('/', phongController.getPendingRooms);

// Xem chi tiết phòng
router.get('/:id', phongController.getRoomDetail);

// Phê duyệt phòng
router.post('/:id/approve', phongController.approveRoom);
// Từ chối phòng
router.post('/:id/reject', phongController.rejectRoom);
// Ẩn phòng
router.post('/:id/hide', phongController.hideRoom);

// Hiển thị lại phòng
router.post('/:id/show', phongController.showRoom);

router.post('/xoaphong/:id', phongController.deleteRoom);

module.exports = router;
