import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext';

const AddRecipe = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    image: '',
    description: '',
    country: '',
    mainIngredient: '',
    allergens: [],
    cookTime: '',
    rating: 5,
    ingredients: [{ name: '', quantity: '' }],
    instructions: '',
    nutrition: {
      Calories: '',
      Protein: '',
      Carbohydrates: '',
      Fat: ''
    }
  });

  // 常见过敏原列表
  const commonAllergens = ['Gluten', 'Dairy', 'Eggs', 'Fish', 'Shellfish', 'Tree Nuts', 'Peanuts', 'Soy', 'Sesame'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('nutrition.')) {
      const nutritionField = name.split('.')[1];
      setFormData({
        ...formData,
        nutrition: {
          ...formData.nutrition,
          [nutritionField]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleAllergenChange = (allergen) => {
    const updatedAllergens = formData.allergens.includes(allergen)
      ? formData.allergens.filter(a => a !== allergen)
      : [...formData.allergens, allergen];

    setFormData({
      ...formData,
      allergens: updatedAllergens
    });
  };

  const handleIngredientChange = (index, field, value) => {
    const updatedIngredients = [...formData.ingredients];
    updatedIngredients[index][field] = value;
    setFormData({
      ...formData,
      ingredients: updatedIngredients
    });
  };

  const addIngredient = () => {
    setFormData({
      ...formData,
      ingredients: [...formData.ingredients, { name: '', quantity: '' }]
    });
  };

  const removeIngredient = (index) => {
    const updatedIngredients = formData.ingredients.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      ingredients: updatedIngredients
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 检查文件类型
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // 检查文件大小 (10MB 限制，因为 base64 会增加约33%大小)
      if (file.size > 10 * 1024 * 1024) {
        alert('Image size should be less than 10MB');
        return;
      }

      // 将图片转换为 base64
      const reader = new FileReader();
      reader.onload = () => {
        setFormData({
          ...formData,
          image: reader.result, // base64 字符串
          imageFile: file // 保存文件对象用于文件名
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('authToken');

      // 为每个食材生成 ID
      const ingredientsWithId = formData.ingredients
        .filter(ing => ing.name && ing.quantity)
        .map((ing, index) => ({
          ...ing,
          id: `custom-${Date.now()}-${index}` // 生成唯一 ID
        }));

      // 准备提交数据，包含图片的 base64 和文件名
      const submitData = {
        ...formData,
        ingredients: ingredientsWithId,
        imageFileName: formData.imageFile ? formData.imageFile.name : null
      };

      // 移除 imageFile 对象（不能序列化）
      delete submitData.imageFile;

      const response = await fetch('/api/recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submitData)
      });

      const data = await response.json();

      if (response.ok) {
        alert('Recipe created successfully!');
        navigate('/recipes');
      } else {
        alert(data.message || 'Failed to create recipe');
      }
    } catch (error) {
      console.error('Create recipe error:', error);
      alert('An error occurred while creating the recipe');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
        <p className="text-center text-gray-600">Please log in to add a new recipe.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Add New Recipe</h2>
        <p className="text-gray-600">Share your delicious recipe with the community!</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 图片上传 - 第一个 */}
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Recipe Image</h3>
          <div>
            <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
              Upload Recipe Image *
            </label>
            <input
              type="file"
              id="image"
              accept="image/*"
              onChange={handleImageUpload}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            {formData.image && (
              <div className="mt-2">
                <img
                  src={formData.image}
                  alt="Recipe preview"
                  className="w-32 h-32 object-cover rounded-md border border-gray-300"
                />
                <p className="text-sm text-gray-500 mt-1">
                  {formData.imageFile ? formData.imageFile.name : 'Image uploaded'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 描述 - 第二个 */}
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Description</h3>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Recipe Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Describe your recipe in detail..."
            />
          </div>
        </div>

        {/* 标题 - 第三个 */}
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Recipe Title</h3>
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Recipe Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Enter a catchy recipe title"
            />
          </div>
        </div>

        {/* 基本信息 */}
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Basic Information</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {/* 国家 */}
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                Country *
              </label>
              <input
                type="text"
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="e.g., Italy, China, Japan"
              />
            </div>

            {/* 主要食材 */}
            <div>
              <label htmlFor="mainIngredient" className="block text-sm font-medium text-gray-700 mb-1">
                Main Ingredient *
              </label>
              <input
                type="text"
                id="mainIngredient"
                name="mainIngredient"
                value={formData.mainIngredient}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="e.g., Chicken, Beef, Vegetables"
              />
            </div>

            {/* 烹饪时间 */}
            <div>
              <label htmlFor="cookTime" className="block text-sm font-medium text-gray-700 mb-1">
                Cook Time *
              </label>
              <input
                type="text"
                id="cookTime"
                name="cookTime"
                value={formData.cookTime}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="e.g., 30 minutes, 1-2 hours"
              />
            </div>

            {/* 评分 */}
            <div>
              <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-1">
                Rating (1-5) *
              </label>
              <select
                id="rating"
                name="rating"
                value={formData.rating}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value={5}>5 - Excellent</option>
                <option value={4}>4 - Very Good</option>
                <option value={3}>3 - Good</option>
                <option value={2}>2 - Fair</option>
                <option value={1}>1 - Poor</option>
              </select>
            </div>
          </div>
        </div>

        {/* 过敏原 */}
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Allergens</h3>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {commonAllergens.map(allergen => (
              <label key={allergen} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.allergens.includes(allergen)}
                  onChange={() => handleAllergenChange(allergen)}
                  className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                />
                <span className="text-sm text-gray-700">{allergen}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 食材列表 */}
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Ingredients</h3>
          <div className="space-y-3">
            {formData.ingredients.map((ingredient, index) => (
              <div key={index} className="flex space-x-3">
                <input
                  type="text"
                  placeholder="Ingredient name"
                  value={ingredient.name}
                  onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <input
                  type="text"
                  placeholder="Quantity"
                  value={ingredient.quantity}
                  onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)}
                  className="w-40 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                {formData.ingredients.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeIngredient(index)}
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-200"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addIngredient}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition duration-200"
            >
              + Add Ingredient
            </button>
          </div>
        </div>

        {/* 烹饪步骤 */}
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Cooking Instructions</h3>
          <div>
            <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 mb-1">
              Step-by-step Instructions *
            </label>
            <textarea
              id="instructions"
              name="instructions"
              value={formData.instructions}
              onChange={handleChange}
              required
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Describe the cooking steps in detail... 
1. First step...
2. Second step...
3. Third step..."
            />
          </div>
        </div>

        {/* 营养信息 */}
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Nutrition Information</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label htmlFor="nutrition.Calories" className="block text-sm font-medium text-gray-700 mb-1">
                Calories *
              </label>
              <input
                type="text"
                name="nutrition.Calories"
                value={formData.nutrition.Calories}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="e.g., 350 kcal"
              />
            </div>
            <div>
              <label htmlFor="nutrition.Protein" className="block text-sm font-medium text-gray-700 mb-1">
                Protein *
              </label>
              <input
                type="text"
                name="nutrition.Protein"
                value={formData.nutrition.Protein}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="e.g., 25g"
              />
            </div>
            <div>
              <label htmlFor="nutrition.Carbohydrates" className="block text-sm font-medium text-gray-700 mb-1">
                Carbohydrates *
              </label>
              <input
                type="text"
                name="nutrition.Carbohydrates"
                value={formData.nutrition.Carbohydrates}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="e.g., 45g"
              />
            </div>
            <div>
              <label htmlFor="nutrition.Fat" className="block text-sm font-medium text-gray-700 mb-1">
                Fat *
              </label>
              <input
                type="text"
                name="nutrition.Fat"
                value={formData.nutrition.Fat}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="e.g., 12g"
              />
            </div>
          </div>
        </div>

        {/* 提交按钮 */}
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-4 px-6 rounded-lg font-semibold text-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Recipe...
              </span>
            ) : (
              'Create Recipe'
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate('/recipes')}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-4 px-6 rounded-lg font-semibold text-lg transition duration-200 shadow-lg hover:shadow-xl"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddRecipe;