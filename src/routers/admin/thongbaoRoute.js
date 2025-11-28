const express = require('express');
const router = express.Router();
const thongbaoController = require('../../controllers/admin/thongbaoController');
const multer = require('multer');
const path = require("path");
const uploadPath = path.join(process.cwd(), "public/admin/uploads/thumbnail_thongbao");

const fs = require("fs");

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("SAVE TO:", uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

// ======================= ROUTES =======================

// Danh sách thông báo
router.get('/', thongbaoController.getAllThongBao);

// Thêm thông báo  
router.post('/add', upload.single('thumbnail'), thongbaoController.addThongBao);

// Sửa thông báo  
router.post('/edit/:id', upload.single('thumbnail'), thongbaoController.editThongBao);

// Xóa thông báo
router.get('/delete/:id', thongbaoController.deleteThongBao);

router.get('/detail/:id', thongbaoController.viewThongBaoDetail);
module.exports = router;
