//kết nối collection product
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const objectId = Schema.ObjectId;
 
const categorySchema = new Schema({
    name : {type: String, required: true},
    description:{type:String, required: true},
})
module.exports = mongoose.models.categorySchema || mongoose.model('category',categorySchema)
