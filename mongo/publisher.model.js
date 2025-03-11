//kết nối collection product
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const objectId = Schema.ObjectId;
 
const publisherSchema = new Schema({
    name : {type: String,  require:true},
    is_active : {type: Boolean, default: true},
})
module.exports = mongoose.models.publisherSchema || mongoose.model('publisher',publisherSchema)
