import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import AlertMessage from '../components/AlertMessage';

import RegisterWithGoogle from '../components/RegisterWithGoogle'; // Import the new component

import GoogleAuth from '../components/GoogleAuth'; // Import the new component

import { UserContext } from '../context/UserContext';

function LoginPage() {
  const { login } = useContext(UserContext);

  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    countryCode: '+251', // Default Ethiopia
    password: '',
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [googleUser, setGoogleUser] = useState(null);
  const [isRegisteringWithGoogle, setIsRegisteringWithGoogle] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email && !formData.phone) {
      setMessage({
        type: 'error',
        text: 'Please enter either Email or Phone.',
      });
      return;
    }

    const loginData = {
      password: formData.password,
    };

    if (formData.email) {
      loginData.email = formData.email;
    }

    if (formData.phone) {
      loginData.phone = `${formData.countryCode}${formData.phone}`;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      });

      // console.log(loginData);

      const data = await response.json();

      // console.log(data.data.user);

      if (data.status === 'success') {
        login(data.data.accessToken);
        setMessage({
          type: 'success',
          text: 'Login successful! Redirecting...',
        });

        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
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
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
        <AlertMessage message={message} />
        {!isRegisteringWithGoogle ? (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                name="email"
                placeholder="Email"
                className="w-full p-2 border border-gray-300 rounded"
                onChange={handleChange}
              />

              <div className="flex">
                <select
                  name="countryCode"
                  className="p-2 border border-gray-300 rounded-l"
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
                  name="phone"
                  placeholder="Phone Number"
                  className="w-full p-2 border border-gray-300 rounded-r"
                  onChange={handleChange}
                />
              </div>

              <input
                type="password"
                name="password"
                placeholder="Password"
                className="w-full p-2 border border-gray-300 rounded"
                onChange={handleChange}
                required
              />

              <button
                type="submit"
                className="w-full bg-green-500 text-white p-2 rounded"
              >
                Login
              </button>
            </form>
            <p className="text-center text-gray-600 mt-3">
              <a
                href="/forgot-password"
                className="text-red-500 hover:underline"
              >
                Forgot your password?
              </a>
            </p>

            {googleUser ? (
              <RegisterWithGoogle googleUser={googleUser} />
            ) : (
              <GoogleAuth
                setGoogleUser={setGoogleUser}
                setIsRegisteringWithGoogle={setIsRegisteringWithGoogle}
              />
            )}
          </>
        ) : (
          <>
            {' '}
            {googleUser ? (
              <RegisterWithGoogle googleUser={googleUser} />
            ) : (
              <GoogleAuth
                setGoogleUser={setGoogleUser}
                setIsRegisteringWithGoogle={setIsRegisteringWithGoogle}
              />
            )}
          </>
        )}
        <p className="text-center text-gray-600 mt-4">
          Don&apos;t have an account?{' '}
          <a href="/register" className="text-blue-500 hover:underline">
            Register
          </a>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
