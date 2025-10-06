const User = require('../models/User');
const { generateToken } = require('../middleware/auth');

// Google OAuth 成功回调处理
const googleCallback = async (req, res) => {
  try {
    if (!req.user) {
      return res.redirect(`${process.env.FRONTEND_URL}/#/login?error=google_auth_failed`);
    }

    const { id, displayName, emails, photos } = req.user;
    const email = emails[0].value;

    // 首先查找是否已有相同邮箱的用户
    let user = await User.findOne({ email });

    if (!user) {
      // 邮箱不存在，创建新的Google用户
      user = new User({
        username: displayName || email.split('@')[0],
        email,
        googleId: id,
        authMethods: ['google']
      });
      await user.save();
      console.log('创建新的Google用户:', user.email);
    } else {
      // 邮箱已存在，合并Google认证
      if (!user.googleId) {
        // 用户之前只有本地认证，现在添加Google认证
        await user.mergeGoogleAccount(id, email);
        console.log('将Google认证合并到现有账户:', user.email);
      } else if (user.googleId !== id) {
        // 邮箱已经被其他Google账户使用
        return res.redirect(`${process.env.FRONTEND_URL}/#/login?error=email_already_linked_to_different_google_account`);
      }
      // 如果 googleId 相同，则是同一个用户，无需操作
    }

    // 生成JWT token
    const token = generateToken(user._id);

    // 重定向到前端，携带token
    res.redirect(`${process.env.FRONTEND_URL}/#/login?token=${token}&success=google_login`);

  } catch (error) {
    console.error('Google callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/#/login?error=google_auth_failed`);
  }
};

// 验证Google token（用于前端验证）
const verifyGoogleToken = async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        valid: false,
        message: 'No token provided'
      });
    }

    // 验证JWT token
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 查找用户
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({
        valid: false,
        message: 'User not found'
      });
    }

    res.json({
      valid: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        authMethods: user.authMethods
      }
    });

  } catch (error) {
    console.error('Google token verification error:', error);
    res.status(401).json({
      valid: false,
      message: 'Invalid token'
    });
  }
};

module.exports = {
  googleCallback,
  verifyGoogleToken
};

