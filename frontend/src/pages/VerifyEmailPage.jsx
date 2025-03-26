/* eslint-disable no-unused-vars */
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AlertMessage from '../components/AlertMessage';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get('email');
  const token = searchParams.get('token');

  const [message, setMessage] = useState({ type: '', text: '' });
  const [isVerifying, setIsVerifying] = useState(false);

  const hasVerified = useRef(false); // 🛑 Prevent duplicate requests

  useEffect(() => {
    if (token && !hasVerified.current) {
      hasVerified.current = true; // ✅ Mark as verified to prevent second request
      verifyEmail();
    }
  }, [token]);

  // 🔹 Verify Email if Token is Present
  const verifyEmail = async () => {
    setIsVerifying(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/auth/verify-email?token=${token}`,
        { method: 'GET' }
      );

      const data = await response.json();
      if (data.status === 'success') {
        setMessage({
          type: 'success',
          text: 'Email verified successfully! Redirecting to login...',
        });

        setTimeout(() => navigate('/login'), 3000);
      } else {
        setMessage({
          type: 'error',
          text: data.message || 'Email verification failed.',
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'An error occurred while verifying your email.',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  // 🔹 Resend Verification Email
  const resendVerification = async () => {
    try {
      const response = await fetch(
        'http://localhost:5000/api/users/resend-verification',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();
      if (data.status === 'success') {
        setMessage({
          type: 'success',
          text: 'Verification email resent. Check your inbox.',
        });
      } else {
        setMessage({
          type: 'error',
          text: data.message || 'Failed to resend verification email.',
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'An error occurred. Please try again.',
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-4 text-center">
          {isVerifying ? 'Verifying Email...' : 'Verify Your Email'}
        </h2>

        <AlertMessage message={message} />

        {!token && email && (
          <>
            <p className="text-center text-gray-600 mb-4">
              We have sent a verification email to <strong>{email}</strong>.
              Please check your inbox.
            </p>
            <button
              className="w-full bg-blue-500 text-white p-2 rounded"
              onClick={resendVerification}
            >
              Resend Verification Email
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;
