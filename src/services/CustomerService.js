// const customer = require('../models/nguoidung');
const pool = require('../database/client');
const bcrypt = require('bcrypt');
const nguoidung = require('../models/nguoidung');


class CustomerService {
    getAll = async (cond = null) => {
        try {
            let query = `SELECT * FROM nguoidung`;
            if (cond) {
                query += cond;
            }

            const [result, fields] = await pool.execute(query);
            return result.map(row => {
                return new nguoidung(
                    row.MaNguoiDung,
                    row.HoTen,
                    row.NgaySinh,
                    row.CCCD,
                    row.Username,
                    row.Password,

                    row.DiaChi,
                    row.SDT,
                    row.QuocTich,
                    row.Rating,
                    row.Discriminator,
                    row.Email,
                    row.status,
                    row.MaVaiTro,
                    row.avartar
                );
            });
        } catch (err) {
            console.error(err);
            return [];
        }
    }
    // tìm kiếm tất cả khách hàng với điều kiện
    find = async (id) => {
        const cond = ` WHERE MaNguoiDung = ${id}`;
        const tmp = await this.getAll(cond);
        if (tmp.length == 0) {
            return null;
        }
        const customerItem = tmp[0];
        return customerItem;
    }

    // tìm khách hàng theo email
    findByEmail = async (email) => {
        const cond = ` WHERE \`Email\` = '${email}'`;
        const tmp = await this.getAll(cond);
        if (tmp.length == 0) {
            return false;
        }
        const customerItem = tmp[0];
        return customerItem;
    }

    // tìm khách hàng theo nguoidungname
    findByUsername = async (nguoidungname) => {
        const cond = ` WHERE \`Username\` = '${nguoidungname}'`;
        const tmp = await this.getAll(cond);
        if (tmp.length == 0) {
            return false;
        }
        const customerItem = tmp[0];
        return customerItem;
    }

    // thêm mới khách hàng
    save = async (customerData) => {

        try {
            const [result] = await pool.execute(`INSERT INTO nguoidung (HoTen, NgaySinh, CCCD, Username, Password, DiaChi, SDT, QuocTich, Rating, Discriminator, Email , status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? , ?)`, [
                customerData.name,
                customerData.birthday || null,
                customerData.cccd || null,
                customerData.username,
                customerData.password,

                customerData.address || null,
                customerData.phone || null,
                customerData.country || null,
                customerData.rating || null,
                customerData.discriminator || null,
                customerData.email,
                customerData.status || 0
            ]);
            return result.insertId;;
        } catch (err) {
            console.error(err);
            return false;
        }
    }

    // kích hoạt tài khoản
    setActiveStatus = async (email) => {
        console.log(email);
        const query = `UPDATE nguoidung SET status = 1 WHERE Email = ?`;
        try {
            const [result] = await pool.execute(query, [email]);

            return result.affectedRows > 0;
        } catch (err) {
            console.error(err);
            return false;
        }
    }

    // cập nhật mật khẩu
    updatePassword = async (userId, newPassword) => {
        const query = `UPDATE nguoidung SET Password = ? WHERE MaNguoiDung = ?`;
        try {
            const [result] = await pool.execute(query, [newPassword, userId]);
            return result.affectedRows > 0;
        } catch (err) {
            console.error(err);
            return false;
        }
    }

    updateImage = async (userId, newImage) => {
        const query = `UPDATE nguoidung SET avartar = ? WHERE MaNguoiDung = ?`;

        try {
            const [result] = await pool.execute(query, [newImage, userId]);
            return result.affectedRows > 0;
        }catch(err) {
            console.error(err);
            return false;
        }
    }


    // cập nhật thông tin khách hàng
    update = async (customerData) => {
        // console.log(customerData, 'uỷtdyrtd');

        // 1. Lưu ý thay 'TEN_BANG_CUA_BAN' bằng tên bảng thực tế (VD: NguoiDung hoặc KhachHang)
        // 2. Các cột đã được map lại theo đúng hình ảnh (HoTen, SDT, Email, v.v.)
        // 3. Khóa chính để WHERE là 'MaNguoiDung' chứ không phải 'id'
        const query = `
        UPDATE nguoidung 
        SET 
            HoTen = ?, 
            NgaySinh = ?, 
            CCCD = ?, 
            Username = ?, 
            Password = ?, 
            Email = ?, 
            DiaChi = ?, 
            SDT = ?, 
            QuocTich = ?, 
            status = ?, 
            avartar = ?, 
            MaVaiTro = ? 
        WHERE MaNguoiDung = ?`;

        const values = [
            customerData.HoTen,       // Tương ứng cột HoTen
            customerData.NgaySinh,    // Tương ứng cột NgaySinh
            customerData.CCCD || '',        // Tương ứng cột CCCD
            customerData.Username,    // Tương ứng cột Username
            customerData.Password,    // Tương ứng cột Password
            customerData.Email,       // Tương ứng cột Email
            customerData.DiaChi,      // Tương ứng cột DiaChi (Thay cho housenumber_street/ward_id cũ)
            customerData.SDT,         // Tương ứng cột SDT
            customerData.QuocTich || 'vn',    // Tương ứng cột QuocTich
            customerData.status,      // Tương ứng cột status
            customerData.avartar,     // Tương ứng cột avartar (Lưu ý: Trong hình DB bạn đang đặt tên sai chính tả là 'avartar' thay vì 'avatar')
            customerData.MaVaiTro,    // Tương ứng cột MaVaiTro
            customerData.MaNguoiDung  // KHÓA CHÍNH: Tương ứng cột MaNguoiDung
        ];

        try {
            const [result] = await pool.execute(query, values);
            return result.affectedRows > 0;
        } catch (err) {
            console.error(err);
            return false;
        }
    }

    // xóa khách hàng
    // destroy = async (id) => {
    //     const query = `DELETE FROM customer WHERE id = ?`;
    //     try {
    //         const [result] = await pool.execute(query, [id]);
    //         return result.affectedRows > 0;
    //     } catch (err) {
    //         console.error(err);
    //         return false;
    //     }
    // }
}


module.exports = CustomerService;