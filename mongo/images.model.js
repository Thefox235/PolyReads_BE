const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const objectId = Schema.ObjectId;
 
const imagesSchema = new Schema({
    url: { type: String, required: true },
    productId : {type: Schema.Types.ObjectId, ref: 'product'},
  });
  

module.exports = mongoose.models.imagesSchema || mongoose.model('images', imagesSchema);
