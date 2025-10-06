const User = require('../models/User');
const Ingredient = require('../models/Ingredient');

// 获取用户购物车
const getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('shoppingCart');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // 计算购物车总价
    const totalPrice = user.shoppingCart.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);

    res.json({
      success: true,
      data: {
        items: user.shoppingCart,
        totalItems: user.shoppingCart.length,
        totalPrice: parseFloat(totalPrice.toFixed(2))
      }
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cart',
      error: error.message
    });
  }
};

// 添加商品到购物车
const addToCart = async (req, res) => {
  try {
    const { ingredientId, quantity, unit } = req.body;

    // 验证输入
    if (!ingredientId || !quantity || !unit) {
      return res.status(400).json({
        success: false,
        message: 'Ingredient ID, quantity, and unit are required'
      });
    } if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1'
      });
    }

    // 获取食材信息
    const ingredient = await Ingredient.findOne({ id: ingredientId });
    if (!ingredient) {
      return res.status(404).json({
        success: false,
        message: 'Ingredient not found'
      });
    }

    // 获取用户
    const user = await User.findById(req.user._id); if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // 检查购物车中是否已存在该商品
    const existingItemIndex = user.shoppingCart.findIndex(
      item => item.ingredientId === ingredientId
    );

    if (existingItemIndex > -1) {
      // 如果已存在，更新数量
      user.shoppingCart[existingItemIndex].quantity += quantity;
    } else {
      // 如果不存在，添加新商品
      user.shoppingCart.push({
        ingredientId: ingredient.id,
        name: ingredient.name,
        quantity: quantity,
        unit: unit,
        price: ingredient.price,
        image: ingredient.image
      });
    }

    // 明确标记shoppingCart为已修改
    user.markModified('shoppingCart');
    await user.save(); res.status(201).json({
      success: true,
      message: 'Item added to cart successfully',
      data: {
        item: {
          ingredientId: ingredient.id,
          name: ingredient.name,
          quantity: quantity,
          unit: unit,
          price: ingredient.price,
          image: ingredient.image
        }
      }
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add item to cart',
      error: error.message
    });
  }
};

// 更新购物车商品数量
const updateCartItem = async (req, res) => {
  try {
    const { ingredientId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1'
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const itemIndex = user.shoppingCart.findIndex(
      item => item.ingredientId === ingredientId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    user.shoppingCart[itemIndex].quantity = quantity;
    await user.save();

    res.json({
      success: true,
      message: 'Cart item updated successfully',
      data: user.shoppingCart[itemIndex]
    });
  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update cart item',
      error: error.message
    });
  }
};

// 从购物车删除商品
const removeFromCart = async (req, res) => {
  try {
    const { ingredientId } = req.params;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const itemIndex = user.shoppingCart.findIndex(
      item => item.ingredientId === ingredientId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    user.shoppingCart.splice(itemIndex, 1);
    await user.save();

    res.json({
      success: true,
      message: 'Item removed from cart successfully'
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove item from cart',
      error: error.message
    });
  }
};

// 清空购物车
const clearCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.shoppingCart = [];
    await user.save();

    res.json({
      success: true,
      message: 'Cart cleared successfully'
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cart',
      error: error.message
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};