const customerModels = require('../../services/CustomerService');
const path = require('path');
const fs = require('fs');
// const 

class ImageController {
    static sendImageAvartar = async (req, res) => {
        const id = req.params.id;

        const mUser = new customerModels();
        const user = await mUser.find(id);
        console.log(user, ' ', id , 'cha cah')
        let imagePath = path.join(__dirname, '../../../public/avartar/avartar-mac-dinh.png');

        if (user.avartar) {
            imagePath = path.join(__dirname, `../../../public/avartar/${user['avartar']}`);
        }

        // đường dẫn ảnh
        res.sendFile(imagePath); // gửi ảnh trực tiếp
    }

    static changeImageAvartarView = (req ,res) => {
        const message = req.session.message;
        delete req.session.message;
        res.render('client/auth/change-avartar', {message , id : req.session.login.maNguoiDung})
    }

    static  changeImageAvartar = async (req, res) => {

        if(!req.session.login) {
            return res.redirect('/login.html');
        }
        if (!req.file) {
            req.session.message = {
                type: 'danger',
                mess: 'Vui lòng chọn ảnh hợp lệ'
            };
            return res.redirect('/change-avatar');
        }


        const filename = req.file.filename;

        const mUser = new customerModels();
        // const user = await mUser.find(req.session.login.maNguoiDung)

        if(!(await mUser.updateImage(req.session.login.maNguoiDung, filename))) {
            req.session.message = {
                type: 'danger',
                mess: 'Đổi ảnh đại diện thất bại !!!'
            };
            req.session.save(() => {
                res.redirect('/');
            });
            return;
        }
        else {
            req.session.message = {
                type: 'success',
                mess: 'Đổi ảnh đại diện thành công !!!'
            };
            req.session.save(() => {
                res.redirect('/');
            });
            return;
        }
    }
}

module.exports = ImageController