const jwt = require('jsonwebtoken');
const { sendMailVerify } = require('../../util/mailer');
const dayjs = require('dayjs');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const customerModels = require('../../services/CustomerService');


require('dotenv').config();

class AuthController {
    static sendToVerifyEmail = async (email) => {
        const payload = { email: email };
        const secretKey = process.env.KEY_JWT;
        const token = jwt.sign(payload, secretKey, { expiresIn: '15m' });

        const html = `<div style="font-family: Arial, sans-serif; padding:32px; background:#f7f9fa; color:#222; max-width:500px; margin:40px auto; border-radius:12px; box-shadow:0 4px 24px rgba(0,0,0,0.07);">
  <h2 style="color:#2196F3; margin-bottom:8px;">🎉 Chào mừng bạn đến với <span style="color:#1976d2;">TRIPSTAY</span>!</h2>
  <p style="font-size:16px; margin-bottom:24px;">
    Cảm ơn bạn đã đăng ký tài khoản. Để hoàn tất quá trình đăng ký, vui lòng xác thực tài khoản của bạn bằng cách nhấn vào nút bên dưới:
  </p>
  
  <div style="text-align:center; margin-bottom:28px;">
    <a href="${process.env.DOMAIN}/xac-thuc.html?token=${token}" style="display:inline-block; padding:12px 32px; background:#1976d2; color:#fff; border-radius:6px; font-size:16px; font-weight:bold; text-decoration:none; box-shadow:0 2px 8px rgba(33,150,243,0.10); transition:background 0.2s;">
      Xác thực tài khoản
    </a>
  </div>

  <div style="background:#fff; border-radius:8px; padding:18px 16px; margin-bottom:20px; box-shadow:0 2px 8px rgba(33,150,243,0.06);">
    <p style="margin:10px 0; font-size:15px;">
      Nếu bạn không thực hiện đăng ký, vui lòng bỏ qua email này.
    </p>
    <p style="margin:10px 0; color:#d32f2f; font-size:13px; font-weight:500;">
      <strong>Lưu ý:</strong> Liên kết xác thực chỉ có hiệu lực trong vòng <b>15 phút</b>. Vui lòng xác thực tài khoản trước khi hết hạn!
    </p>
  </div>

  <p style="font-size:12px; color:#888; margin-top:24px; text-align:center;">
    Email này được gửi tự động từ hệ thống của chúng tôi.
  </p>
</div>`;

        if (await sendMailVerify(email, 'XÁC THỰC TÀI KHOẢN', html)) {
            console.log('Oke Con Dê');
        }
        else {
            console.log('Oh No No No');
        }
    }

    static setActiveAccount = async (req, res) => {
        const token = req.query['token'];
        const mCustomer = new customerModels();

        try {
            const data = jwt.verify(token, process.env.KEY_JWT);
            const tmp = data.email;
            // console.log(tmp)
            if (await mCustomer.setActiveStatus(tmp)) {
                req.session.message = {
                    mess: `Kích hoạt tài khoản thành công, bạn có thể đăng nhập ngay bây giờ`,
                    type: 'success'
                };

                req.session.save(() => {
                    res.redirect('/');
                });
                return;
            }

            req.session.message = {
                mess: `Kích hoạt tài khoản không thành công, vui lòng thử lại sau`,
                type: 'danger'
            };

            req.session.save(() => {
                res.redirect('/');
            });

        } catch (err) {
            req.session.message = {
                mess: `Token không hợp lệ hoặc đã hết hạn`,
                type: 'danger'
            };

            req.session.save(() => {
                res.redirect('/');
            });
            return;
        }
    }

