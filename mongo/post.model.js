const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true,
    unique: true // để dễ dàng tạo URL thân thiện
  },
  // Field content lưu trữ HTML hoặc Markdown được tạo bởi trình soạn thảo WYSIWYG
  content: { 
    type: String,  
    required: true
  },
  // Các trường khác nếu cần
  tag: { 
    type: Schema.Types.ObjectId, 
    ref: "category", 
    required: true 
  },
  coverImage: {
    type: String // URL của hình ảnh bìa (nếu có)
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.models.Post || mongoose.model("post", postSchema);
