// src/models/chitietdatphong.js

class ChiTietDatPhong {
    constructor(
        MaChiTietDatPhong,
        MaPhong,
        MaNguoiDung,
        NgayNhanPhong,
        NgayTraPhong,
        SoLuongKhach,
        TrangThai,
        MaKhuyenMai,
        TongTien,
        LichSu,
        DanhGia
    ) {
        this.MaChiTietDatPhong = MaChiTietDatPhong;
        this.MaPhong = MaPhong;
        this.MaNguoiDung = MaNguoiDung;
        this.NgayNhanPhong = NgayNhanPhong;
        this.NgayTraPhong = NgayTraPhong;
        this.SoLuongKhach = SoLuongKhach;
        this.TrangThai = TrangThai;
        this.MaKhuyenMai = MaKhuyenMai;
        this.TongTien = TongTien;
        this.LichSu = LichSu;
        this.DanhGia = DanhGia;
    }
}

module.exports = ChiTietDatPhong;
