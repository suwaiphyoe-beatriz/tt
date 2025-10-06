import { useState, useEffect, useContext } from "react";
import { UserContext } from "../../contexts/UserContext";
import RecipeCard from "./RecipeCard";

function FavoriteRecipes() {
  const { user } = useContext(UserContext);
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 获取用户收藏的recipes
  useEffect(() => {
    const fetchFavoriteRecipes = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('authToken');
        if (!token) {
          setError('Please login to view your favorite recipes');
          setLoading(false);
          return;
        }

        const response = await fetch('/api/recipes/favorites', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch favorite recipes');
        }

        const data = await response.json();
        if (data.success) {
          setFavoriteRecipes(data.data);
        } else {
          throw new Error(data.message || 'Failed to fetch favorite recipes');
        }
      } catch (err) {
        console.error('Error fetching favorite recipes:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFavoriteRecipes();
  }, []);

  // 监听收藏状态更新事件，实时更新列表
  useEffect(() => {
    const handleFavoriteUpdate = (event) => {
      const { recipeId, isFavorited } = event.detail;

      if (isFavorited) {
        // 如果添加收藏，需要重新获取数据来获取完整的recipe信息
        const fetchUpdatedList = async () => {
          try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('/api/recipes/favorites', {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            const data = await response.json();
            if (data.success) {
              setFavoriteRecipes(data.data);
            }
          } catch (err) {
            console.error('Error updating favorite list:', err);
          }
        };
        fetchUpdatedList();
      } else {
        // 如果取消收藏，直接从列表中移除
        setFavoriteRecipes(prev =>
          prev.filter(recipe => recipe._id !== recipeId)
        );
      }
    };

    window.addEventListener('favoriteUpdated', handleFavoriteUpdate);
    return () => window.removeEventListener('favoriteUpdated', handleFavoriteUpdate);
  }, []);

  // 如果用户未登录
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="mb-4">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Login Required</h3>
          <p className="text-gray-500 mb-4">Please login to view your favorite recipes</p>
          <a
            href="/#/login"
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md transition-colors"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  // 加载状态
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Favorite Recipes</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
            <div key={item} className="bg-white rounded-lg shadow-md overflow-hidden h-96">
              <div className="w-full h-48 bg-gray-200 animate-pulse"></div>
              <div className="p-4 h-48">
                <div className="h-6 bg-gray-200 rounded mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded mb-3 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded mb-4 animate-pulse"></div>
                <div className="flex justify-between">
                  <div className="h-5 w-5 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-10 w-10 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">My Favorite Recipes</h1>
        <div className="text-center py-12">
          <div className="mb-4">
            <svg className="mx-auto h-16 w-16 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Favorites</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">My Favorite Recipes</h1>

      {/* 收藏统计 */}
      <div className="mb-6">
        <p className="text-gray-600">
          You have <span className="font-semibold text-orange-600">{favoriteRecipes.length}</span> favorite recipes
        </p>
      </div>

      {/* 收藏的recipes列表 */}
      {favoriteRecipes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch">
          {favoriteRecipes.map(recipe => (
            <RecipeCard
              key={recipe._id}
              recipe={recipe}
              favoriteIds={favoriteRecipes.map(r => r._id)}
            />
          ))}
        </div>
      ) : (
        // 空状态
        <div className="text-center py-12">
          <div className="mb-4">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No favorite recipes yet</h3>
          <p className="text-gray-500 mb-4">Start exploring recipes and favorite your best ones!</p>
          <a
            href="/#/recipes"
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md transition-colors"
          >
            Browse Recipes
          </a>
        </div>
      )}
    </div>
  );
}

export default FavoriteRecipes;