import { GoogleLogin } from '@react-oauth/google';
import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { UserContext } from '../context/UserContext'; // Import the UserContext

import AlertMessage from './AlertMessage';

// eslint-disable-next-line react/prop-types
function GoogleAuth({ setGoogleUser, setIsRegisteringWithGoogle }) {
  const { login } = useContext(UserContext); // Access the login function from UserContext
  const navigate = useNavigate();

  const [message, setMessage] = useState({ type: '', text: '' });

  const handleGoogleSignInSuccess = async (credentialResponse) => {
    const idToken = credentialResponse.credential;

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      const data = await response.json();
      console.log('Backend Response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Google sign-in failed.');
      }

      if (data.data.accountRecoveryTokenRequired) {
        setMessage({
          type: 'error',
          text: `${data.message}`,
        });
        localStorage.setItem(
          'accountRecoveryToken',
          data.data.accountRecoveryToken
        );
        return;
      }

      if (data.data.requiresRegistration) {
        setIsRegisteringWithGoogle(true);
        setGoogleUser(data.data);
      } else {
        console.log('User Data:', data.data.user.role);
        login(data.data.accessToken);
        setMessage({
          type: 'success',
          text: 'Google Sign-in Successful!',
        });
        if (data.data.user.role === 'admin') {
          navigate('/admin/dashboard');
        } else if (
          data.data.user.role === 'individual_donor' ||
          data.data.user.role === 'organization_donor'
        ) {
          navigate('/donor/dashboard');
        } else if (data.data.user.role === 'ngo') {
          navigate('/ngo/dashboard');
        } else if (data.data.user.role === 'volunteer') {
          navigate('/volunteer/dashboard');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (error) {
      console.error('Error authenticating with backend:', error.message);
      setMessage({
        type: 'error',
        text: 'Google Sign-in Failed: ' + error.message,
      });
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 mt-5">
      <AlertMessage message={message} />

      <GoogleLogin
        onSuccess={handleGoogleSignInSuccess}
        onError={() => console.log('Login Failed')}
        className="w-full bg-blue-500 text-white py-3 rounded-lg shadow-md hover:bg-blue-600 transition duration-300"
      />
    </div>
  );
}

export default GoogleAuth;
