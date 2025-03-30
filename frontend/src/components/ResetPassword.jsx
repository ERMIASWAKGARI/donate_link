import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

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
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
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
          setError('Please enter the OTP sent to your phone.');
          setLoading(false);
          return;
        }
        payload = { phone, otp, password };
        url = `http://localhost:5000/api/auth/reset-password`;
      } else {
        setError('Invalid reset attempt.');
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

      setMessage('Password reset successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.message);
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

      setMessage('OTP resent successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-bold mb-4">Reset Password</h2>
      {message && <p className="text-green-600">{message}</p>}
      {error && <p className="text-red-600">{error}</p>}

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
              className="text-blue-500"
              onClick={handleResendOtp}
              disabled={resending}
            >
              {resending ? 'Resending...' : "Didn't receive OTP? Resend"}
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
          className="w-full bg-green-500 text-white p-2 rounded"
          disabled={loading}
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
