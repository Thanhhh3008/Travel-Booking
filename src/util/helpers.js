const numeral = require('numeral');
const slugify = require('slugify');

require('numeral/locales/vi');
numeral.locale('vi');

exports.formatMoney = (money) => {
    const formatMoney = numeral(money).format('0,0');
    // const value = formatMoney.replaceAll(',', '.');
    return formatMoney
}

exports.capitalizeWords = (str) => {
    return str
        .split(" ")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}


exports.getCurrentRoute = (requestPath) => {

    // /san-pham.html => san-pham.html 
    path = requestPath.startsWith('/') ? requestPath.slice(1) : requestPath
    // console.log(path);
    if (path === '') {
        return 'home';
    }

    // console.log(path);

    if (path === 'san-pham.html' || path.match(/^san-pham/) || path.match(/^thuong-hieu/)) {
        return 'product';
    }

    if (path === 'lien-he.html') {
        return 'contact'
    }



    if (path === 'thong-tin-ca-nhan.html') {
        return 'accountInfo';
    }

    if (path === 'lich-su-don-hang.html') {
        return 'orderHistory';
    }

    if (path === 'dia-chi-giao-hang-mac-dinh.html') {
        return 'shippingDefault';
    }

    if (path.match(/^san-pham/)) {
        return 'productDetail';
    }
}


exports.getSlugName = (name) => {
    const newName = slugify(name, {
        replacement: "-",
        lower: true
    });
    return newName;
}

exports.getUserSession = (user) => {
    return user ?? null;
}


exports.getIdRole = (id_role) => {
    return id_role ?? null;
}