// /src/RecipeManager/Recipes
import { useState, useEffect } from "react";
import RecipeCard from "./RecipeCard";
import RecipeFilter from "./RecipeFilter";

function Recipes() {
  const [allRecipes, setAllRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [filters, setFilters] = useState({
    country: [],                  // 改为数组
    mainIngredient: [],           // 改为数组
    allergens: []                 // 保持数组
  });
  const [availableOptions, setAvailableOptions] = useState({
    countries: [],
    mainIngredients: [],
    allergens: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  const [favoriteIds, setFavoriteIds] = useState([]);

  // Fetch all recipes and filter options from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch recipes and filter options in parallel
        const [recipesResponse, filterOptionsResponse] = await Promise.all([
          fetch('/api/recipes'),
          fetch('/api/recipes/filter-options')
        ]);

        if (!recipesResponse.ok || !filterOptionsResponse.ok) {
          throw new Error('Failed to fetch data from server');
        }

        const recipesData = await recipesResponse.json();
        const filterOptionsData = await filterOptionsResponse.json();

        if (recipesData.success && filterOptionsData.success) {
          setAllRecipes(recipesData.data);
          setFilteredRecipes(recipesData.data);
          setAvailableOptions(filterOptionsData.data);
        } else {
          throw new Error('Invalid response format from server');
        }
      } catch (err) {
        console.error('Error fetching recipes:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);


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
          const ids = userData.favoriteRecipes.map(item => item._id?.toString());
          setFavoriteIds(ids);
        }
      } catch (error) {
        console.error('Failed to fetch user favorites:', error);
      }
    };

    fetchUserFavorites();
  }, []);


  // Handle filter changes
  const handleFilterChange = async (newFilters) => {
    setFilters(newFilters);

    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams();

      if (newFilters.country && newFilters.country.length > 0) {
        newFilters.country.forEach(country => queryParams.append('country', country));
      }
      if (newFilters.mainIngredient && newFilters.mainIngredient.length > 0) {
        newFilters.mainIngredient.forEach(ingredient => queryParams.append('mainIngredient', ingredient));
      }
      if (newFilters.allergens && newFilters.allergens.length > 0) {
        newFilters.allergens.forEach(allergen => queryParams.append('allergens', allergen));
      }

      const response = await fetch(`/api/recipes/filter?${queryParams}`);

      if (!response.ok) {
        throw new Error('Failed to filter recipes');
      }

      const data = await response.json();

      if (data.success) {
        setFilteredRecipes(data.data);
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (err) {
      console.error('Error filtering recipes:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      country: [],
      mainIngredient: [],
      allergens: []
    };
    handleFilterChange(clearedFilters);
  };

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">All Recipes</h1>
        <div className="text-center py-12">
          <div className="mb-4">
            <svg className="mx-auto h-16 w-16 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Recipes</h3>
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

  // Loading state
  if (loading && filteredRecipes.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">All Recipes</h1>
        <RecipeFilter
          filters={filters}
          availableOptions={availableOptions}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
        />
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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">All Recipes</h1>

      {/* Filter Component */}
      <RecipeFilter
        filters={filters}
        availableOptions={availableOptions}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />

      {/* Filter Results Statistics */}
      <div className="mb-6">
        <p className="text-gray-600">
          Found <span className="font-semibold text-orange-600">{filteredRecipes.length}</span> recipes
          {filteredRecipes.length !== allRecipes.length && (
            <span className="text-sm text-gray-500 ml-2">
              (out of {allRecipes.length} total recipes)
            </span>
          )}
        </p>
      </div>

      {/* Recipe List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch">
        {filteredRecipes.map(recipe => (
          <RecipeCard key={recipe._id} recipe={recipe} favoriteIds={favoriteIds} />
        ))}
      </div>

      {/* Empty State */}
      {filteredRecipes.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="mb-4">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.709M15 6.291A7.962 7.962 0 0012 5c-2.34 0-4.29 1.009-5.824 2.709" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No recipes found matching your criteria</h3>
          <p className="text-gray-500 mb-4">Try adjusting your filters or clear all filters to see all recipes</p>
          <button
            onClick={handleClearFilters}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}

export default Recipes;