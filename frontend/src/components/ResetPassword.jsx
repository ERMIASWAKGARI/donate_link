import { Spin } from 'antd'; // Importing Spin for loading state
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import Header from './common/Header';

import ErrorMessage from '../components/ErrorMessage';
import SuccessMessage from '../components/SuccessMessage';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get('token'); // If email reset
  const rawPhone = searchParams.get('phone') || ''; // Ensure it's a string
  const phone = rawPhone.trim().startsWith('+')
    ? rawPhone.trim()
    : `+${rawPhone.trim()}`;

  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' });
      setLoading(false);
      return;
    }

    try {
      let payload, url;

      if (token) {
        payload = { password };
        url = `http://localhost:5000/api/auth/reset-password?token=${token}`;
      } else if (phone) {
        if (!otp) {
          setMessage({
            type: 'error',
            text: 'Please enter the OTP sent to your phone.',
          });

          setLoading(false);
          return;
        }
        payload = { phone, otp, password };
        url = `http://localhost:5000/api/auth/reset-password`;
      } else {
        setMessage({
          type: 'error',
          text: 'Invalid reset attempt. Please try again.',
        });
        setLoading(false);
        return;
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log(data);
      if (!res.ok) throw new Error(data.message || 'Something went wrong');

      setMessage({
        type: 'success',
        text:
          data.message ||
          'Password reset successfully! Redirecting to login...',
      });

      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.message || 'An error occurred. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResending(true);
    try {
      const res = await fetch(`http://localhost:5000/api/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();
      console.log(data);
      if (!res.ok) throw new Error(data.message || 'Failed to resend OTP');

      setMessage({
        type: 'success',
        text: data.message || 'OTP resent successfully!',
      });
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.message || 'Failed to resend OTP. Please try again.',
      });
    } finally {
      setResending(false);
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

      <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-lg mt-20">
        <h2 className="text-xl font-bold mb-4">Reset Password</h2>
        {loading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm">
            <Spin size="large" />
          </div>
        )}
        {message.type === 'success' && (
          <SuccessMessage message={message.text} className="mb-4" />
        )}
        {message.type === 'error' && (
          <ErrorMessage error={message.text} className="mb-4" />
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* If resetting via phone, show OTP input & Resend OTP button */}
          {phone && !token && (
            <>
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full p-2 border rounded"
              />
              <button
                type="button"
                className="text-[#008080] hover:underline"
                onClick={handleResendOtp}
                disabled={resending}
              >
                Didn&apos;t receive OTP? Resend
              </button>
            </>
          )}

          {/* Password fields (always shown if either token or phone is present) */}
          {(token || phone) && (
            <>
              <input
                type="password"
                placeholder="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded"
              />
              <input
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </>
          )}

          {/* Show "Didn't receive email?" button ONLY if token exists and NOT phone */}
          {token && !phone && (
            <button type="button" className="text-blue-500">
              Didn&apos;t receive email? Resend
            </button>
          )}

          {/* Submit button */}
          <button
            type="submit"
            className="w-full bg-primary text-white p-3 rounded-lg font-medium hover:bg-[#008080] transition-colors mb-4 focus:outline-none focus:ring-2 focus:ring-[#008080] focus:ring-offset-2"
            disabled={loading}
          >
            Reset Password
          </button>
        </form>
      </div>
    </>
  );
};

export default ResetPassword;
