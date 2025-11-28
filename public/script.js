// thêm rule regex
$.validator.addMethod(
    "regex",
    function (value, element, regexp) {
        let re = new RegExp(regexp);
        return this.optional(element) || re.test(value);
    },
    "Định dạng không hợp lệ"
);

// validate login
$(".form-login").validate({
    rules: {
        email: {
            required: true,
            email: true
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
            email: "Vui lòng nhập đúng định dạng email (vd: tenban@gmail.com)"
        },
        password: {
            required: "Vui lòng nhập mật khẩu",
            minlength: "Mật khẩu phải có ít nhất 6 ký tự",
            regex: "Mật khẩu phải chứa ít nhất 1 chữ hoa và 1 số"
        }
    }
});

// validate register
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
            regex: /^[a-z0-9_]+$/ // chỉ chữ thường, số, dấu gạch dưới, không khoảng trắng
        },
        email: {
            required: true,
            email: true
        },
        password: {
            required: true,
            minlength: 8,
            regex: /^(?=.*[A-Z])(?=.*\d).{6,}$/
            // ít nhất 1 chữ thường, 1 hoa, 1 số, 1 ký tự đặc biệt
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
            regex: "Chỉ dùng chữ thường, số hoặc dấu gạch dưới (không khoảng trắng)"
        },
        email: {
            required: "Vui lòng nhập email",
            email: "Email không hợp lệ (vd: tenban@gmail.com)"
        },
        password: {
            required: "Vui lòng nhập mật khẩu",
            minlength: "Mật khẩu phải có ít nhất 6 ký tự",
            regex: "Mật khẩu phải chứa ít nhất 1 chữ hoa và 1 số"
        },
        "re-password": {
            required: "Vui lòng nhập lại mật khẩu",
            equalTo: "Mật khẩu nhập lại không khớp"
        }
    }
});