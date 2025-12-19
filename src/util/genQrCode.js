const QRcode = require('qrcode')
const path = require('path')
const fs = require('fs')

const genQrCode = async (text) => {

    const fileName = `qr-${Date.now()}.png`;

    const filePath = path.join(
        __dirname,        // src/util
        '../../public',   // nhảy ra root rồi vào public
        'qrcode',
        fileName
    );

    await QRcode.toFile(filePath, text);


    return fileName;
}


module.exports = genQrCode;