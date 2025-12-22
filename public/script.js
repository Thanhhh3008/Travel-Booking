/*************************************************
 * THÊM RULE REGEX CHUNG
 *************************************************/
$.validator.addMethod(
    "regex",
    function (value, element, regexp) {
        let re = new RegExp(regexp);
        return this.optional(element) || re.test(value);
    },
    "Định dạng không hợp lệ"
);

/*************************************************
 * RULE EMAIL GMAIL
 *************************************************/
$.validator.addMethod(
    "gmail",
    function (value, element) {
        return this.optional(element) || /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(value);
    },
    "Vui lòng nhập email Gmail hợp lệ (vd: ten@gmail.com)"
);

/*************************************************
 * VALIDATE LOGIN
 *************************************************/
$(".form-login").validate({
    rules: {
        email: {
            required: true,
            gmail: true
        },
        password: {
            required: true,
            minlength: 6,
            regex: /^(?=.*[A-Z])(?=.*\d).{6,}$/
            // Ít nhất 1 chữ hoa + 1 số + tối thiểu 6 ký tự
        }
    },
    messages: {
        email: {
            required: "Vui lòng nhập email",
            gmail: "Chỉ chấp nhận email Gmail (vd: ten@gmail.com)"
        },
        password: {
            required: "Vui lòng nhập mật khẩu",
            minlength: "Mật khẩu phải có ít nhất 6 ký tự",
            regex: "Mật khẩu phải chứa ít nhất 1 chữ hoa và 1 số"
        }
    }
});

/*************************************************
 * VALIDATE REGISTER
 *************************************************/
$(".form-register").validate({
    rules: {
        nfirst: {
            required: true,
            maxlength: 50,
            regex: /^[a-zA-ZÀ-ỹ\s]+$/ // chỉ chữ cái + khoảng trắng
        },
        nlast: {
            required: true,
            maxlength: 50,
            regex: /^[a-zA-ZÀ-ỹ\s]+$/
        },
        username: {
            required: true,
            minlength: 4,
            maxlength: 30,
            regex: /^[a-z0-9_]+$/ // chữ thường, số, gạch dưới
        },
        email: {
            required: true,
            gmail: true
        },
        password: {
            required: true,
            minlength: 8,
            regex: /^(?=.*[A-Z])(?=.*\d).{8,}$/
            // Ít nhất 1 chữ hoa + 1 số + tối thiểu 8 ký tự
        },
        "re-password": {
            required: true,
            equalTo: "#su-pass"
        }
    },
    messages: {
        nfirst: {
            required: "Vui lòng nhập tên",
            maxlength: "Tên quá dài",
            regex: "Tên không được chứa số hoặc ký tự đặc biệt"
        },
        nlast: {
            required: "Vui lòng nhập họ",
            maxlength: "Họ quá dài",
            regex: "Họ không được chứa số hoặc ký tự đặc biệt"
        },
        username: {
            required: "Vui lòng nhập tên đăng nhập",
            minlength: "Tên đăng nhập ít nhất 4 ký tự",
            maxlength: "Tên đăng nhập tối đa 30 ký tự",
            regex: "Chỉ dùng chữ thường, số hoặc dấu gạch dưới"
        },
        email: {
            required: "Vui lòng nhập email",
            gmail: "Chỉ chấp nhận email Gmail (vd: ten@gmail.com)"
        },
        password: {
            required: "Vui lòng nhập mật khẩu",
            minlength: "Mật khẩu phải có ít nhất 8 ký tự",
            regex: "Mật khẩu phải chứa ít nhất 1 chữ hoa và 1 số"
        },
        "re-password": {
            required: "Vui lòng nhập lại mật khẩu",
            equalTo: "Mật khẩu nhập lại không khớp"
        }
    }
});