    static register = async (req, res) => {
        const data = req.body;
        const mCustomer = new customerModels();

        data.name = data.nfirst + " " + data.nlast

        data.status = 0;

        const salt = bcrypt.genSaltSync(saltRounds);
        const hash = bcrypt.hashSync(data.password, salt);
        data.password = hash;
        data.status = 0;
        data.name = data.nfirst + " " + data.nlast;


        if (await mCustomer.findByEmail(data.email)) {
            req.session.message = {
                mess: `Email đã được đăng ký, vui lòng sử dụng email khác`,
                type: 'danger'
            };
            req.session.save(() => {
                res.redirect('/');
            });
            return;
        }

        if (await mCustomer.findByUsername(data.username)) {
            req.session.message = {
                mess: `Username đã được đăng ký, vui lòng sử dụng username khác`,
                type: 'danger'
            };

            req.session.save(() => {
                res.redirect('/');
            });
            return;
        }

        if (await mCustomer.save(data)) {
            req.session.message = {
                mess: `Tạo tài khoản thành công, vui lòng check Email để kích hoạt tài khoản`,
                type: 'success'
            };

            req.session.save(() => {
                res.redirect('/');
            });

            await this.sendToVerifyEmail(data.email);
            return;
        }

        req.session.message = {
            mess: `Tạo tài khoản không thành công, vui lòng kiểm tra lại thông tin`,
            type: 'danger'
        };

        req.session.save(() => {
            res.redirect('/');
        });

    }

    static login = async (req, res) => {
        const data = req.body;
        const mCustomer = new customerModels();

        console.log(data)

        const user = await mCustomer.findByEmail(data.email);
        // console.log(user)
        console.log("req.body.password =", data.password);
console.log("user.Password =", user.password);

        if (!user) {
            req.session.message = {
                mess: `Username không tồn tại`,
                type: 'danger'
            };

            req.session.save(() => {
                res.redirect('/');
            });
            return;
        }

        if (!user.status) {
            req.session.message = {
                mess: `Tài khoản chưa được kích hoạt, vui lòng kiểm tra email để kích hoạt tài khoản hoặc liên hệ với quản trị viên`,
                type: 'danger'
            };

            req.session.save(() => {
                res.redirect('/');
            });
            return;
        }
        // Nếu user.password là Buffer
const hash = user.password.toString();  // default là 'utf8'

        if (!bcrypt.compareSync(data.password,hash)) {
            req.session.message = {
                mess: `Mật khẩu không đúng`,
                type: 'danger'
            };

            req.session.save(() => {
                res.redirect('/');
            });
            return;
        }

        req.session.login = user;
        req.session.message = {
            mess: `Đăng nhập thành công`,
            type: 'success'
        };

        req.session.save(() => {
            res.redirect('/');
        });
    }

    static logout = (req, res) => {
        req.session.destroy(() => {
            return res.redirect('/');
        });
    }

    // static sendMailChangePass = async (email) => {
    //     // kiểm tra email có tồn tại trong hệ thống không
    //     const payload = { email: email };
    //     const secretKey = process.env.KEY_JWT;
    //     const token = jwt.sign(payload, secretKey, { expiresIn: '15m' });

    //     const html = ``;

    // }
    static findEmailCustomer = async (email, name) => {
        const mCustomer = new customerModels();
        const rs = await mCustomer.findByEmail(email)
        if (!rs) {
            const data = {
                name: name,//
                phone: '',//
                email: email,//
                ward_id: null,
                created_date: new Date(),//
                status: 1,//
                housenumber_street: '',
                shipping_name: '',
                shipping_mobile: '',
                password: '',//
                username: null//
            }
            const newCus = await mCustomer.save(data);
            return {
                name: name,
                email: email,
                id: newCus
            }
        }
        return rs;

    }

