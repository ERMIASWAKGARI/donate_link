import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import AlertMessage from '../components/AlertMessage';
import RegisterWithGoogle from '../components/RegisterWithGoogle';
import GoogleAuth from '../components/GoogleAuth';
import { UserContext } from '../context/UserContext';
import Header from '../components/common/Header';

function LoginPage() {
  const { login } = useContext(UserContext);
  const navigate = useNavigate();
  
  // State management
  const [loginMethod, setLoginMethod] = useState('email'); // 'email' or 'phone'
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    countryCode: '+251',
    password: '',
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [googleUser, setGoogleUser] = useState(null);
  const [isRegisteringWithGoogle, setIsRegisteringWithGoogle] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const loginData = { password: formData.password };

    // Validate based on selected method
    if (loginMethod === 'email') {
      if (!formData.email) {
        setMessage({ type: 'error', text: 'Please enter your email' });
        return;
      }
      loginData.email = formData.email;
    } else {
      if (!formData.phone) {
        setMessage({ type: 'error', text: 'Please enter your phone number' });
        return;
      }
      loginData.phone = `${formData.countryCode}${formData.phone}`;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (data.status === 'success') {
        login(data.data.accessToken);
        setMessage({
          type: 'success',
          text: 'Login successful! Redirecting...',
        });
        setTimeout(() => navigate('/dashboard'), 2000);
      } else {
        setMessage({ type: 'error', text: `Login Failed: ${data.message}` });
      }
    } catch (error) {
      console.error('Login Error:', error);
      setMessage({
        type: 'error',
        text: 'An error occurred. Please try again.',
      });
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Login to Your Account</h2>
          <AlertMessage message={message} />

          {/* Login Method Toggle */}
          <div className="flex mb-6 border-b">
            <button
              className={`flex-1 py-3 font-medium text-sm ${
                loginMethod === 'email' 
                  ? 'text-green-600 border-b-2 border-green-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setLoginMethod('email')}
            >
              Email Login
            </button>
            <button
              className={`flex-1 py-3 font-medium text-sm ${
                loginMethod === 'phone' 
                  ? 'text-green-600 border-b-2 border-green-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setLoginMethod('phone')}
            >
              Phone Login
            </button>
          </div>

          {/* Email or Phone Input */}
          {loginMethod === 'email' ? (
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="your@email.com"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                onChange={handleChange}
                value={formData.email}
              />
            </div>
          ) : (
            <div className="mb-4">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <div className="flex">
                <select
                  name="countryCode"
                  className="p-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={formData.countryCode}
                  onChange={handleChange}
                >
                  <option value="+251">🇪🇹 +251</option>
                  <option value="+1">🇺🇸 +1</option>
                  <option value="+44">🇬🇧 +44</option>
                  <option value="+91">🇮🇳 +91</option>
                </select>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  placeholder="1234567890"
                  className="flex-1 p-3 border-t border-b border-r border-gray-300 rounded-r-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  onChange={handleChange}
                  value={formData.phone}
                />
              </div>
            </div>
          )}

          {/* Password Field */}
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                placeholder="••••••••"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent pr-10"
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff size={18} className="text-gray-400" />
                ) : (
                  <Eye size={18} className="text-gray-400" />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            onClick={handleSubmit}
            className="w-full bg-green-600 text-white p-3 rounded-lg font-medium hover:bg-green-700 transition-colors mb-4 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Sign In
          </button>

          {/* Forgot Password */}
          <div className="text-center mb-6">
            <a 
              href="/forgot-password" 
              className="text-sm text-green-600 hover:text-green-800 hover:underline"
            >
              Forgot your password?
            </a>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          {/* Google Auth */}
          {!isRegisteringWithGoogle ? (
            googleUser ? (
              <RegisterWithGoogle googleUser={googleUser} />
            ) : (
              <GoogleAuth
                setGoogleUser={setGoogleUser}
                setIsRegisteringWithGoogle={setIsRegisteringWithGoogle}
              />
            )
          ) : (
            <RegisterWithGoogle googleUser={googleUser} />
          )}

          {/* Register Link */}
          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <a 
                href="/register" 
                className="font-medium text-green-600 hover:text-green-800 hover:underline"
              >
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default LoginPage;