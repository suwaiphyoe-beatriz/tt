const { validationResult } = require('express-validator');
const User = require('../models/User');
const { generateToken } = require('../middleware/auth');

// 公共的用户响应格式化函数
const formatUserResponse = (user) => ({
  id: user._id,
  username: user.username,
  email: user.email,
  authMethods: user.authMethods,
  createdAt: user.createdAt
});

// 用户注册
const register = async (req, res) => {
  try {
    // 检查验证错误
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { username, email, password } = req.body;

    // 并行检查用户名和邮箱是否已存在（性能优化）
    const [existingUserByUsername, existingUserByEmail] = await Promise.all([
      User.findOne({ username }),
      User.findOne({ email })
    ]);

    if (existingUserByUsername) {
      return res.status(409).json({
        message: 'Username already taken',
        code: 'USERNAME_EXISTS'
      });
    }

    if (existingUserByEmail) {
      // 如果邮箱已存在但只有Google认证（没有本地密码），允许添加本地认证
      if (existingUserByEmail.googleId && !existingUserByEmail.password) {
        // 检查新用户名是否与其他用户冲突（排除当前用户）
        const usernameConflict = await User.findOne({
          username,
          _id: { $ne: existingUserByEmail._id }
        });

        if (usernameConflict) {
          return res.status(409).json({
            message: 'Username already taken',
            code: 'USERNAME_EXISTS'
          });
        }

        // 为现有Google用户添加本地认证，并更新用户名为本地注册时填写的用户名
        existingUserByEmail.username = username; // 使用本地注册时填写的用户名
        existingUserByEmail.password = password;
        existingUserByEmail.addAuthMethod('local');
        await existingUserByEmail.save();

        const token = generateToken(existingUserByEmail._id);

        return res.status(200).json({
          message: 'Local authentication added to existing Google account with updated username',
          token,
          user: formatUserResponse(existingUserByEmail)
        });
      } else {
        // 邮箱已被其他账户使用（有本地密码或没有Google ID）
        return res.status(409).json({
          message: 'Email already registered',
          code: 'EMAIL_EXISTS'
        });
      }
    }

    // 创建新用户
    const user = new User({
      username,
      email,
      password,
      authMethods: ['local']
    });

    await user.save();

    // 生成JWT token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: formatUserResponse(user)
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      message: 'Internal server error',
      code: 'SERVER_ERROR'
    });
  }
};

// 用户登录
const login = async (req, res) => {
  try {
    // 检查验证错误
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // 查找用户
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // 检查用户是否有本地密码（防止仅Google认证用户尝试密码登录）
    if (!user.password) {
      return res.status(401).json({
        message: 'Please use Google login or register with a password first',
        code: 'NO_LOCAL_AUTH'
      });
    }

    // 验证密码
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // 生成JWT token
    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: formatUserResponse(user)
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      message: 'Internal server error',
      code: 'SERVER_ERROR'
    });
  }
};

// 获取当前用户信息
const getCurrentUser = async (req, res) => {
  try {
    // 使用 populate 来获取收藏的食谱信息
    const user = await User.findById(req.user._id).populate('favoriteRecipes');

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    res.json({
      ...formatUserResponse(user),
      favoriteRecipes: user.favoriteRecipes || []
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      message: 'Internal server error',
      code: 'SERVER_ERROR'
    });
  }
};

// 验证token
const verifyToken = async (req, res) => {
  try {
    // 如果到达这里，说明token是有效的（通过了authenticateToken中间件）
    res.json({
      valid: true,
      user: formatUserResponse(req.user)
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({
      message: 'Internal server error',
      code: 'SERVER_ERROR'
    });
  }
};

// 更新用户资料
const updateProfile = async (req, res) => {
  try {
    // 检查验证错误
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // console.log('Validation errors:', errors.array()); // 添加日志
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // console.log('Update profile request:', req.body); // 添加请求日志
    const { username, password } = req.body;
    const userId = req.user._id;

    // 检查用户名是否被其他用户占用
    if (username) {
      const existingUser = await User.findOne({
        username,
        _id: { $ne: userId }
      });

      if (existingUser) {
        return res.status(409).json({
          message: 'Username already taken',
          code: 'USERNAME_EXISTS'
        });
      }
    }

    // 查找用户
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // 更新用户信息
    if (username) user.username = username;
    if (password) {
      user.password = password; // 这会触发 pre('save') 中间件来加密密码
      // 如果用户设置了密码，添加本地认证方法
      user.addAuthMethod('local');
    }

    // 保存用户（会触发密码加密）
    const updatedUser = await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: formatUserResponse(updatedUser)
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      message: 'Internal server error',
      code: 'SERVER_ERROR'
    });
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
  verifyToken,
  updateProfile
};

