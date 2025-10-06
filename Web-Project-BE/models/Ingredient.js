// models/Ingredient.js
const mongoose = require('mongoose');

// 定义URL子文档模式
const urlSchema = new mongoose.Schema({
  "K-market": String,
  "S-market": String,
  "Lidl": String
}, { _id: false });

// 定义营养信息子文档模式
const nutritionSchema = new mongoose.Schema({
  Calories: String,
  Protein: String,
  Fat: String,
  Carbohydrates: String
}, { _id: false });

// 定义食材模式
const ingredientSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default: ""
  },
  sell: {
    type: Boolean,
    required: true
  },
  url: urlSchema,
  description: {
    type: String,
    required: true
  },
  nutrition: nutritionSchema,
  additionalInfo: {
    type: String,
    default: ""
  }
}, {
  timestamps: true
});

// 创建索引
ingredientSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Ingredient', ingredientSchema);