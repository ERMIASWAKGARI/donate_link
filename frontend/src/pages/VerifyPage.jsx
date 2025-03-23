/* eslint-disable no-unused-vars */
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const VerifyPage = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const phone = searchParams.get('phone');
  const [message, setMessage] = useState('');
  const [verificationType, setVerificationType] = useState('');
  const [otp, setOtp] = useState(''); // OTP state for phone verification
  const [otpSent, setOtpSent] = useState(false); // To track if OTP has been sent
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false); // To manage OTP verification process

  useEffect(() => {
    if (email) {
      setVerificationType('email');
    } else if (phone) {
      setVerificationType('phone');
    }
  }, [email, phone]);

  const resendVerification = async () => {
    try {
      const requestBody = verificationType === 'email' ? { email } : { phone };
      const response = await fetch(
        'http://localhost:5000/api/users/resend-verification',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        }
      );

      const data = await response.json();
      console.log(data); // Debugging the API response
      if (data.status === 'success') {
        setMessage(
          verificationType === 'email'
            ? 'Verification email resent. Check your inbox.'
            : 'Verification code resent. Check your messages.'
        );
        setOtpSent(true); // OTP has been sent for phone verification
      } else {
        setMessage(
          verificationType === 'email'
            ? 'Failed to resend verification email.'
            : 'Failed to resend verification code.'
        );
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    }
  };

  const verifyOtp = async () => {
    if (!otp) {
      setMessage('Please enter the OTP.');
      return;
    }

    try {
      setIsVerifyingOtp(true);
      const response = await fetch(
        'http://localhost:5000/api/users/verify-otp',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone, otp }),
        }
      );

      const data = await response.json();
      if (data.status === 'success') {
        setMessage('Phone number verified successfully!');
      } else {
        setMessage('Invalid OTP. Please try again.');
      }
    } catch (error) {
      setMessage('An error occurred while verifying the OTP.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Verify Your {verificationType === 'email' ? 'Email' : 'Phone Number'}
        </h2>
        <p className="text-center text-gray-600 mb-4">
          We have sent a{' '}
          {verificationType === 'email'
            ? 'verification email'
            : 'verification code'}{' '}
          to <strong>{verificationType === 'email' ? email : phone}</strong>.
          Please check your{' '}
          {verificationType === 'email' ? 'inbox' : 'messages'}.
        </p>

        {/* OTP input and verify button logic */}
        {verificationType === 'phone' && (
          <div className="mb-4">
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
          </div>
        )}

        {/* Resend button for both email and phone */}
        {!otpSent && (
          <button
            className="w-full bg-blue-500 text-white p-2 rounded"
            onClick={resendVerification}
          >
            Resend{' '}
            {verificationType === 'email'
              ? 'Verification Email'
              : 'Verification Code'}
          </button>
        )}

        {message && (
          <p className="text-green-500 text-center mt-2">{message}</p>
        )}
      </div>
    </div>
  );
};

export default VerifyPage;
