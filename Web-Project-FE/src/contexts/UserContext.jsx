import React, { createContext, useState, useEffect } from "react";

// 创建 Context
export const UserContext = createContext();

// 提供 Context 的 Provider
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // 从 localStorage 恢复用户信息
    const savedUser = localStorage.getItem('userInfo');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [authToken, setAuthToken] = useState(localStorage.getItem('authToken'));
  // 页面刷新时验证 token
  // useEffect(() => {
  //   const token = localStorage.getItem('authToken');

  //   if (token) {
  //     fetch('/api/auth/verify-token', {
  //       headers: { 'Authorization': `Bearer ${token}` }
  //     })
  //       .then(res => res.json())
  //       .then(data => {
  //         if (data.valid) setUser(data.user);
  //         else localStorage.removeItem('authToken');
  //       });
  //   }
  // }, []);

  useEffect(() => {
    if (!authToken) {
      setUser(null);
      return;
    }

    fetch('/api/auth/verify-token', {
      headers: { 'Authorization': `Bearer ${authToken}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.valid) {
          setUser(data.user);
          // 保存用户信息到 localStorage
          localStorage.setItem('userInfo', JSON.stringify(data.user));
        } else {
          localStorage.removeItem('authToken');
          localStorage.removeItem('userInfo');
          setAuthToken(null);
          setUser(null);
        }
      })
      .catch(error => {
        console.error('Token verification failed:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('userInfo');
        setAuthToken(null);
        setUser(null);
      });
  }, [authToken]);


  // 登录函数
  const login = (userData, token) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('userInfo', JSON.stringify(userData));
    setAuthToken(token);
    setUser(userData);
  };

  // 登出函数
  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userInfo');
    setAuthToken(null);
    setUser(null);
  };

  // 更新用户信息函数
  const updateUser = (userData) => {
    localStorage.setItem('userInfo', JSON.stringify(userData));
    setUser(userData);
  };

  return (
    <UserContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </UserContext.Provider>
  );
};
