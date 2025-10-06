const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../models/User');

// Load environment variables
require('dotenv').config();

// JWT Strategy
passport.use(new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
}, async (payload, done) => {
  try {
    const user = await User.findById(payload.userId).select('-password');
    if (user) {
      return done(null, user);
    }
    return done(null, false);
  } catch (error) {
    return done(error, false);
  }
}));

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // 这里不需要查找或创建用户，我们会在回调控制器中处理
    return done(null, profile);
  } catch (error) {
    return done(error, null);
  }
}));

// 序列化用户（用于session，虽然我们主要使用JWT）
passport.serializeUser((user, done) => {
  // 如果是Google profile，使用googleId；如果是MongoDB用户，使用_id
  const id = user._id || user.id;
  done(null, id);
});

passport.deserializeUser(async (id, done) => {
  try {
    // 尝试作为MongoDB ObjectId查找
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      const user = await User.findById(id).select('-password');
      if (user) {
        return done(null, user);
      }
    }
    
    // 如果不是ObjectId或找不到用户，尝试作为Google ID查找
    const user = await User.findOne({ googleId: id }).select('-password');
    if (user) {
      return done(null, user);
    }
    
    // 都找不到，返回null
    done(null, null);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
