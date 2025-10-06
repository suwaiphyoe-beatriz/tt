const Recipe = require('../models/Recipe');
const fs = require('fs');
const path = require('path');
const User = require('../models/User'); // 添加这行导入
const mongoose = require('mongoose'); // 添加这行

// 获取所有食谱
const getAllRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.find({}).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: recipes.length,
      data: recipes
    });
  } catch (error) {
    console.error('Get all recipes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recipes',
      error: error.message
    });
  }
};

// 根据ID获取单个食谱
const getRecipeById = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }

    res.json({
      success: true,
      data: recipe
    });
  } catch (error) {
    console.error('Get recipe by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recipe',
      error: error.message
    });
  }
};

// 获取筛选选项
const getFilterOptions = async (req, res) => {
  try {
    const [countries, mainIngredients, allergens] = await Promise.all([
      Recipe.getCountries(),
      Recipe.getMainIngredients(),
      Recipe.getAllergens()
    ]);

    res.json({
      success: true,
      data: {
        countries: countries.sort(),
        mainIngredients: mainIngredients.sort(),
        allergens: allergens.sort()
      }
    });
  } catch (error) {
    console.error('Get filter options error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch filter options',
      error: error.message
    });
  }
};

// 筛选食谱
const filterRecipes = async (req, res) => {
  try {
    const { country, mainIngredient, allergens } = req.query;

    // 统一处理成数组
    const filters = {
      country: country ? (Array.isArray(country) ? country : [country]) : [],
      mainIngredient: mainIngredient ? (Array.isArray(mainIngredient) ? mainIngredient : [mainIngredient]) : [],
      allergens: allergens ? (Array.isArray(allergens) ? allergens : [allergens]) : []
    };

    const recipes = await Recipe.filterRecipes(filters)
      .sort({ rating: -1, createdAt: -1 });

    res.json({
      success: true,
      count: recipes.length,
      filters,
      data: recipes
    });
  } catch (error) {
    console.error('Filter recipes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to filter recipes',
      error: error.message
    });
  }
};

// 搜索食谱
const searchRecipes = async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const searchQuery = {
      $text: { $search: q.trim() }
    };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [recipes, total] = await Promise.all([
      Recipe.find(searchQuery, { score: { $meta: 'textScore' } })
        .sort({ score: { $meta: 'textScore' } })
        .skip(skip)
        .limit(parseInt(limit)),
      Recipe.countDocuments(searchQuery)
    ]);

    res.json({
      success: true,
      count: recipes.length,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      query: q,
      data: recipes
    });
  } catch (error) {
    console.error('Search recipes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search recipes',
      error: error.message
    });
  }
};

// 创建新食谱
const createRecipe = async (req, res) => {
  try {
    const recipeData = req.body;

    // 处理图片上传
    if (recipeData.image && recipeData.imageFileName) {
      try {
        // 确保 recipes 目录存在
        const recipesDir = path.join(__dirname, '../public/images/recipes');
        if (!fs.existsSync(recipesDir)) {
          fs.mkdirSync(recipesDir, { recursive: true });
        }

        // 提取 base64 数据
        const base64Data = recipeData.image.replace(/^data:image\/[a-z]+;base64,/, '');

        // 生成唯一文件名
        const timestamp = Date.now();
        const fileExtension = path.extname(recipeData.imageFileName) || '.jpg';
        const fileName = `recipe_${timestamp}${fileExtension}`;
        const filePath = path.join(recipesDir, fileName);

        // 保存图片文件
        fs.writeFileSync(filePath, base64Data, 'base64');

        // 更新图片路径为API路径
        recipeData.image = `/api/images/recipes/${fileName}`;

        console.log(`Image saved: ${fileName}`);
      } catch (imageError) {
        console.error('Image upload error:', imageError);
        // 如果图片上传失败，使用默认图片
        recipeData.image = '/api/images/recipes/default-recipe.jpg';
      }
    }

    // 移除临时字段
    delete recipeData.imageFileName;

    const recipe = new Recipe(recipeData);
    await recipe.save();

    res.status(201).json({
      success: true,
      message: 'Recipe created successfully',
      data: recipe
    });
  } catch (error) {
    console.error('Create recipe error:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to create recipe',
      error: error.message
    });
  }
};

// 更新食谱
const updateRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }

    res.json({
      success: true,
      message: 'Recipe updated successfully',
      data: recipe
    });
  } catch (error) {
    console.error('Update recipe error:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to update recipe',
      error: error.message
    });
  }
};

// 删除食谱
const deleteRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }

    // 删除关联的图片文件
    if (recipe.image && recipe.image.startsWith('/api/images/recipes/')) {
      try {
        // 提取文件名
        const fileName = path.basename(recipe.image);
        const filePath = path.join(__dirname, '../public/images/recipes', fileName);

        // 检查文件是否存在并删除
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`Image file deleted: ${fileName}`);
        }
      } catch (fileError) {
        console.error('Error deleting image file:', fileError);
        // 即使图片删除失败，也继续删除数据库记录
      }
    }

    // 删除数据库记录
    await Recipe.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Recipe deleted successfully'
    });
  } catch (error) {
    console.error('Delete recipe error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete recipe',
      error: error.message
    });
  }
};

// 切换收藏状态
const toggleFavorite = async (req, res) => {
  try {
    const userId = req.user._id;
    const recipeId = req.params.id;

    // 验证 ObjectId 格式
    if (!mongoose.Types.ObjectId.isValid(recipeId)) {
      return res.status(400).json({ success: false, message: 'Invalid recipe ID' });
    }

    // 检查食谱是否存在
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found' });
    }

    // 获取用户并更新收藏
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // 检查是否已收藏 - 使用更精确的ObjectId比较
    const isFavorited = user.favoriteRecipes.some(favoriteId =>
      favoriteId.toString() === recipeId.toString()
    );
    let action;

    if (isFavorited) {
      // 移除收藏
      user.favoriteRecipes = user.favoriteRecipes.filter(
        id => !id.equals(recipeId)
      );
      action = 'removed';
    } else {
      // 添加收藏
      user.favoriteRecipes.push(recipeId);
      action = 'added';
    }

    await user.save();

    res.json({
      success: true,
      message: `Recipe ${action} to favorites`,
      isFavorited: !isFavorited,
      favoriteRecipes: user.favoriteRecipes
    });
  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle favorite',
      error: error.message
    });
  }
};

// 获取用户收藏的食谱
const getFavoriteRecipes = async (req, res) => {
  try {
    const userId = req.user._id;

    // 获取用户并填充收藏的食谱
    const user = await User.findById(userId).populate('favoriteRecipes');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      count: user.favoriteRecipes.length,
      data: user.favoriteRecipes
    });
  } catch (error) {
    console.error('Get favorite recipes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch favorite recipes',
      error: error.message
    });
  }
};


module.exports = {
  getAllRecipes,
  getRecipeById,
  getFilterOptions,
  filterRecipes,
  searchRecipes,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  toggleFavorite,
  getFavoriteRecipes,
};