    static changInformationOfCustomer = async (req, res) => {
        const data = req.body;
        const mCustomer = new customerModels();

        // Lấy data khách hàng
        const user = await mCustomer.find(data.id);

        const updatedData = {
            name: data.name,
            phone: data.phone,
            email: user.email,
            ward_id: user.ward_id,
            housenumber_street: user.housenumber_street,
            shipping_name: user.shipping_name,
            shipping_mobile: user.shipping_mobile,
            status: 1,
            id: data.id,
            password: user.password, // giữ nguyên mật khẩu cũ nếu không thay đổi
            username: user.username // giữ nguyên username cũ nếu không thay đổi
        };

        // khi có nhập mật khẩu thì mới kiểm tra mật khẩu hiện tại
        if (data.current_password !== '') {
            if (!bcrypt.compareSync(data.current_password, user.password)) {
                req.session.message = {
                    mess: `Mật khẩu hiện tại không đúng`,
                    type: 'danger'
                };

                req.session.save(() => {
                    res.redirect('/thong-tin-ca-nhan.html');
                });
                return;
            }

            if (data.new_password === '') {
                req.session.message = {
                    mess: `Vui lòng nhập mật khẩu mới`,
                    type: 'danger'
                };
                req.session.save(() => {
                    res.redirect('/thong-tin-ca-nhan.html');
                });
                return;
            }

            const salt = bcrypt.genSaltSync(saltRounds);
            const hash = bcrypt.hashSync(data.new_password, salt);

            updatedData.password = hash;
        }


        // const newPasswordHash = bcrypt.hashSync(data.new_password, saltRounds);
        // await mCustomer.updatePassword(user.id, hash);

        if (!(await mCustomer.update(updatedData))) {
            req.session.message = {
                mess: `Cập nhật thất bại , hãy thử lại sau !!!`,
                type: 'danger'
            };
            req.session.save(() => {
                res.redirect('/thong-tin-ca-nhan.html');
            });
            return;
        }

        req.session.user.name = data.name;

        req.session.message = {
            mess: `Thay đối thông tin thành công`,
            type: 'success'
        };

        req.session.save(() => {
            res.redirect('/thong-tin-ca-nhan.html');
        });
    }

    static sendChangePassEmail = async (req, res) => {
        const email = req.body.email;
        const mCustomer = new customerModels();
        const tmp = await mCustomer.findByEmail(email);

        // Kiểm tra email có tồn tại trong hệ thống không
        if (!tmp) {
            req.session.message = {
                mess: `Email không tồn tại trong hệ thống`,
                type: 'danger'
            };

            req.session.save(() => {
                res.redirect('/');
            });
            return;
        }

        // Kiểm tra tài khoản đã được kích hoạt chưa
        if (tmp.status === 0) {
            req.session.message = {
                mess: `Tài khoản chưa được kích hoạt, vui lòng kiểm tra email để kích hoạt tài khoản hoặc liên hệ với quản trị viên`,
                type: 'danger'
            };
            req.session.save(() => {
                res.redirect('/');
            });
            return;
        }


        const payload = { email: email };
        const secretKey = process.env.KEY_JWT;
        const token = jwt.sign(payload, secretKey, { expiresIn: '15m' });

        const html = `<div style="font-family: Arial, sans-serif; padding:32px; background:#f7f9fa; color:#222; max-width:500px; margin:40px auto; border-radius:12px; box-shadow:0 4px 24px rgba(0,0,0,0.07);">
  <h2 style="color:#2196F3; margin-bottom:8px;">🔒 Yêu cầu đổi mật khẩu tài khoản <span style="color:#1976d2;">TECHSHOP</span></h2>
  <p style="font-size:16px; margin-bottom:24px;">
    Bạn vừa gửi yêu cầu đổi mật khẩu. Để đặt lại mật khẩu mới, vui lòng nhấn vào nút bên dưới:
  </p>
  
  <div style="text-align:center; margin-bottom:28px;">
    <a href="${process.env.DOMAIN}/doi-mat-khau.html?token=${token}" style="display:inline-block; padding:12px 32px; background:#1976d2; color:#fff; border-radius:6px; font-size:16px; font-weight:bold; text-decoration:none; box-shadow:0 2px 8px rgba(33,150,243,0.10); transition:background 0.2s;">
      Đổi mật khẩu
    </a>
  </div>

  <div style="background:#fff; border-radius:8px; padding:18px 16px; margin-bottom:20px; box-shadow:0 2px 8px rgba(33,150,243,0.06);">
    <p style="margin:10px 0; font-size:15px;">
      Nếu bạn không yêu cầu đổi mật khẩu, vui lòng bỏ qua email này.
    </p>
    <p style="margin:10px 0; color:#d32f2f; font-size:13px; font-weight:500;">
      <strong>Lưu ý:</strong> Liên kết đổi mật khẩu chỉ có hiệu lực trong vòng <b>15 phút</b>. Vui lòng thực hiện trước khi hết hạn!
    </p>
  </div>

  <p style="font-size:12px; color:#888; margin-top:24px; text-align:center;">
    Email này được gửi tự động từ hệ thống TECHSHOP.
  </p>
</div>`;

        if (await sendMailVerify(email, 'ĐỐI MẬT KHẨU TÀI KHOẢN TẠI WEBSITE TECHSHOP', html)) {
            req.session.message = {
                mess: `Đã gửi email đổi mật khẩu đến địa chỉ ${email}, vui lòng kiểm tra email để thực hiện`,
                type: 'success'
            };

            req.session.save(() => {
                res.redirect('/');
            });
            return;
        }
        else {
            req.session.message = {
                mess: `Gửi email đổi mật khẩu không thành công, vui lòng thử lại sau`,
                type: 'danger'
            };

            req.session.save(() => {
                res.redirect('/');
            });
            return;
        }

    }

