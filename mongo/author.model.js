//kết nối collection product
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const objectId = Schema.ObjectId;
 
const authorSchema = new Schema({
    name : {type: String,require:true},
    bio:{type:String,require:true},
})
module.exports = mongoose.models.authorSchema || mongoose.model('author',authorSchema)
