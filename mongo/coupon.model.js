const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const couponSchema = new Schema({
  code: { 
    type: String, 
    unique: true, 
    required: true 
  },
  discountPercentage: { 
    type: Number, 
    required: true, 
    min: 0, 
    max: 100 
  },
  description: {
    type: String,
    required: true
  },
  couponType: {
    type: String,
    enum: ['order', 'shipping'],
    required: true,
    default: 'order'
  },
  validFrom: { 
    type: Date, 
    required: true 
  },
  validUntil: { 
    type: Date, 
    required: true 
  },
  usageLimit: { 
    type: Number, 
    default: 1 
  },
  timesUsed: { 
    type: Number, 
    default: 0 
  },
  minimumOrderValue: { 
    type: Number, 
    default: 0 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  // Thêm vào trường xác định phạm vi áp dụng của coupon
  scope: {
    type: String,
    enum: ['global', 'limited', 'new'],
    required: true,
    default: 'global'
  },
  // Nếu coupon là limited, lưu danh sách các userId được phép sử dụng
  eligibleUserIds: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }]
}, { timestamps: true });

module.exports = mongoose.models.Coupon || mongoose.model('Coupon', couponSchema);