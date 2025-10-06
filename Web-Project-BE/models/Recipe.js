const mongoose = require('mongoose');

// 定义食材子文档模式
const ingredientSchema = new mongoose.Schema({
  id: {     // This id should be linked to Ingredient.js's ingredientSchema's id
    type: String,
    required: true
  },
  name: {    // This name is for recipe
    type: String,
    required: true
  },
  quantity: { // This quantity is for recipe
    type: String,
    required: true
  }
}, { _id: false });

// 定义营养信息子文档模式
const nutritionSchema = new mongoose.Schema({
  Calories: String,
  Protein: String,
  Carbohydrates: String,
  Fat: String
}, { _id: false });

// 定义食谱主模式
const recipeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true,
    trim: true
  },
  mainIngredient: {
    type: String,
    required: true,
    trim: true
  },
  allergens: [{
    type: String,
    trim: true
  }],
  cookTime: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 0,
    max: 5
  },
  // isFavorited: {
  //   type: Boolean,
  //   default: false
  // },
  ingredients: [ingredientSchema],
  instructions: {
    type: String,
    required: true
  },
  nutrition: nutritionSchema
}, {
  timestamps: true // 自动添加 createdAt 和 updatedAt
});

// 创建索引以提高查询性能
recipeSchema.index({ country: 1 });
recipeSchema.index({ mainIngredient: 1 });
recipeSchema.index({ allergens: 1 });
recipeSchema.index({ rating: -1 });
recipeSchema.index({ title: 'text', description: 'text' }); // 文本搜索索引

// 虚拟字段：获取所有唯一的国家
recipeSchema.statics.getCountries = function () {
  return this.distinct('country');
};

// 虚拟字段：获取所有唯一的主要成分
recipeSchema.statics.getMainIngredients = function () {
  return this.distinct('mainIngredient');
};

// 虚拟字段：获取所有唯一的过敏原
recipeSchema.statics.getAllergens = function () {
  return this.aggregate([
    { $unwind: '$allergens' },
    { $group: { _id: '$allergens' } },
    { $sort: { _id: 1 } }
  ]).then(results => results.map(r => r._id));
};

// 过滤食谱的静态方法
recipeSchema.statics.filterRecipes = function (filters) {
  const query = {};

  // 国家过滤
  if (filters.country && filters.country.length > 0) {
    query.country = { $in: filters.country };
  }

  // 主要成分过滤
  if (filters.mainIngredient && filters.mainIngredient.length > 0) {
    query.mainIngredient = { $in: filters.mainIngredient };
  }

  // 过敏原过滤（排除包含指定过敏原的食谱）
  if (filters.allergens && filters.allergens.length > 0) {
    query.allergens = { $nin: filters.allergens };
  }

  return this.find(query);
};

module.exports = mongoose.model('Recipe', recipeSchema);
