// src/models/phong.js

class Phong {
    constructor(
        MaPhong,
        SoPhong,
        ViTriTang,
        TrangThaiPhong,
        MaLoaiPhong,
        View,
        DiaChi,
        Rating,
        MoTa,
        HinhAnh,
        MaThietBi,
        //MaNguoiDung,   // chủ phòng (người đăng)
    ) {
        this.MaPhong = MaPhong;
        this.SoPhong = SoPhong;
        this.ViTriTang = ViTriTang;
        this.TrangThaiPhong = TrangThaiPhong;
        this.MaLoaiPhong = MaLoaiPhong;
        this.View = View;
        this.DiaChi = DiaChi;
        this.Rating = Rating;
        this.MoTa = MoTa;
        this.HinhAnh = HinhAnh;
        this.MaThietBi = MaThietBi;
        //this.MaNguoiDung = MaNguoiDung;
    }
}

module.exports = Phong;
