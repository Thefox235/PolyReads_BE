// models/payment.model.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const paymentSchema = new Schema({
  amount: { type: Number, required: true },
  currency: { type: String, default: 'usd' },
  status: {
    type: String,
    enum: ['pending', 'success', 'failed'],
    default: 'pending'
  },
  method: { type: String }, // ví dụ: stripe, paypal, vnpay, momo...
  createdAt: { type: Date, default: Date.now },
  // Các trường bổ sung, nếu cần, như transactionId từ Stripe hay thông tin chi tiết thêm
});

module.exports = mongoose.models.payment || mongoose.model('payment', paymentSchema);
