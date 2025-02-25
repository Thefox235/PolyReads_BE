const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const objectId = Schema.ObjectId;
 
const userSchema = new Schema({
    _id: Schema.Types.ObjectId,
    email: { type: String, required: true },
    pass: { type: String, required: true },
    name: { type: String, required: true },
    date : {type: Date, default: Date.now()},
    phone: { type: String, required: true },
    otp_code: { type: Number, required: true },
    is_verified: { type: Boolean, required: true },
    url_image: { type: String, required: true },
    role: { type: String, required: true },
  });
  

module.exports = mongoose.models.users || mongoose.model('users', userSchema);