    static changePasswordByMail = async (req, res) => {
        const token = req.query['token'];
        const mCustomer = new customerModels();

        try {
            const data = jwt.verify(token, process.env.KEY_JWT);
            const tmp = data.email;

            const user = await mCustomer.findByEmail(tmp);
            console.log(tmp)
            if (!user) {
                req.session.message = {
                    mess: `Email không tồn tại trong hệ thống`,
                    type: 'danger'
                };

                req.session.save(() => {
                    res.redirect('/');
                });


                return;
            }
            return res.render('client/customer/formChangePassByEmail', { token1: token, user1: user });
        } catch (err) {

            req.session.message = {
                mess: `Token không hợp lệ hoặc đã hết hạn`,
                type: 'danger'
            };

            req.session.save(() => {
                res.redirect('/');
            });

            return;
        }
    }

    static changepassword = async (req, res) => {
        const dataParser = req.body;
        const mCustomer = new customerModels();


        try {
            // Xác thực khóa jwt
            const data = jwt.verify(dataParser.token, process.env.KEY_JWT);

            // tìm tài khoản cần update bằng email
            const email = data.email;
            const user = await mCustomer.findByEmail(email);

            // Băm mật khẩu mới của người dùng
            const salt = bcrypt.genSaltSync(saltRounds);
            const hash = bcrypt.hashSync(dataParser.new_password, salt);

            // Tiến hành setup data của người dùng
            const updatedData = {
                name: user.name,
                phone: user.phone,
                email: user.email,
                ward_id: user.ward_id,
                housenumber_street: user.housenumber_street,
                shipping_name: user.shipping_name,
                shipping_mobile: user.shipping_mobile,
                status: 1,
                id: user.id,
                password: hash, // sử dụng mật khẩu mới đã băm
                username: user.username // giữ nguyên username cũ nếu không thay đổi
            };

            if (!(await mCustomer.update(updatedData))) {
                req.session.message = {
                    mess: `Cập nhật thất bại , hãy thử lại sau !!!`,
                    type: 'danger'
                };
                req.session.save(() => {
                    res.redirect('/');
                });
                return;
            }

            req.session.message = {
                mess: `Đổi mật khẩu thành công, bạn có thể đăng nhập ngay bây giờ`,
                type: 'success'
            };
            req.session.save(() => {
                res.redirect('/');
            });
            return;

        } catch (error) {
            // console.log(error);
            req.session.message = {
                mess: `Token không hợp lệ hoặc đã hết hạn hãy thử lại sau !!!`,
                type: 'danger'
            };
            req.session.save(() => {
                res.redirect('/');
            });
            return;
        }
    }
}
module.exports = AuthController;