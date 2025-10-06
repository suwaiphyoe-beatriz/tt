import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import { UserContext } from "../../contexts/UserContext.jsx";

function Login() {
  const { login } = useContext(UserContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });


  // 处理谷歌登录 token
  useEffect(() => {
    // 修复：hash路由下需要从 window.location.hash 获取参数
    const hash = window.location.hash;
    const urlParams = new URLSearchParams(hash.split('?')[1] || '');
    const token = urlParams.get("token");
    const error = urlParams.get("error");
    const success = urlParams.get("success");

    console.log('URL params:', { token, error, success }); // 调试日志

    if (error) {
      console.error("Google login error:", error);
      alert("Google login failed: " + error);
      // 清理 URL
      window.history.replaceState({}, document.title, "/#/login");
      return;
    }

    if (token && success === 'google_login') {
      console.log('Processing Google token:', token); // 调试日志

      // 防止重复处理：检查 token 是否已经被处理过
      const processedTokens = JSON.parse(localStorage.getItem('processedTokens') || '[]');
      if (processedTokens.includes(token)) {
        console.log('Token already processed, skipping');
        window.history.replaceState({}, document.title, "/#/login");
        return;
      }


      (async () => {
        const success = await verifyGoogleToken(token);
        if (success) {
          // 记录已处理的 token
          processedTokens.push(token);
          localStorage.setItem('processedTokens', JSON.stringify(processedTokens.slice(-10))); // 只保留最近10个

          // alert("Google login successful!");
          navigate("/");
        } else {
          alert("Google login failed!");
        }
        // 清理 URL
        window.history.replaceState({}, document.title, "/#/login");
      })();
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (res.ok) {
        login(data.user, data.token);
        localStorage.setItem("authToken", data.token);
        navigate("/");
      } else {
        alert(data.message || "Login failed");
      }
    } catch (err) {
      console.error(err);
      alert("Network error");
    }
  };

  const verifyGoogleToken = async (token) => {
    try {
      console.log('Verifying Google token...'); // 调试日志
      const res = await fetch(
        "/api/auth/verify-google-token",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();

      if (res.ok && data.valid) {
        login(data.user, token);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Token verification error:', err);
      return false;
    }
  };

  const handleGoogleLogin = () => {
    console.log('Redirecting to Google OAuth...'); // 调试日志
    window.location.href = "/api/auth/google";
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        {/* 返回按钮 */}
        <button
          onClick={handleGoBack}
          className="flex items-center text-gray-500 hover:text-gray-700 transition duration-200 mb-4"
          aria-label="Go back"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Login</h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                placeholder="Email"
              />
            </div>

            <div>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition duration-200"
            >
              Login
            </button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or</span>
            </div>
          </div>

          <div className="mt-6">
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition duration-200"
            >
              <span>Sign in with Google</span>
            </button>
          </div>
        </div>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link
              to="/signin"
              className="font-medium text-orange-600 hover:text-orange-500 transition duration-200"
            >
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;