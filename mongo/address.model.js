const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const objectId = Schema.ObjectId;
 
const addressSchema = new Schema({
    address_line: { type: String, required: true },
    city: { type: String, required: true },
    phone: { type: String, required: true },
    name: { type: Number, required: true },
    town: { type: Number, required: true },
    town_code: { type: Number, required: true },
    district: { type: String, required: true },
    district_code: { type: Number, required: true },
    province: { type: String, required: true },
    province_code: { type: String, required: true },
    default: { type: Boolean, required: true },
    userId : {type: Schema.Types.ObjectId, ref: 'users'}, // ref: 'users' is the name of the model
});

module.exports = mongoose.models.addressSchema || mongoose.model('address', addressSchema);
