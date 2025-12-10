class Booking {
    constructor(
        MaChiTietDatPhong,
        MaNguoiDung,
        MaPhong,
        NgayNhanPhong,
        NgayTraPhong,
        SoLuongKhach,
        SoLuongPhong,
        TrangThai,
        MaKhuyenMai,
        TongTien,
        LichSu,
        DanhGia,
        PHONGMaPhong
    ) {
        // Khóa chính (Primary Key)
        this.MaChiTietDatPhong = MaChiTietDatPhong;

        // Khóa ngoại (Foreign Keys)
        this.MaNguoiDung = MaNguoiDung;
        this.MaPhong = MaPhong;

        // Thông tin đặt phòng
        this.NgayNhanPhong = NgayNhanPhong; // Tương ứng NgayCheckIn
        this.NgayTraPhong = NgayTraPhong;   // Tương ứng NgayCheckOut
        this.SoLuongKhach = SoLuongKhach;
        this.SoLuongPhong = SoLuongPhong;

        // Trạng thái và tài chính
        this.TrangThai = TrangThai;
        this.MaKhuyenMai = MaKhuyenMai;
        this.TongTien = TongTien;

        // Thông tin bổ sung
        this.LichSu = LichSu;
        this.DanhGia = DanhGia;

        // Trường này có thể là Foreign Key dạng chuỗi hoặc do ORM sinh ra
        this.PHONGMaPhong = PHONGMaPhong;
    }
}

module.exports = Booking;