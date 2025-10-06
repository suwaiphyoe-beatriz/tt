import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext';

function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [recipe, setRecipe] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const fetchRecipeDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/recipes/${id}`);

        if (!response.ok) {
          throw new Error('Recipe not found');
        }

        const responseData = await response.json();
        if (responseData.success) {
          setRecipe(responseData.data);
          setIsFavorited(responseData.data.isFavorited || false);
        } else {
          throw new Error(responseData.message || 'Failed to fetch recipe');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRecipeDetail();
    }
  }, [id]);

  // 获取所有ingredients用于名称匹配
  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        const response = await fetch('/api/ingredients');
        if (response.ok) {
          const ingredientsData = await response.json();
          setIngredients(ingredientsData);
        }
      } catch (error) {
        console.error('Error fetching ingredients:', error);
      }
    };

    fetchIngredients();
  }, []);

  // 添加获取用户收藏状态的 useEffect
  useEffect(() => {
    const fetchUserFavorites = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      try {
        const response = await fetch('/api/auth/user', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const userData = await response.json();
          const favoriteIds = userData.favoriteRecipes.map(item => item._id?.toString());
          setIsFavorited(favoriteIds.includes(id));
        }
      } catch (error) {
        console.error('Failed to fetch user favorites:', error);
      }
    };

    fetchUserFavorites();
  }, [id]);

  // 监听全局收藏状态更新事件
  useEffect(() => {
    const handleFavoriteUpdate = (event) => {
      if (event.detail.recipeId === id) {
        setIsFavorited(event.detail.isFavorited);
      }
    };

    window.addEventListener('favoriteUpdated', handleFavoriteUpdate);
    return () => window.removeEventListener('favoriteUpdated', handleFavoriteUpdate);
  }, [id]);

  // 修改收藏切换处理函数
  const handleFavoriteToggle = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      alert('Please login to favorite recipes');
      return;
    }

    try {
      const response = await fetch(`/api/recipes/${id}/favorite`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setIsFavorited(data.isFavorited);
        // 触发全局收藏状态更新事件
        window.dispatchEvent(new CustomEvent('favoriteUpdated', {
          detail: { recipeId: id, isFavorited: data.isFavorited }
        }));
      } else {
        alert(data.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Favorite toggle error:', error);
      alert('Network error, please try again');
    }
  };

  // 删除食谱处理函数
  const handleDeleteRecipe = async () => {
    if (!user) {
      alert('Please login to delete recipes');
      return;
    }

    // 确认删除
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${recipe.title}"? This action cannot be undone.`
    );

    if (!confirmDelete) return;

    setDeleteLoading(true);
    const token = localStorage.getItem('authToken');

    try {
      const response = await fetch(`/api/recipes/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert('Recipe deleted successfully!');
        navigate('/recipes');
      } else {
        alert(data.message || 'Failed to delete recipe');
      }
    } catch (error) {
      console.error('Delete recipe error:', error);
      alert('Network error, please try again');
    } finally {
      setDeleteLoading(false);
    }
  };

  const getCountryFlag = (country) => {
    const flags = {
      'Vietnam': '🇻🇳',
      'Turkey': '🇹🇷',
      'South Korea': '🇰🇷',
      'China': '🇨🇳',
      'Japan': '🇯🇵',
      'Traditional': '🏛️'
    };
    return flags[country] || '🌍';
  };

  const getAllergenColor = (allergen) => {
    const colors = {
      'Dairy': 'bg-red-100 text-red-800',
      'Gluten': 'bg-yellow-100 text-yellow-800',
      'Peanuts': 'bg-orange-100 text-orange-800',
      'Soy': 'bg-green-100 text-green-800',
      'Sesame': 'bg-purple-100 text-purple-800',
      'Fish': 'bg-blue-100 text-blue-800'
    };
    return colors[allergen] || 'bg-gray-100 text-gray-800';
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }

    if (hasHalfStar) {
      stars.push(
        <svg key="half" className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <defs>
            <linearGradient id="half">
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <path fill="url(#half)" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <svg key={`empty-${i}`} className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }

    return stars;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded mb-6"></div>
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded mb-6"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/recipes')}
            className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Back to Recipes
          </button>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Recipe not found</h2>
          <button
            onClick={() => navigate('/recipes')}
            className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Back to Recipes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* 面包屑导航 */}
      <nav className="mb-6">
        <ol className="flex items-center space-x-2 text-sm text-gray-600">
          <li>
            <Link to="/" className="hover:text-orange-500 transition-colors">Home</Link>
          </li>
          <li className="flex items-center">
            <svg className="w-4 h-4 mx-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            <Link to="/recipes" className="hover:text-orange-500 transition-colors">Recipes</Link>
          </li>
          <li className="flex items-center">
            <svg className="w-4 h-4 mx-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-gray-800 font-medium">{recipe.title}</span>
          </li>
        </ol>
      </nav>

      {/* 主图 */}
      <div className="mb-8">
        <div className="relative">
          <img
            src={recipe.image}
            alt={recipe.title}
            className="w-full h-96 object-cover rounded-lg shadow-lg"
          />
          {/* 书签按钮 */}
          <button
            onClick={handleFavoriteToggle}
            className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
          >
            {isFavorited ? (
              <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* 标题和基本信息 */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">{recipe.title}</h1>

        {/* 国家、主食材、评分 */}
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex items-center bg-gray-100 px-3 py-1 rounded-full">
            <span className="text-lg mr-2">{getCountryFlag(recipe.country)}</span>
            <span className="text-gray-700 font-medium">{recipe.country}</span>
          </div>

          <div className="flex items-center bg-orange-100 px-3 py-1 rounded-full">
            <span className="text-orange-600 font-medium">🥬 {recipe.mainIngredient}</span>
          </div>

          <div className="flex items-center">
            <div className="flex items-center mr-2">
              {renderStars(recipe.rating)}
            </div>
            <span className="text-gray-600 font-medium">{recipe.rating}</span>
          </div>
        </div>

        {/* 过敏原标签 */}
        {recipe.allergens && recipe.allergens.length > 0 && (
          <div className="mb-4">
            <span className="text-sm text-gray-600 mr-2">Allergens:</span>
            <div className="flex flex-wrap gap-2">
              {recipe.allergens.map((allergen, index) => (
                <span
                  key={index}
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getAllergenColor(allergen)}`}
                >
                  {allergen}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 烹饪时间 */}
        <div className="flex items-center text-gray-600 mb-6">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-lg font-medium">Cook Time: {recipe.cookTime}</span>
        </div>
      </div>

      {/* 描述 */}
      <div className="mb-8">
        <p className="text-gray-700 text-lg leading-relaxed border-l-4 border-orange-400 pl-6 py-4 bg-gray-50 rounded-r-lg">
          {recipe.description}
        </p>
      </div>

      {/* 营养成分 */}
      {recipe.nutrition && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Nutrition Information</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(recipe.nutrition).map(([key, value]) => (
              <div key={key} className="bg-white p-4 rounded-lg shadow-md text-center">
                <div className="text-2xl font-bold text-orange-600">{value}</div>
                <div className="text-sm text-gray-600">{key}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 食材 */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Ingredients</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {recipe.ingredients?.map((ingredient, index) => {
            // 通过名称匹配找到对应的ingredient ID
            const getIngredientId = (name) => {
              const foundIngredient = ingredients.find(ing => {
                const lowerIngName = ing.name.toLowerCase();
                const lowerSearchName = name.toLowerCase();

                // 尝试完全匹配
                if (lowerIngName.includes(lowerSearchName) || lowerSearchName.includes(lowerIngName)) {
                  return true;
                }

                // 尝试关键词匹配
                const keywords = ['fish sauce', 'beef bones', 'flank steak', 'ginger', 'onion', 'star anise', 'cinnamon', 'coriander', 'cloves'];
                for (const keyword of keywords) {
                  if (lowerSearchName.includes(keyword) && lowerIngName.includes(keyword)) {
                    return true;
                  }
                }

                return false;
              });

              return foundIngredient ? foundIngredient.id : null;
            };

            const ingredientId = getIngredientId(ingredient.name);
            const isClickable = ingredientId !== null;

            return (
              <div
                key={index}
                className={`flex items-center bg-white p-4 rounded-lg shadow-sm border border-gray-200 ${isClickable ? 'cursor-pointer hover:shadow-md hover:border-orange-300 transition-all duration-200' : ''
                  }`}
                onClick={isClickable ? () => navigate(`/ingredient/${ingredientId}`) : undefined}
              >
                <div className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <span className={`font-medium ${isClickable ? 'text-orange-600 hover:text-orange-700' : 'text-gray-800'}`}>
                    {ingredient.name}
                    {isClickable && <span className="ml-2 text-xs text-orange-500">(Click for details)</span>}
                  </span>
                  {ingredient.quantity && !isClickable && (
                    <span className="text-gray-600 ml-2">({ingredient.quantity})</span>
                  )}
                </div>
                {isClickable && (
                  <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 烹饪步骤 */}
      {recipe.instructions && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Cooking Instructions</h2>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div
              className="text-gray-700 leading-relaxed [&_h4]:text-lg [&_h4]:font-semibold [&_h4]:text-gray-800 [&_h4]:mt-6 [&_h4]:mb-3 [&_ul]:list-disc [&_ul]:ml-6 [&_li]:mb-2 [&_li]:leading-relaxed [&_strong]:font-bold"
              dangerouslySetInnerHTML={{ __html: recipe.instructions }}
            />
          </div>
        </div>
      )}

      {/* 操作按钮 */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
        <button
          onClick={() => navigate('/recipes')}
          className="bg-orange-500 text-white px-8 py-3 rounded-lg hover:bg-orange-600 transition-colors font-medium"
        >
          Back to All Recipes
        </button>

        {/* 删除按钮 - 仅登录用户可见 */}
        {user && (
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Edit Button */}
              <button
                onClick={() => navigate(`/recipes/edit/${recipe._id}`)}
                className="bg-blue-500 text-white px-8 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium flex items-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536M9 13l6.268-6.268a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-.707.465l-4.121 1.03a.5.5 0 01-.606-.606l1.03-4.121a2 2 0 01.465-.707z"
                  />
                </svg>
                Edit Recipe
              </button>

              {/* Delete Button */}
              <button
                onClick={handleDeleteRecipe}
                disabled={deleteLoading}
                className="bg-red-500 text-white px-8 py-3 rounded-lg hover:bg-red-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {deleteLoading ? (
                  <>
                    <svg
                      className="animate-spin w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H7a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Delete Recipe
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
  );
}

export default RecipeDetail;