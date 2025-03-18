const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const objectId = Schema.ObjectId;
 
const commentSchema = new Schema({
    userId : {type: Schema.Types.ObjectId, ref: 'users'},
    productId : {type: Schema.Types.ObjectId, ref: 'product'},
    content: { type: String, required: true },
    date: { type: Date, required: true },
    status: {type: String, default: 'pending' },
  });
  
module.exports = mongoose.models.commentSchema || mongoose.model('comment', commentSchema);
