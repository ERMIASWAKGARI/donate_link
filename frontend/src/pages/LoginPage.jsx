import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Spin } from 'antd';
import { Eye, EyeOff } from 'lucide-react';

import Header from '../components/common/Header';
import ErrorMessage from '../components/ErrorMessage';
import GoogleAuth from '../components/GoogleAuth';
import RegisterWithGoogle from '../components/RegisterWithGoogle';
import SuccessMessage from '../components/SuccessMessage';
import { UserContext } from '../context/UserContext';
import ReactivateModal from './ReactivateModal';

function LoginPage() {
  const { login } = useContext(UserContext);
  const [reactivationRequired, setReactivationRequired] = useState(false);
  const [reactivationToken, setReactivationToken] = useState('');

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
  const [loading, setLoading] = useState(false);

  const handleReactivation = async () => {
    try {
      const response = await fetch(
        'http://localhost:5000/api/users/me/reactivate',
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reactivationToken }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Reactivation failed');
      }

      setMessage({ type: 'success', text: data.message });
      setReactivationRequired(false);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.message || 'An error occurred during reactivation',
      });
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setLoading(true);

    const loginData = { password: formData.password };

    // Validate based on selected method
    if (loginMethod === 'email') {
      if (!formData.email) {
        setMessage({ type: 'error', text: 'Please enter your email' });
        setLoading(false);
        return;
      }
      loginData.email = formData.email;
    } else {
      if (!formData.phone) {
        setMessage({ type: 'error', text: 'Please enter your phone number' });
        setLoading(false);
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
      if (!response.ok) {
        throw new Error(data.message || 'Login failed.');
      }

      // Handle specific error cases
      if (data.data?.reactivationRequired) {
        setReactivationToken(data.data.reactivationToken);
        setReactivationRequired(true);
        setMessage({
          type: 'info',
          text: data.message || 'Your account is deactivated',
        });
        setLoading(false);
        return;
      }

      // Handle validation errors or other error messages

      // Success case
      login(data.data.accessToken);
      setMessage({
        type: 'success',
        text: 'Login successful! Redirecting...',
      });

      // Redirect based on role
      const role = data.data.role;
      if (role === 'admin') {
        navigate('/admin/dashboard');
      } else if (role === 'individual_donor' || role === 'organization_donor') {
        navigate('/donor/dashboard');
      } else if (role === 'ngo') {
        navigate('/ngo/dashboard');
      } else if (role === 'volunteer') {
        navigate('/volunteer/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login Error:', error.message);
      setMessage({
        type: 'error',
        text: error.message || 'An error occurred. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm">
          <Spin size="large" />
        </div>
      )}
      <Header />
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        {reactivationRequired && (
          <ReactivateModal
            onClose={() => setReactivationRequired(false)}
            onConfirm={handleReactivation}
          />
        )}
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
            Login to Your Account
          </h2>

          {/* Display messages */}
          {message.type === 'success' && (
            <SuccessMessage message={message.text} className="mb-4" />
          )}
          {message.type === 'error' && (
            <ErrorMessage error={message.text} className="mb-4" />
          )}
          {message.type === 'info' && (
            <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded-md border border-blue-100">
              {message.text}
            </div>
          )}

          {/* Rest of your login form remains the same */}
          <div className="flex mb-6 border-b">
            <button
              className={`flex-1 py-3 font-medium text-sm ${
                loginMethod === 'email'
                  ? 'text-[#008080] border-b-2 border-[#008080]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setLoginMethod('email')}
            >
              Email Login
            </button>
            <button
              className={`flex-1 py-3 font-medium text-sm ${
                loginMethod === 'phone'
                  ? 'text-[#008080] border-b-2 border-[#008080]'
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
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
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
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
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
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
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
                aria-label={showPassword ? 'Hide password' : 'Show password'}
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
            className="w-full bg-[#008080] text-white p-3 rounded-lg font-medium transition-colors mb-4 focus:outline-none focus:ring-2 focus:ring-[#008080] focus:ring-offset-2"
          >
            Sign In
          </button>

          <div className="text-center mb-6">
            <a
              href="/forgot-password"
              className="text-sm text-[#008080] hover:underline"
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
              <span className="px-2 bg-white text-gray-500">
                Or continue with
              </span>
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
              Dont have an account?{' '}
              <a
                href="/register"
                className="font-medium text-[#008080] hover:underline"
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
