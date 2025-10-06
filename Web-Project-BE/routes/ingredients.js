const express = require('express');
const router = express.Router();
const Ingredient = require('../models/Ingredient');

// Get all ingredients
router.get('/', async (req, res) => {
  try {
    const ingredients = await Ingredient.find();
    res.json(ingredients);
  } catch (error) {
    console.error('Error fetching ingredients:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ingredients'
    });
  }
});

// Get single ingredient by ID
router.get('/:id', async (req, res) => {
  try {
    // 首先尝试通过自定义id字段查找
    let ingredient = await Ingredient.findOne({ id: req.params.id });

    // 如果没找到，尝试通过MongoDB _id查找（向后兼容）
    if (!ingredient) {
      try {
        ingredient = await Ingredient.findById(req.params.id);
      } catch (err) {
        // 忽略无效的ObjectId错误
      }
    }

    if (!ingredient) {
      return res.status(404).json({
        success: false,
        message: 'Ingredient not found'
      });
    }

    res.json(ingredient);
  } catch (error) {
    console.error('Error fetching ingredient:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ingredient'
    });
  }
});

module.exports = router;