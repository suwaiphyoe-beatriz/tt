const { generateRecipeRecommendations } = require('../services/aiRecommendationService');
const Recipe = require('../models/Recipe');
const User = require('../models/User');

// 获取AI推荐食谱
const getAIRecommendations = async (req, res) => {
  try {
    // 获取所有食谱
    const allRecipes = await Recipe.find({}).select('_id title country mainIngredient allergens description rating');

    let favoriteRecipes = [];

    // 如果用户已登录，获取收藏的食谱
    if (req.user) {
      const user = await User.findById(req.user._id).populate('favoriteRecipes');
      favoriteRecipes = user.favoriteRecipes || [];
    }

    // 调用AI服务生成推荐
    const recommendedIds = await generateRecipeRecommendations(favoriteRecipes, allRecipes);

    // 根据AI返回的ID获取完整的食谱信息
    const recommendedRecipes = await Recipe.find({
      '_id': { $in: recommendedIds }
    });

    // 按照AI推荐的顺序排序
    const sortedRecommendations = recommendedIds.map(id =>
      recommendedRecipes.find(recipe => recipe._id.toString() === id)
    ).filter(Boolean); // 过滤掉可能的null值

    res.json({
      success: true,
      message: favoriteRecipes.length > 0 ?
        'AI recommendations based on your favorites' :
        'AI recommendations for new user',
      count: sortedRecommendations.length,
      data: sortedRecommendations
    });

  } catch (error) {
    console.error('Get AI recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get AI recommendations',
      error: error.message
    });
  }
};

module.exports = {
  getAIRecommendations
};