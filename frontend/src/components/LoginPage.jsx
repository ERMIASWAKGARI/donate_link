import { GoogleLogin } from '@react-oauth/google';

import { useState } from 'react';
import RegisterWithGoogle from './RegisterWithGoogle'; // Import the new component

function LoginPage() {
  const [googleUser, setGoogleUser] = useState(null);

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
    <div className="min-h-screen flex items-center justify-center bg-gray-200">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-semibold mb-6 text-center text-gray-800">
          Login
        </h2>

        {/* Show Google Register Form If User Needs More Info */}
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
