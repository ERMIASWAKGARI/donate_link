/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import SuccessMessage from '../components/SuccessMessage';
import ErrorMessage from '../components/ErrorMessage';

const RegisterWithGoogle = ({ googleUser, onCancel }) => {
  const navigate = useNavigate();
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!agreedToTerms) {
      setMessage({
        type: 'error',
        text: 'You must agree to the terms and conditions',
      });
      setLoading(false);
      return;
    }

    const userData = {
      ...googleUser,
      role,
    };

    try {
      const response = await fetch('http://localhost:5000/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (data.status === 'success') {
        localStorage.setItem('accessToken', data.data.accessToken);
        setMessage({ type: 'success', text: 'Registration successful!' });

        // Redirect based on role
        setTimeout(() => {
          if (data.data.role === 'admin') {
            navigate('/admin/dashboard');
          } else if (
            ['individual_donor', 'organization_donor'].includes(data.data.role)
          ) {
            navigate('/donor/dashboard');
          } else if (data.data.role === 'ngo') {
            navigate('/ngo/dashboard');
          } else if (data.data.role === 'volunteer') {
            navigate('/volunteer/dashboard');
          } else {
            navigate('/dashboard');
          }
        }, 1500);
      } else {
        setMessage({
          type: 'error',
          text: data.message || 'Registration failed',
        });
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-gray-100 rounded-xl shadow-xl w-full max-w-md overflow-hidden"
      >
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Complete Registration
            </h2>
            <button
              onClick={onCancel}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          {message.type === 'success' && (
            <SuccessMessage message={message.text} className="mb-4" />
          )}
          {message.type === 'error' && (
            <ErrorMessage error={message.text} className="mb-4" />
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-gray-700 mb-1 flex items-center">
                Your Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008080]"
              >
                <option value="">Select your role</option>
                <option value="individual_donor">Individual Donor</option>
                <option value="organization_donor">Organization Donor</option>
                <option value="volunteer">Volunteer</option>
                <option value="ngo">NGO Partner</option>
              </select>
            </div>

            {/* Terms and Conditions Checkbox */}
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="terms-google"
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-[#008080]"
                  required
                />
              </div>
              <label
                htmlFor="terms-google"
                className="ml-2 text-sm text-gray-600"
              >
                I agree to the{' '}
                <a
                  href="/terms"
                  className="text-[#008080] hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Terms and Conditions
                </a>{' '}
                and{' '}
                <a
                  href="/privacy"
                  className="text-[#008080] hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Privacy Policy
                </a>
              </label>
            </div>

            <motion.button
              type="submit"
              className={`w-full bg-[#008080] text-white p-3 rounded-lg font-medium ${
                !agreedToTerms ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              whileHover={agreedToTerms ? { scale: 1.02 } : {}}
              whileTap={agreedToTerms ? { scale: 0.98 } : {}}
              disabled={!agreedToTerms || loading}
            >
              {loading ? 'Signing Up...' : 'Sign Up'}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default RegisterWithGoogle;
