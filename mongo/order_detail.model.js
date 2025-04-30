const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const order_detailSchema = new Schema({
  orderId: { type: Schema.Types.ObjectId, ref: 'order' },
  productId: { type: Schema.Types.ObjectId, ref: 'product' },
  quantity: { type: Number, required: true },  // đổi từ quantily sang quantity
  price: { type: Number, required: true },
});

  
module.exports = mongoose.models.order_detailSchema || mongoose.model('order_detail', order_detailSchema);
