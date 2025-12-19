// src/routers/clientRouters.js

const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const router = express.Router();
const { requireLogin } = require('../middlewares/authMiddleware');
const HomeController = require('../controllers/client/HomeController');
const AuthController = require('../controllers/client/AuthController');
const RoomController = require('../controllers/client/RoomController');
const BookingController = require('../controllers/client/BookingController');
const RevenueController = require('../controllers/client/RevenueController');
const BookingManageController = require('../controllers/client/BookingManageController');
const ImageController = require('../controllers/client/ImageController');
const uploadAvartar = require('../middlewares/uploadMiddleware');
const ContactController = require('../controllers/client/ContactController');
const ProvinceController = require('../controllers/client/ProvinceController');
const DistrictController = require('../controllers/client/DistrictController');
const WardController = require('../controllers/client/WardController');
// ================== CẤU HÌNH UPLOAD ẢNH ==================

const uploadDir = path.join(__dirname, '..', '..', 'public', 'admin', 'uploads', 'anhphong');

// Tạo thư mục nếu chưa tồn tại
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (_req, file, cb) => {
        let dir = path.join(__dirname, '..', '..', 'public', 'admin', 'uploads', 'anhphong'); // mặc định ảnh phòng

        if (file.fieldname === 'GiayToPhong') {
            dir = path.join(__dirname, '..', '..', 'public', 'admin', 'uploads', 'anhphaply'); // nếu là giấy tờ
        }

        // Tạo thư mục nếu chưa tồn tại
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        cb(null, dir);
    },

    filename: (_req, file, cb) => {
        const timestamp = Date.now();
        const ext = path.extname(file.originalname) || '.jpg';
        const random = Math.round(Math.random() * 1e9);

        const prefix = file.fieldname === 'GiayToPhong' ? 'giayto' : 'anhphong';
        cb(null, `${prefix}-${timestamp}-${random}${ext}`);
    }
});


// Chỉ cho phép file ảnh
const fileFilter = (_req, file, cb) => {
    if (/^image\//i.test(file.mimetype)) cb(null, true);
    else cb(new Error('Chỉ hỗ trợ tải lên tập tin hình ảnh.'));
};

const upload = multer({ storage, fileFilter });

// Upload 2 field: HinhAnh[] và GiayToPhong[]
const uploadRoomImage = (req, res, next) => {
    upload.fields([
        { name: 'HinhAnh', maxCount: 10 },
        { name: 'GiayToPhong', maxCount: 10 }
    ])(req, res, (err) => {
        if (!err) return next();

        req.session.message = {
            mess: err.message || 'Tập tin tải lên không hợp lệ.',
            type: 'danger',
        };
        req.session.save(() => res.redirect('/rooms/add'));
    });
};



// ================== ROUTES ==================

// Trang chủ
router.get('/', HomeController.index);

// API tìm kiếm và lọc phòng
router.get('/api/search-rooms', HomeController.searchRooms);

router.get('/owner/bookings', BookingManageController.index);
router.post('/owner/bookings/:bookingId/checkin', BookingManageController.checkIn);
router.post('/owner/bookings/:bookingId/checkout', BookingManageController.checkOut);
router.post('/owner/bookings/:bookingId/reset-room', BookingManageController.resetRoom);



// Auth
router.get('/login.html', HomeController.login_view);
router.get('/register.html', HomeController.register_view);
router.get('/xac-thuc.html', AuthController.setActiveAccount);
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.get('/logout.html', AuthController.logout);

// Room
// router.get('/rooms', RoomController.index);

router.get('/rooms/add', requireLogin, RoomController.createView);
router.post('/rooms', uploadRoomImage, requireLogin, RoomController.store);
router.get('/rooms/city/:city', RoomController.listByCity);
router.get('/rooms/my-rooms', RoomController.myRooms);
router.post('/rooms/:id/delete', RoomController.delete);

router.post('/rooms/:id/checkin', RoomController.checkIn);
router.post('/rooms/:id/checkout', RoomController.checkOut);
router.post('/rooms/:id/cancel-booking', RoomController.cancelBooking);
router.post('/rooms/:id/reset', RoomController.resetRoom);


// NEW: sửa phòng
// router.get('/rooms/:id/edit', RoomController.editView);
router.post('/rooms/:id', uploadRoomImage, RoomController.update);

router.get('/rooms/:id', RoomController.detail);

router.get('/bookings.html', AuthController.bookingHistoryView)
router.post('/bookings/:id/pay', AuthController.createURLVNpay)
router.get('/checkout/:id_detail', AuthController.checkout)
router.get('/store-packgage-vnpay', AuthController.storePackageVNPay)
// Booking
router.post('/rooms/:roomId/book', BookingController.store);
router.get('/rooms/:roomId/book', BookingController.bookView);
// Revenue
router.get('/revenues', RevenueController.index);
router.get('/revenues/add', RevenueController.createView);
router.post('/revenues', RevenueController.store);
router.get('/revenues/:id/edit', RevenueController.editView);
router.post('/revenues/:id', RevenueController.update);
// get image
router.get('/get-avartar-user/:id', ImageController.sendImageAvartar)

// profile
router.get('/profile.html', AuthController.profileView);
router.get('/profile/edit-info', AuthController.changeInfoView);
router.post('/profile/update', AuthController.changInformationOfCustomer)

// Change Password (for logged-in user)
router.get('/change-password.html', requireLogin, AuthController.changePasswordView);
router.post('/changepassword', requireLogin, AuthController.changepassword);


router.post('/change-avatar', uploadAvartar.single('avatar'), ImageController.changeImageAvartar)
router.get('/change-avartar.html', requireLogin, ImageController.changeImageAvartarView)

// Review
router.post('/rooms/:roomId/review', RoomController.review);
router.get('/province', ProvinceController.getAllProvinces)
router.get('/province/:id', ProvinceController.getProvinceById)

router.get('/district/:id_province', DistrictController.getDistrictsByIdProvince)
router.get('/find/district/:id', DistrictController.getDistrictById)


router.get('/contact.html', ContactController.contactView)
router.post('/contact', ContactController.senderEmail)
router.get('/ward/:id_district', WardController.getWardsByIdDistrict)
router.get('/find/ward/:id', WardController.getWardById)
module.exports = router;
