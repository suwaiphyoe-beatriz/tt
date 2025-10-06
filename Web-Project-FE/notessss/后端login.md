```jsx
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  // TODO: 去数据库查找用户
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(401).json({ message: 'User not found' });
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid password' });
  }

  // 生成 JWT
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

  res.json({
    token,
    user: {
      id: user._id,
      email: user.email
    }
  });
});
```