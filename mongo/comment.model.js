const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'users', required: true },
  productId: { type: Schema.Types.ObjectId, ref: 'product', required: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true }, 
  rating: { type: Number, required: true },
  content: { type: String, required: true },
  date: { type: Date, default: Date.now },
  status: { type: String, default: 'pending' },
  likes: { type: Number, default: 0 },
  likedBy: [{ type: Schema.Types.ObjectId, ref: 'users' }], // Lưu danh sách các user đã like
});

module.exports =
  mongoose.models.comment || mongoose.model('comment', commentSchema);
