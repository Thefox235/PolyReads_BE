const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const order_detailSchema = new Schema({
  orderId: { type: Schema.Types.ObjectId, ref: 'order' },
  productId: { type: Schema.Types.ObjectId, ref: 'product' },
  quantily: { type: Number, required: true },  // Lưu ý: "quantily" (nhầm số lượng) thay vì quantity
  price: { type: Number, required: true },
});

  
module.exports = mongoose.models.order_detailSchema || mongoose.model('order_detail', order_detailSchema);
