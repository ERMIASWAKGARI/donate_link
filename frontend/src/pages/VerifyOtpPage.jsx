/* eslint-disable no-unused-vars */
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { Spin } from 'antd';

import ErrorMessage from '../components/ErrorMessage';
import SuccessMessage from '../components/SuccessMessage';

const VerifyOtpPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const rawPhone = searchParams.get('phone').trim();
  const phone = rawPhone.startsWith('+') ? rawPhone : `+${rawPhone}`;

  const [message, setMessage] = useState({ type: '', text: '' });
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  const [loading, setLoading] = useState(false);
  // 🔹 Verify OTP
  const verifyOtp = async () => {
    if (!otp) {
      setMessage({ type: 'error', text: 'Please enter the OTP.' });
      return;
    }

    setLoading(true);
    setIsVerifyingOtp(true);
    try {
      const response = await fetch(
        'http://localhost:5000/api/auth/verify-otp',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone, otp }),
        }
      );

      console.log(phone, otp);
      const data = await response.json();
      if (data.status === 'success') {
        setMessage({
          type: 'success',
          text: 'Phone number verified successfully! Redirecting to login...',
        });

        setLoading(false);

        setTimeout(() => navigate('/login'), 3000);
      } else {
        setMessage({ type: 'error', text: 'Invalid OTP. Please try again.' });
        setLoading(false);
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'An error occurred while verifying the OTP.',
      });
    } finally {
      setLoading(false);
      setIsVerifyingOtp(false);
    }
  };

  // 🔹 Resend OTP
  const resendOtp = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        'http://localhost:5000/api/auth/resend-otp',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone }),
        }
      );

      const data = await response.json();
      console.log(data);
      if (data.status === 'success') {
        setMessage({
          type: 'success',
          text: 'OTP resent. Check your messages.',
        });
        setLoading(false);
        setOtpSent(true);
      } else {
        setMessage({
          type: 'error',
          text: data.message || 'Failed to resend OTP.',
        });
        setLoading(false);
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'An error occurred. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Verify Your Phone Number
        </h2>
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
        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded mb-4"
        />

        <button
          className="w-full bg-green-500 text-white p-2 rounded"
          onClick={verifyOtp}
          disabled={isVerifyingOtp}
        >
          {isVerifyingOtp ? 'Verifying OTP...' : 'Verify OTP'}
        </button>

        {!otpSent && (
          <button
            className="w-full bg-blue-500 text-white p-2 rounded mt-2"
            onClick={resendOtp}
          >
            Resend OTP
          </button>
        )}
      </div>
    </div>
  );
};

export default VerifyOtpPage;
