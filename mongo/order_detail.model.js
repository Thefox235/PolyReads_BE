const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const objectId = Schema.ObjectId;
 
const order_detailSchema = new Schema({
    _id: Schema.Types.ObjectId,
    orderId : {type: Schema.Types.ObjectId, ref: 'order'},
    productId : {type: Schema.Types.ObjectId, ref: 'product'},
    quantily: { type: Number, required: true },
    price: { type: Number, required: true },
  });
  
module.exports = mongoose.models.order_detailSchema || mongoose.model('order_detail', order_detailSchema);
