const CategoryRoomService = require('../../services/CategoryRoomService');
const RoomService = require('../../services/RoomService');
const ThongBao = require('../../models/admin/ThongBao');
const User = require('../../models/admin/NguoiDung');
class HomeController {
     static index = async (req, res) => {
        const message = req.session.message;
        delete req.session.message;
 console.log("LOGIN SESSION:", req.session.login);  // <--- kiểm tra login
        try {
            const categoryRoomService = new CategoryRoomService();
            const roomService = new RoomService();
            let currentUser = null;
            
            if (req.session.login) {
                currentUser = await User.getById(req.session.login.maNguoiDung);
      }
             

            const statuses = ['Trống'];
const placeholders = statuses.map(() => '?').join(', '); // "?, ?"

const cities = ["Hà Nội", "Đà Nẵng", "Đà Lạt", "Hồ Chí Minh", "Vũng Tàu"];

const roomsByCity = {};

for (const city of cities) {
    roomsByCity[city] = await roomService.getAll(
        `WHERE p.TrangThaiPhong IN (${placeholders}) AND p.ThanhPho LIKE ?`,
        [...statuses, `%${city}%`]
    );
}

       
            const thongbao = req.session.login  ? await ThongBao.getByUser(req.session.login.maNguoiDung) : [];
            res.render('client/home/index', { 
                    message,
                    
                    roomsByCity,
                    thongbao,
                    currentUser 
});
        } catch (error) {
            console.error('Error fetching data:', error);
            res.status(500).send('Internal Server Error');
        }
    }

    static login_view = (req, res) => {
        const message = req.session.message;
        delete req.session.message;
        res.render('client/auth/login', { message });
    };

    static register_view = (req, res) => {
        const message = req.session.message;
        delete req.session.message;
        res.render('client/auth/register', { message });
    };
}


module.exports = HomeController;
