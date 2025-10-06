const express = require('express');
const { getAIRecommendations } = require('../controllers/aiController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// 获取AI推荐食谱 (可选认证，有认证会基于收藏推荐，无认证会推荐热门菜品)
router.get('/recommendations', (req, res, next) => {
  // 尝试认证，但不强制要求
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    authenticateToken(req, res, next);
  } else {
    next();
  }
}, getAIRecommendations);

module.exports = router;