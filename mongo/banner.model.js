const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const objectId = Schema.ObjectId;
 
const bannerSchema = new Schema({
    image_url : {type: String,require:true},
    title : {type: String,require:true},
    position : {type: String,require:true},
    is_active : {type: Boolean,require:true},
})
module.exports = mongoose.models.bannerSchema || mongoose.model('banner',bannerSchema)
