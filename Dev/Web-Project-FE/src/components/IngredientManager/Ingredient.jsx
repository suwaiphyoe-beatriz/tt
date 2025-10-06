import { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { UserContext } from "../../contexts/UserContext";
import sKaupatLogo from '../../assets/markets/S-Kaupat.png';
import kRuokaLogo from '../../assets/markets/K-Ruoka.png';
import lidlLogo from '../../assets/markets/Lidl.png';

function Ingredient() {
  const { id: ingredientId } = useParams();
  const { user } = useContext(UserContext);
  const [ingredient, setIngredient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // 从后端获取食材数据
  useEffect(() => {
    const fetchIngredient = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/ingredients/${ingredientId}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const ingredientData = await response.json();
        setIngredient(ingredientData);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching ingredient:', err);
      } finally {
        setLoading(false);
      }
    };

    if (ingredientId) {
      fetchIngredient();
    }
  }, [ingredientId]);

  // 处理数量变化
  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  // 处理直接输入数量
  const handleQuantityInput = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1) {
      setQuantity(value);
    }
  };

  // 跳转到超市购买
  const handleStoreClick = (storeUrl) => {
    if (storeUrl) {
      window.open(storeUrl, '_blank');
    }
  };

  // 加入购物车
  const handleAddToCart = async () => {
    try {
      // 检查用户是否登录
      if (!user) {
        alert('请先登录才能添加商品到购物车');
        return;
      }

      setIsAddingToCart(true);

      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          ingredientId: ingredient.id,
          quantity: quantity,
          unit: ingredient.unit
        })
      });

      if (response.ok) {
        // 显示成功消息
        alert(`Successfully added ${quantity}${ingredient.unit} of ${ingredient.name} to cart!`);

        // 触发购物车更新事件
        window.dispatchEvent(new CustomEvent('cartUpdated'));
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add to cart');
      }
    } catch (error) {
      alert('Failed to add item to cart. Please try again.');
    } finally {
      setIsAddingToCart(false);
    }
  };

  // 加载状态
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 图片区域骨架 */}
            <div className="aspect-square bg-gray-200 rounded-lg animate-pulse"></div>

            {/* 信息区域骨架 */}
            <div className="flex flex-col justify-start">
              <div className="h-8 bg-gray-200 rounded mb-4 animate-pulse"></div>
              <div className="h-10 bg-gray-200 rounded mb-6 animate-pulse"></div>
              <div className="h-24 bg-gray-200 rounded mb-6 animate-pulse"></div>
              <div className="h-16 bg-gray-200 rounded mb-4 animate-pulse"></div>
              <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8">
            <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl font-semibold text-red-800 mb-2">Failed to load ingredient</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 如果没有获取到食材数据
  if (!ingredient) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto text-center">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Ingredient not found</h2>
            <p className="text-gray-600">The ingredient you're looking for doesn't exist or has been removed.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左侧 - 主图 */}
          <div className="aspect-square">
            <img
              src={ingredient.image}
              alt={ingredient.name}
              className="w-full h-full object-cover rounded-lg shadow-lg"
            />
          </div>

          {/* 右侧 - 信息区域 */}
          <div className="flex flex-col justify-start">
            {/* 名称 */}
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{ingredient.name}</h1>

            {/* 价格与单位 */}
            <div className="mb-6">
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-bold text-green-600">
                  ${ingredient.price.toFixed(2)}
                </span>
                <span className="text-lg text-gray-600">/{ingredient.unit}</span>
              </div>
            </div>

            {/* 说明文字 */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed">{ingredient.description}</p>

              {/* 营养信息或其他属性 */}
              {ingredient.nutritionInfo && (
                <div className="mt-4">
                  <h4 className="font-medium text-gray-800 mb-2">Nutrition Information</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                    {Object.entries(ingredient.nutritionInfo).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="capitalize">{key}:</span>
                        <span>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 数量选择器 */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Quantity</h3>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>

                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={quantity}
                    onChange={handleQuantityInput}
                    className="w-20 px-3 py-2 border border-gray-300 rounded-md text-center focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>

                <button
                  onClick={() => handleQuantityChange(1)}
                  className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </button>
              </div>

              {/* 总价显示 */}
              <div className="mt-2">
                <span className="text-sm text-gray-600">
                  Total: <span className="font-semibold text-gray-800">${(quantity * ingredient.price).toFixed(2)}</span>
                </span>
              </div>
            </div>

            {/* 加入购物车按钮 */}
            <button
              onClick={handleAddToCart}
              disabled={isAddingToCart || !user}
              className={`w-full font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2 ${!user
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white'
                }`}
            >
              {isAddingToCart ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Adding to Cart...</span>
                </>
              ) : !user ? (
                <span>Please Login to Add to Cart</span>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8m-8 0V9" />
                  </svg>
                  <span>Add to Cart</span>
                </>
              )}
            </button>

            {/* 超市购买按钮 */}
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Buy from stores:</h4>
              <div className="grid grid-cols-3 gap-3">
                {ingredient.url && ingredient.url["S-market"] && (
                  <button
                    onClick={() => handleStoreClick(ingredient.url["S-market"])}
                    className="bg-gradient-to-br from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 text-slate-700 font-medium py-2.5 px-3 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 text-sm shadow-sm hover:shadow-md border border-slate-300"
                  >
                    <img
                      src={sKaupatLogo}
                      alt="S-Kaupat"
                      className="h-6 object-contain"
                    />
                    <span className="text-xs font-semibold">S-Kaupat</span>
                  </button>
                )}

                {ingredient.url && ingredient.url["K-market"] && (
                  <button
                    onClick={() => handleStoreClick(ingredient.url["K-market"])}
                    className="bg-gradient-to-br from-rose-100 to-rose-200 hover:from-rose-200 hover:to-rose-300 text-rose-700 font-medium py-2.5 px-3 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 text-sm shadow-sm hover:shadow-md border border-rose-300"
                  >
                    <img
                      src={kRuokaLogo}
                      alt="K-Ruoka"
                      className="h-6 object-contain"
                    />
                    <span className="text-xs font-semibold">K-Ruoka</span>
                  </button>
                )}

                {ingredient.url && ingredient.url["Lidl"] && (
                  <button
                    onClick={() => handleStoreClick(ingredient.url["Lidl"])}
                    className="bg-gradient-to-br from-amber-100 to-amber-200 hover:from-amber-200 hover:to-amber-300 text-amber-700 font-medium py-2.5 px-3 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 text-sm shadow-sm hover:shadow-md border border-amber-300"
                  >
                    <img
                      src={lidlLogo}
                      alt="Lidl"
                      className="h-6 object-contain"
                    />
                    <span className="text-xs font-semibold">Lidl</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 额外的信息区域 */}
        {ingredient.additionalInfo && (
          <div className="mt-12 bg-gray-50 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Additional Information</h3>
            <div
              className="prose prose-sm max-w-none text-gray-600"
              dangerouslySetInnerHTML={{ __html: ingredient.additionalInfo }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default Ingredient;