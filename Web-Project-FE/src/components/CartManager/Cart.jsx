import { useState, useEffect, useContext } from 'react';
import { UserContext } from '../../contexts/UserContext';
import { Link } from 'react-router-dom';

const Cart = () => {
  const { user } = useContext(UserContext);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  // 获取购物车数据
  const fetchCart = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');

      if (!token) {
        setError('Please login to view your cart');
        return;
      }

      const response = await fetch('/api/cart', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError('Please login to view your cart');
          return;
        }
        throw new Error('Failed to fetch cart');
      }

      const data = await response.json();

      if (data.success) {
        setCartItems(data.data.items);
        setTotalPrice(data.data.totalPrice);
        setTotalItems(data.data.totalItems);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching cart:', err);
    } finally {
      setLoading(false);
    }
  };

  // 更新商品数量
  const updateQuantity = async (ingredientId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/cart/${ingredientId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ quantity: newQuantity })
      });

      if (response.ok) {
        // 局部更新：只更新特定商品的数量
        setCartItems(prevItems => {
          const updatedItems = prevItems.map(item => {
            if (item.ingredientId === ingredientId) {
              return { ...item, quantity: newQuantity };
            }
            return item;
          });

          // 重新计算总数量和总价格
          const newTotalItems = updatedItems.reduce((total, item) => total + item.quantity, 0);
          const newTotalPrice = updatedItems.reduce((total, item) => total + (item.price * item.quantity), 0);

          setTotalItems(newTotalItems);
          setTotalPrice(parseFloat(newTotalPrice.toFixed(2)));

          return updatedItems;
        });

        window.dispatchEvent(new CustomEvent('cartUpdated')); // 触发更新事件
      } else {
        throw new Error('Failed to update quantity');
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      alert('Failed to update quantity');
    }
  };

  // 删除商品
  const removeItem = async (ingredientId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/cart/${ingredientId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // 局部更新：移除特定商品并重新计算总计
        setCartItems(prevItems => {
          const removedItem = prevItems.find(item => item.ingredientId === ingredientId);
          const newItems = prevItems.filter(item => item.ingredientId !== ingredientId);

          // 更新总数量和总价格
          if (removedItem) {
            setTotalItems(prev => prev - removedItem.quantity);
            setTotalPrice(prev => parseFloat((prev - (removedItem.price * removedItem.quantity)).toFixed(2)));
          }

          return newItems;
        });

        window.dispatchEvent(new CustomEvent('cartUpdated')); // 触发更新事件
      } else {
        throw new Error('Failed to remove item');
      }
    } catch (error) {
      console.error('Error removing item:', error);
      alert('Failed to remove item');
    }
  };

  // 清空购物车
  const clearCart = async () => {
    if (!confirm('Are you sure you want to clear your cart?')) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/cart', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // 局部更新：清空所有数据
        setCartItems([]);
        setTotalItems(0);
        setTotalPrice(0);

        window.dispatchEvent(new CustomEvent('cartUpdated')); // 触发更新事件
      } else {
        throw new Error('Failed to clear cart');
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      alert('Failed to clear cart');
    }
  };

  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setLoading(false);
      setError('Please login to view your cart');
    }
  }, [user]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
          {!user && (
            <Link
              to="/login"
              className="bg-orange-500 text-white px-6 py-2 rounded hover:bg-orange-600 transition duration-200"
            >
              Go to Login
            </Link>
          )}
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Shopping Cart</h1>
          <div className="bg-gray-100 rounded-lg p-8">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5-6M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6" />
            </svg>
            <p className="text-gray-600 text-lg mb-4">Your cart is empty</p>
            <Link
              to="/recipes"
              className="bg-orange-500 text-white px-6 py-2 rounded hover:bg-orange-600 transition duration-200"
            >
              Browse Recipes
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Your Shopping Cart</h1>
          <button
            onClick={clearCart}
            className="text-red-600 hover:text-red-800 transition duration-200"
          >
            Clear Cart
          </button>
        </div>

        {/* 购物车商品列表 */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          {cartItems.map((item) => (
            <div key={item.ingredientId} className="flex items-center p-4 border-b border-gray-200 last:border-b-0">
              {/* 商品图片 */}
              <div className="w-16 h-16 flex-shrink-0 mr-4">
                <Link to={`/ingredient/${item.ingredientId}`}>
                  <img
                    src={item.image || '/placeholder-ingredient.png'}
                    alt={item.name}
                    className="w-full h-full object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                    onError={(e) => {
                      e.target.src = '/placeholder-ingredient.png';
                    }}
                  />
                </Link>
              </div>

              {/* 商品信息 */}
              <div className="flex-1">
                <Link to={`/ingredient/${item.ingredientId}`}>
                  <h3 className="text-lg font-semibold text-gray-800 hover:text-orange-500 cursor-pointer transition-colors">
                    {item.name}
                  </h3>
                </Link>
                <p className="text-gray-600">€{item.price.toFixed(2)} per {item.unit}</p>
              </div>

              {/* 数量控制 */}
              <div className="flex items-center mx-4">
                <button
                  onClick={() => updateQuantity(item.ingredientId, item.quantity - 1)}
                  className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition duration-200"
                  disabled={item.quantity <= 1}
                >
                  -
                </button>
                <span className="mx-3 min-w-[2rem] text-center font-semibold">
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(item.ingredientId, item.quantity + 1)}
                  className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition duration-200"
                >
                  +
                </button>
              </div>

              {/* 小计 */}
              <div className="text-right mr-4">
                <p className="font-semibold text-lg">€{(item.price * item.quantity).toFixed(2)}</p>
              </div>

              {/* 删除按钮 */}
              <button
                onClick={() => removeItem(item.ingredientId)}
                className="text-red-600 hover:text-red-800 transition duration-200 p-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* 购物车总计 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-gray-600">Total Items: {totalItems}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-800">Total: €{totalPrice.toFixed(2)}</p>
            </div>
          </div>

          <div className="flex space-x-4">
            <Link
              to="/recipes"
              className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded text-center hover:bg-gray-300 transition duration-200"
            >
              Continue Shopping
            </Link>
            <button
              className="flex-1 bg-orange-500 text-white px-6 py-3 rounded hover:bg-orange-600 transition duration-200"
              onClick={() => alert('Checkout functionality will be implemented in the future')}
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;