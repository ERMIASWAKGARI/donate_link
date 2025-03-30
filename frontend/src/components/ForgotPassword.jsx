import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './common/Header';

const ForgotPassword = () => {
  const [method, setMethod] = useState('email'); // "email" or "phone"
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [resending, setResending] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    let payload;
    if (method === 'email') {
      if (!email) {
        setError('Please enter your email.');
        setLoading(false);
        return;
      }
      payload = { email };
    } else if (method === 'phone') {
      if (!phone) {
        setError('Please enter your phone number.');
        setLoading(false);
        return;
      }
      payload = { phone };
    }

    try {
      const res = await fetch(
        'http://localhost:5000/api/auth/forgot-password',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Something went wrong');

      setMessage(data.message);

      // Redirect to reset page for phone users
      if (method === 'phone') {
        navigate(`/reset-password?phone=${phone}`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <Header/>
    <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-bold mb-4">Forgot Password</h2>
      {message && <p className="text-green-600">{message}</p>}
      {error && <p className="text-red-600">{error}</p>}

      <div className="mb-4">
        <label className="mr-4">Reset via:</label>
        <button
          className={`px-4 py-2 rounded ${
            method === 'email' ? 'bg-blue-500 text-white' : 'bg-gray-300'
          }`}
          onClick={() => setMethod('email')}
        >
          Email
        </button>
        <button
          className={`px-4 py-2 ml-2 rounded ${
            method === 'phone' ? 'bg-blue-500 text-white' : 'bg-gray-300'
          }`}
          onClick={() => setMethod('phone')}
        >
          Phone
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {method === 'email' && (
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
          />
        )}
        {method === 'phone' && (
          <input
            type="tel"
            placeholder="Enter your phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full p-2 border rounded"
          />
        )}
        <button
          type="submit"
          className="w-full bg-red-500 text-white p-2 rounded hover:bg-red-600"
          disabled={loading}
        >
          {loading ? 'Sending...' : 'Send Reset'}
        </button>
      </form>
    </div>
    </>
    
  );
};

export default ForgotPassword;
