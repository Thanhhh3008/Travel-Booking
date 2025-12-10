class DoanhThu {
    constructor(
        MaDoanhThu,
        NgayLap,
        DoanhThuTuPhong,
        DoanhThuTuDichVu,
        MoTa,
        TenDoanhThu
    ) {
        this.MaDoanhThu = MaDoanhThu;
        this.NgayLap = NgayLap;
        this.DoanhThuTuPhong = DoanhThuTuPhong;
        this.DoanhThuTuDichVu = DoanhThuTuDichVu;
        this.MoTa = MoTa;
        this.TenDoanhThu = TenDoanhThu;
    }
}

module.exports = DoanhThu;
