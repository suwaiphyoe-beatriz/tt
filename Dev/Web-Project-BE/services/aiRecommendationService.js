const model = require("../config/gemini");
const Recipe = require('../models/Recipe');

async function generateRecipeRecommendations(favoriteRecipes, allRecipes) {
  let prompt;

  if (favoriteRecipes && favoriteRecipes.length > 0) {
    // 用户有收藏的食谱，基于收藏推荐
    const favoriteInfo = favoriteRecipes.map(recipe => ({
      title: recipe.title,
      country: recipe.country,
      mainIngredient: recipe.mainIngredient,
      allergens: recipe.allergens || []
    }));

    prompt = `
You are a professional chef AI assistant. Based on the user's favorite recipes, recommend 3 similar recipes from the available recipe database.

### User's Favorite Recipes:
${JSON.stringify(favoriteInfo, null, 2)}

### Available Recipes Database:
${JSON.stringify(allRecipes.map(recipe => ({
      id: recipe._id,
      title: recipe.title,
      country: recipe.country,
      mainIngredient: recipe.mainIngredient,
      allergens: recipe.allergens || [],
      description: recipe.description
    })), null, 2)}

### Task:
Analyze the user's preferences based on their favorite recipes (cuisine types, ingredients, flavors) and recommend 3 recipes from the available database that match their taste profile.

### Response Format:
Return ONLY a JSON array with exactly 3 recipe IDs in this format:
["recipe_id_1", "recipe_id_2", "recipe_id_3"]

### Requirements:
- Select recipes that share similar characteristics with the user's favorites
- Consider cuisine type, main ingredients, and flavor profiles
- Avoid recommending recipes the user has already favorited
- Return only the recipe IDs as a JSON array, no additional text or explanation
`;
  } else {
    // 用户没有收藏，推荐热门/多样化的食谱
    prompt = `
You are a professional chef AI assistant. Recommend 3 diverse and popular recipes from the available recipe database for a new user.

### Available Recipes Database:
${JSON.stringify(allRecipes.map(recipe => ({
      id: recipe._id,
      title: recipe.title,
      country: recipe.country,
      mainIngredient: recipe.mainIngredient,
      allergens: recipe.allergens || [],
      description: recipe.description,
      rating: recipe.rating
    })), null, 2)}

### Task:
Select 3 diverse recipes that represent different cuisines and cooking styles. Choose recipes that are:
- From different countries/cuisines
- Use different main ingredients
- Have good ratings
- Offer variety in cooking techniques and flavors

### Response Format:
Return ONLY a JSON array with exactly 3 recipe IDs in this format:
["recipe_id_1", "recipe_id_2", "recipe_id_3"]

### Requirements:
- Select recipes from different countries if possible
- Choose recipes with different main ingredients
- Return only the recipe IDs as a JSON array, no additional text or explanation
`;
  }

  try {
    const result = await model(prompt);

    if (process.env.DEBUG_GEMINI === "true") {
      console.log("🔍 Raw Gemini response:", result);
    }

    // 尝试从响应中提取JSON
    let jsonMatch = result.text.match(/\[(.*?)\]/s);
    if (!jsonMatch) {
      // 如果没有找到数组格式，尝试整个响应
      jsonMatch = result.text.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        const jsonString = jsonMatch[1];
        return JSON.parse(jsonString);
      } else {
        // 直接尝试解析整个响应
        return JSON.parse(result.text.trim());
      }
    }

    const jsonString = `[${jsonMatch[1]}]`;
    return JSON.parse(jsonString);
  } catch (err) {
    console.error("Error in generateRecipeRecommendations:", err);
    throw new Error("Failed to generate recipe recommendations");
  }
}

module.exports = { generateRecipeRecommendations };