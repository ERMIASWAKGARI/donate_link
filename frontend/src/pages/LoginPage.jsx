import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { GoogleLogin } from '@react-oauth/google';
import AlertMessage from '../components/AlertMessage';

import RegisterWithGoogle from '../components/RegisterWithGoogle'; // Import the new component

function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    countryCode: '+251', // Default Ethiopia
    password: '',
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [googleUser, setGoogleUser] = useState(null);

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

      console.log(loginData);

      const data = await response.json();

      console.log(data);

      if (data.status === 'success') {
        localStorage.setItem('accessToken', data.data.accessToken);
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

  const handleGoogleSignInSuccess = async (credentialResponse) => {
    const idToken = credentialResponse.credential;

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        // 🔹 If response is not OK, show error message
        throw new Error(data.message || 'Google sign-in failed.');
      }

      console.log('Backend Response:', data);

      if (data.data.accountRecoveryTokenRequired) {
        // 🔹 Show an alert to the user that their account was deleted
        alert(`${data.message}`);

        // ✅ Handle account recovery (e.g., store token & show recovery UI)
        localStorage.setItem(
          'accountRecoveryToken',
          data.data.accountRecoveryToken
        );

        return;
      }

      if (data.data.requiresRegistration) {
        // 🔹 If user needs to register, show the registration form
        setGoogleUser(data.data);
      } else {
        // 🔹 Successful login, store token, and redirect
        localStorage.setItem('accessToken', data.data.accessToken);
        alert('Google Sign-in Successful!');
        window.location.href = '/dashboard';
      }
    } catch (error) {
      console.error('Error authenticating with backend:', error.message);
      alert('Google Sign-in Failed: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>

        <AlertMessage message={message} />

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

        {googleUser ? (
          <RegisterWithGoogle googleUser={googleUser} />
        ) : (
          <div className="flex flex-col items-center space-y-4">
            <GoogleLogin
              onSuccess={handleGoogleSignInSuccess}
              onError={() => console.log('Login Failed')}
              className="w-full bg-blue-500 text-white py-3 rounded-lg shadow-md hover:bg-blue-600 transition duration-300"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default LoginPage;
