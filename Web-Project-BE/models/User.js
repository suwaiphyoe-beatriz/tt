const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [30, 'Username cannot exceed 30 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: function () {
      // 如果用户没有Google ID，则密码是必需的
      // 如果有Google ID，密码是可选的（允许后续设置）
      return !this.googleId;
    },
    minlength: [6, 'Password must be at least 6 characters long']
  },
  // 用户支持的登录方式（可以同时支持多种）
  authMethods: [{
    type: String,
    enum: ['local', 'google']
  }],
  googleId: {
    type: String
  },
  favoriteRecipes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe'
  }],
  shoppingCart: [{
    ingredientId: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    unit: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    image: {
      type: String,
      default: ""
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true // 自动添加 createdAt 和 updatedAt
});

// 在保存前加密密码
userSchema.pre('save', async function (next) {
  // 只有当密码被修改时才加密
  if (!this.isModified('password')) return next();

  try {
    // 生成盐并加密密码
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// 比较密码的方法
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) {
    return false; // 没有设置密码的用户无法进行密码验证
  }
  return await bcrypt.compare(candidatePassword, this.password);
};

// 添加认证方式
userSchema.methods.addAuthMethod = function (method) {
  if (!this.authMethods.includes(method)) {
    this.authMethods.push(method);
  }
};

// 检查是否支持某种认证方式
userSchema.methods.supportsAuthMethod = function (method) {
  return this.authMethods.includes(method);
};

// 合并Google账户
userSchema.methods.mergeGoogleAccount = function (googleId, googleEmail) {
  this.googleId = googleId;
  this.addAuthMethod('google');
  return this.save();
};

// 创建索引以提高查询性能（移除重复索引）
userSchema.index({ googleId: 1 }, { sparse: true });

// 虚拟字段：不返回密码
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);
