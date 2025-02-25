const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const objectId = Schema.ObjectId;
 
const commentSchema = new Schema({
    _id: Schema.Types.ObjectId,
    userId : {type: Schema.Types.ObjectId, ref: 'users'},
    productId : {type: Schema.Types.ObjectId, ref: 'product'},
    content: { type: Number, required: true },
    date: { type: Date, required: true },
  });
  
module.exports = mongoose.models.commentSchema || mongoose.model('comment', commentSchema);
