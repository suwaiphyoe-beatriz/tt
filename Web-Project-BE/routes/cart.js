const express = require('express');
const { authenticateToken } = require('../middleware/auth');

const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
} = require('../controllers/cartController');

const router = express.Router();

// 所有购物车路由都需要认证
router.use(authenticateToken);

// 获取购物车
router.get('/', getCart);

// 添加商品到购物车
router.post('/add', addToCart);

// 更新购物车商品数量
router.put('/:ingredientId', updateCartItem);

// 从购物车删除商品
router.delete('/:ingredientId', removeFromCart);

// 清空购物车
router.delete('/', clearCart);

module.exports = router;