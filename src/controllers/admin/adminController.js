const BookingService = require('../../services/BookingService');
const RevenueService = require('../../services/RevenueService');
const PhongModel = require('../../models/admin/Phong');
const ThongBaoModel = require('../../models/admin/ThongBao'); 
const NguoiDungModel = require('../../models/admin/NguoiDung');

class AdminController {

  static dashboard = async (req, res) => {
    try {
     
      

      // Lấy số liệu
    const totalUsers = await NguoiDungModel.countAll();
    const totalRooms = await PhongModel.countAll();
      const todayBookings = await BookingService.countToday();
      const totalRevenue = await RevenueService.sumRevenue();

      res.render('admin/admin_dashboard', {
        title: 'Trang quản trị Admin',
        stats: {
          users: totalUsers,
          rooms: totalRooms,
          bookingsToday: todayBookings,
          revenue: totalRevenue
        }
      });

    } catch (err) {
      console.error('Admin dashboard error:', err);
      res.render('admin/admin_dashboard', {
        title: 'Trang quản trị Admin',
        stats: {
          users: 0,
          rooms: 0,
          bookingsToday: 0,
          revenue: 0
        }
      });
    }
  };

}

module.exports = AdminController;
