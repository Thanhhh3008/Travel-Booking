class loaiphong {
    constructor(MaLoaiPhong, DienTich, SoKhachToiDa, TenLoaiPhong, Gia, MoTa) {
        this.MaLoaiPhong = MaLoaiPhong;       // Kiểu int (Primary Key)
        this.DienTich = DienTich;             // Kiểu float
        this.SoKhachToiDa = SoKhachToiDa;     // Kiểu int
        this.TenLoaiPhong = TenLoaiPhong;     // Kiểu varchar(255)
        this.Gia = Gia;                       // Kiểu float
        this.MoTa = MoTa;                     // Kiểu varchar(255)
    }
}

module.exports = loaiphong;