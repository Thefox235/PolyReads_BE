const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
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
  // Trường mới để phân biệt loại voucher
  couponType: {
    type: String,
    enum: ['order', 'shipping'],  // 'order' cho giảm theo tổng đơn hàng, 'shipping' cho giảm phí vận chuyển
    required: true,
    default: 'order'
  },
  description: { 
    type: String 
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
  // Trường này có thể áp dụng riêng cho voucher loại 'order'
  minimumOrderValue: { 
    type: Number, 
    default: 0 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  }
}, { timestamps: true });

module.exports = mongoose.model('Coupon', couponSchema);