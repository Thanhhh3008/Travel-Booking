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
             

       

// chọn 5 thành phố nổi bật
const cities = ["Hà Nội", "Đà Nẵng", "Đà lạt", "Hồ Chí Minh", "Bà Rịa - Vũng Tàu"];



const roomsByCity = {};

for (const city of cities) {
    // Tìm theo pr.name thay vì p.DiaChi
        roomsByCity[city] = await roomService.getAll(
            `WHERE (pr.name LIKE ? OR d.name LIKE ?)
            AND p.TrangThaiPhong = 'Đang hoạt động'`,
            [`%${city}%`, `%${city}%`]
        );
}

            // Lấy danh sách thành phố và loại phòng từ database
            const allCities = await roomService.getAllCities();
            const allRoomTypes = await categoryRoomService.getAll();
            
            const thongbao = req.session.login  ? await ThongBao.getByUser(req.session.login.maNguoiDung) : [];
            res.render('client/home/index', { 
                    
                    message,
                    
                    roomsByCity,
                    allCities,
                    allRoomTypes,
                    thongbao,
                    currentUser 
});
        } catch (error) {
            console.error('Error fetching data:', error);
            res.status(500).send('Internal Server Error');
        }
    }

    /**
     * API endpoint để lọc và tìm kiếm phòng từ database
     */
    static searchRooms = async (req, res) => {
    try {
        const { search, city, roomType, priceRange, rating } = req.query;
        const roomService = new RoomService();
        
        // Xây dựng điều kiện WHERE
        let conditions = ["p.TrangThaiPhong = 'Đang hoạt động'"];
        let params = [];
        
        // TÌM KIẾM THEO TEXT - TÌM TRONG PROVINCE NAME
        if (search && search.trim()) {
            conditions.push(`(
                pr.name LIKE ? OR 
                d.name LIKE ? OR 
                p.TenChoO LIKE ? OR 
                p.DiaChi LIKE ?
            )`);
            const searchPattern = `%${search.trim()}%`;
            params.push(searchPattern, searchPattern, searchPattern, searchPattern);
        }
        
        //  LỌC THEO THÀNH PHỐ - TÌM TRONG PROVINCE NAME
        if (city && city.trim()) {
            conditions.push("pr.name = ?");
            params.push(city.trim());
        }
        
        // Lọc theo loại phòng
        if (roomType && roomType.trim()) {
            conditions.push("lp.TenLoaiPhong = ?");
            params.push(roomType.trim());
        }
        
        // Lọc theo giá
        if (priceRange && priceRange.trim()) {
            const [minPrice, maxPrice] = priceRange.split('-').map(p => parseInt(p));
            conditions.push("p.gia BETWEEN ? AND ?");
            params.push(minPrice, maxPrice);
        }
        
        // Lọc theo rating
        if (rating && rating.trim()) {
            const minRating = parseFloat(rating);
            conditions.push("p.Rating >= ?");
            params.push(minRating);
        }
        
        const whereClause = `WHERE ${conditions.join(' AND ')}`;
        const rooms = await roomService.getAll(whereClause, params);
        
        res.json({
            success: true,
            data: rooms,
            count: rooms.length
        });
    } catch (error) {
        console.error('Error searching rooms:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi tìm kiếm phòng',
            error: error.message
        });
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
