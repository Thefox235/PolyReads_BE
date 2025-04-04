const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const addressSchema = new Schema({
    address_line: { type: String, required: true },
    city: { type: String, required: true }, // Thường lưu tên Tỉnh/Thành phố
    phone: { type: String, required: true },
    name: { type: String, required: true },
    district: { type: String, required: true }, // Tên quận/huyện
    province: { type: String, required: true }, // Tên tỉnh/thành phố
    ward: { type: String, required: true },     // Tên xã/phường
    default: { type: Boolean, required: true },
    extraCodes: {
        // Sử dụng kiểu Mixed để linh hoạt lưu trữ bất kỳ cấu trúc JSON nào
        type: mongoose.Schema.Types.Mixed,
        default: {}
      },
    
    userId: { type: Schema.Types.ObjectId, ref: 'users', required: true },
});

module.exports = mongoose.models.address || mongoose.model('address', addressSchema);
