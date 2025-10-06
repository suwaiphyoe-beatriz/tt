const express = require('express');
const { body } = require('express-validator');
const passport = require('passport');
const { authenticateToken } = require('../middleware/auth');
const { register, login, getCurrentUser, verifyToken, updateProfile } = require('../controllers/authController');
const { googleCallback, verifyGoogleToken } = require('../controllers/googleAuthController');

const router = express.Router();

// 输入验证规则
const registerValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// 本地认证路由
router.post('/signup', registerValidation, register);
router.post('/login', loginValidation, login);

// Google OAuth 路由
router.get('/google',
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })
);

router.get('/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=google_auth_failed`
  }),
  googleCallback
);

// Token 验证路由
router.post('/verify-google-token', verifyGoogleToken);
router.get('/verify-token', authenticateToken, verifyToken);

// 用户信息路由
router.get('/user', authenticateToken, getCurrentUser);

// 更新用户资料路由
router.put('/update-profile', [
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters'),
  // 移除了严格的字符限制，允许更多字符
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
], authenticateToken, updateProfile);

module.exports = router;