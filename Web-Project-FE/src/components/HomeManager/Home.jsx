import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import Hero from './Hero';
import RecipeCard from '../RecipeManager/RecipeCard';
import { UserContext } from '../../contexts/UserContext';

function Home() {
  const { user } = useContext(UserContext);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 获取AI推荐
  const fetchAIRecommendations = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');
      const headers = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/ai/recommendations', {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const text = await response.text();
      if (!text) {
        throw new Error('Empty response from server');
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch (jsonError) {
        console.error('JSON Parse Error:', jsonError);
        console.error('Response text:', text);
        throw new Error('Invalid JSON response from server');
      }

      if (data.success) {
        setRecommendations(data.data);
      } else {
        setError(data.message || 'Failed to get recommendations');
      }
    } catch (err) {
      setError(`Network error: ${err.message}`);
      console.error('AI recommendations error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAIRecommendations();
  }, [user]);

  return (
    <div>
      <Hero />

      {/* AI推荐部分 */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              🤖 AI Recipe Recommendations
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {user ?
                "Based on your favorite recipes, our AI chef suggests these delicious dishes for you!" :
                "Discover these amazing recipes handpicked by our AI chef!"
              }
            </p>
          </div>

          {loading && (
            <div className="flex justify-center items-center py-8">
              <div className="flex items-center space-x-2">
                <svg className="animate-spin h-8 w-8 text-orange-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-lg text-gray-600">AI is thinking...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 text-center">
              <p className="font-medium">Error loading AI recommendations:</p>
              <p className="text-sm mt-1">{error}</p>
              <button
                onClick={fetchAIRecommendations}
                className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && recommendations.length > 0 && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {recommendations.map((recipe, index) => (
                  <div key={recipe._id} className="relative">
                    <div className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded-full text-sm font-medium z-10">
                      #{index + 1} AI Pick
                    </div>
                    <RecipeCard recipe={recipe} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {!loading && !error && recommendations.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">No recommendations available at the moment.</p>
              <button
                onClick={fetchAIRecommendations}
                className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
              >
                Get Recommendations
              </button>
            </div>
          )}

          <div className="text-center mt-8">
            <Link
              to="/recipes"
              className="inline-flex items-center bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-900 transition-colors font-medium"
            >
              Explore All Recipes
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;