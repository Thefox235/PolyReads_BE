const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');

// Đăng ký helper "vnd" để định dạng số tiền sang định dạng tiền Việt Nam
handlebars.registerHelper('vnd', function(value) {
  // Giả sử value là số (number)
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(value);
});

function compileTemplate(templateFilename, data) {
    // Xác định đường dẫn file template
    const templatePath = path.join(__dirname, templateFilename);
    // Đọc file template (sử dụng utf8)
    const templateSource = fs.readFileSync(templatePath, "utf8");
    // Biên dịch template bằng Handlebars
    const template = handlebars.compile(templateSource);
    // Trả về nội dung HTML đã được render
    return template(data);
}

module.exports = { compileTemplate };