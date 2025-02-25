const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const objectId = Schema.ObjectId;
 
const discountSchema = new Schema({
    value: { type: Number, required: true },
    code: { type: String, required: true },
    start_date:  {type: Date, required: true},
    end_date:  {type: Date, required: true},
    is_active: {type: Boolean, required: true},
  });
  

module.exports = mongoose.models.discountSchema || mongoose.model('discount', discountSchema);
