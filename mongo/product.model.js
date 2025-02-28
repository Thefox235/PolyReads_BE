const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const objectId = Schema.ObjectId;
 
const productSchema = new Schema({
    name: { type: String, required: true },
    title: { type: String, required: false },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true },
    weight: { type: Number, required: true },
    size: { type: String, required: true },
    pages: { type: Number, required: true },
    language: { type: String, required: true },
    format: { type: String, required: true },
    published_date: { type: String, required: true },
    publisher: { type: String, required: true },
    sale_count: { type: Number, required: true },
    category: { 
        type: Schema.Types.ObjectId, 
        ref: "category", 
        required: true 
    },
    author: { 
        type: Schema.Types.ObjectId, 
        ref: "author", 
        required: true 
    },
    discount: { 
        type: Schema.Types.ObjectId, 
        ref: "discount", 
        required: false 
    },
});

module.exports = mongoose.models.product || mongoose.model('product', productSchema);
