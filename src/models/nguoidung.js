class nguoidung {
    constructor(
        maNguoiDung,
        hoTen,
        ngaySinh,
        cccd,
        username,
        password,
        
        diaChi,
        sdt,
        quocTich,
        rating,
        discriminator,
        email,
        status,
        MaVaiTro  
    ) {
        this.maNguoiDung = maNguoiDung;
        this.hoTen = hoTen;           // Ánh xạ từ 'HoTen'
        this.ngaySinh = ngaySinh;     // Ánh xạ từ 'NgaySinh'
        this.cccd = cccd;             // Ánh xạ từ 'CCCD'
        this.username = username;     // Ánh xạ từ 'Username'
        this.password = password;
      
        this.diaChi = diaChi;         // Ánh xạ từ 'DiaChi'
        this.sdt = sdt;               // Ánh xạ từ 'SDT'
        this.quocTich = quocTich;     // Ánh xạ từ 'QuocTich'
        this.rating = rating;         // Ánh xạ từ 'Rating'
        this.discriminator = discriminator;
        this.email = email;
        this.status = status;
        this.MaVaiTro = MaVaiTro;
    }
}

module.exports = nguoidung