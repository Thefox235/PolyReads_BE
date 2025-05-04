const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
  name: { type: String },
  quantity: { type: Number },
  date: { type: Date, default: Date.now() },
  img: { type: String },
  price: { type: Number },
  status: { type: Number },
  payment_status: {
    type: String,
    enum: ['pending', 'success', 'failed'],
    default: 'pending'
  },
  total: { type: Number },
  userId: { type: Schema.Types.ObjectId, ref: 'users' },
  paymentId: { type: Schema.Types.ObjectId, ref: 'payment' },
  addressId: { type: Schema.Types.ObjectId, ref: 'address' },
  // Thêm thông tin coupon khi người dùng áp dụng
  coupon: {
    couponId: { type: Schema.Types.ObjectId, ref: 'coupon', required: false },
    code: { type: String },
    discountPercentage: { type: Number },
    discountValue: { type: Number }
  }
});

module.exports = mongoose.models.order || mongoose.model('order', orderSchema);