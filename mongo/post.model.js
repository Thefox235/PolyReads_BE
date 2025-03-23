// models/Post.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true, // Để tạo URL thân thiện
  },
  // Nội dung được soạn từ Toast Editor: HTML hoặc Markdown
  content: {
    type: String,
    required: true,
  },
  tag: {
    type: Schema.Types.ObjectId,
    ref: "category",
    required: true,
  },
  coverImage: {
    type: String, // URL của hình ảnh bìa (nếu có)
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.models.Post || mongoose.model("post", postSchema);