//kết nối collection product
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const objectId = Schema.ObjectId;
 
const paymentSchema = new Schema({
    payment_method : {type: String,require:true},
    payment_status : {type:String,require:true},
})
module.exports = mongoose.models.paymentSchema || mongoose.model('payment',paymentSchema)
