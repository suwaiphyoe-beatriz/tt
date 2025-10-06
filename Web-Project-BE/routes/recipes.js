const express = require('express');
const { authenticateToken } = require('../middleware/auth');

const {
  getAllRecipes,
  getRecipeById,
  getFilterOptions,
  filterRecipes,
  searchRecipes,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  toggleFavorite,
  getFavoriteRecipes
} = require('../controllers/recipeController');

const router = express.Router();

// 获取所有食谱
router.get('/', getAllRecipes);

// 获取筛选选项
router.get('/filter-options', getFilterOptions);

// 获取用户收藏的食谱（需要认证）
router.get('/favorites', authenticateToken, getFavoriteRecipes);

// 筛选食谱
router.get('/filter', filterRecipes);

// 搜索食谱
router.get('/search', searchRecipes);

// 根据ID获取单个食谱
router.get('/:id', getRecipeById);

//update receipe
router.put('/:id', updateRecipe);

// 切换收藏
router.patch('/:id/favorite', authenticateToken, toggleFavorite);

// 创建新食谱（需要认证）
router.post('/', authenticateToken, createRecipe);

// 更新食谱（需要认证）
// router.put('/:id', authenticateToken, updateRecipe);

// 删除食谱（需要认证）
router.delete('/:id', authenticateToken, deleteRecipe);

module.exports = router;
