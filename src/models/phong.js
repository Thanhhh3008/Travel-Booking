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
        MaThietBi
    ) {
        this.MaPhong = MaPhong;                     // int (Primary Key)
        this.SoPhong = SoPhong;                     // varchar(255)
        this.ViTriTang = ViTriTang;                 // int
        this.TrangThaiPhong = TrangThaiPhong;       // varchar(255)
        this.MaLoaiPhong = MaLoaiPhong;             // int (Foreign Key)
        this.View = View;                           // varchar(255)
        this.DiaChi = DiaChi;                       // varchar(255)
        this.Rating = Rating;                       // float
        this.MoTa = MoTa;                           // varchar(255)
        this.HinhAnh = HinhAnh;                     // varchar(255)
        this.MaThietBi = MaThietBi;                 // int (Có thể là Foreign Key)
    }
}

module.exports = Phong;