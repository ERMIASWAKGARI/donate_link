/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AlertMessage from '../components/AlertMessage';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [email, setEmail] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [loading, setLoading] = useState(false);

  const hasVerified = useRef(false); // 🛑 Prevent duplicate requests

  useEffect(() => {
    if (token && !hasVerified.current) {
      hasVerified.current = true; // ✅ Mark as verified to prevent duplicate request
      verifyEmail();
    }
  }, [token]);

  // 🔹 Verify Email if Token is Present
  const verifyEmail = async () => {
    setLoading(true);
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
        setLoading(false);

        setTimeout(() => navigate('/login'), 3000);
      } else {
        setMessage({
          type: 'error',
          text: data.message || 'Email verification failed.',
        });
        setLoading(false);
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'An error occurred while verifying your email.',
      });
    } finally {
      setLoading(false);
      setIsVerifying(false);
    }
  };

  // 🔹 Resend Verification Email
  const resendVerification = async () => {
    if (!email) {
      setMessage({ type: 'error', text: 'Please enter your email.' });
      return;
    }

    setIsResending(true);
    try {
      const response = await fetch(
        'http://localhost:5000/api/auth/resend-verification-email',
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
        setShowEmailInput(false); // Hide email input after resending
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
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-4 text-center">
          {isVerifying ? 'Verifying Email...' : 'Verify Your Email'}
        </h2>

        <AlertMessage message={message} />

        {/* If the token is NOT provided, show email verification instructions */}
        {!token && !showEmailInput && (
          <>
            <p className="text-center text-gray-600 mb-4">
              We have sent a verification email to your inbox.
              <br />
              Please check your email and follow the instructions.
            </p>
            <button
              className="w-full bg-blue-500 text-white p-2 rounded"
              onClick={() => setShowEmailInput(true)} // Show email input on click
            >
              Didn&apos;t receive the verification email?
            </button>
          </>
        )}

        {/* Show email input for resending verification email */}
        {showEmailInput && (
          <>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full p-2 border border-gray-300 rounded mt-4"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              className="w-full bg-green-500 text-white p-2 rounded mt-2"
              onClick={resendVerification}
              disabled={isResending}
            >
              {isResending ? 'Resending...' : 'Resend Verification Email'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;
