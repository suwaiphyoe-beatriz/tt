import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext';

const UserSettings = () => {
  const { user, updateUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: user?.username || '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // 基本的前端验证
    if (!formData.username.trim()) {
      alert('Username is required');
      setLoading(false);
      return;
    }

    if (formData.username.trim().length < 3) {
      alert('Username must be at least 3 characters long');
      setLoading(false);
      return;
    }

    if (formData.password && formData.password.length < 6) {
      alert('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const updateData = {
        username: formData.username
      };

      // Only include password if it's provided
      if (formData.password.trim()) {
        updateData.password = formData.password;
      }

      const response = await fetch('/api/auth/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      const data = await response.json();

      if (response.ok) {
        updateUser(data.user);
        navigate(-1); // 成功后直接返回上一页
      } else {
        alert(data.message || 'Failed to update profile'); // 失败时使用alert
      }
    } catch (error) {
      console.error('Update profile error:', error);
      alert('An error occurred while updating profile'); // 错误时使用alert
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(-1); // Go back to previous page
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
        <p className="text-center text-gray-600">Please log in to access your settings.</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">User Settings</h2>
        <p className="text-gray-600">Update your account information</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email - Read only */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={user.email}
            disabled
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
        </div>

        {/* Username */}
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
            Username
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="Enter your username"
          />
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            New Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="Enter new password (leave blank to keep current)"
          />
          <p className="text-xs text-gray-500 mt-1">Leave blank to keep current password</p>
        </div>

        {/* Buttons */}
        <div className="flex space-x-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-md font-medium transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Updating...' : 'Update Profile'}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-md font-medium transition duration-200"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserSettings;