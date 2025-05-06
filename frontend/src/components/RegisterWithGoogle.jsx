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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

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
        className="bg-gray-100  rounded-xl shadow-xl w-full max-w-md overflow-hidden"
      >
        <div className="p-8">
          <div className="flex justify-center items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Complete Registration
            </h2>
          </div>
          {message.type === 'success' && (
            <SuccessMessage message={message.text} className="mb-4" />
          )}
          {message.type === 'error' && (
            <ErrorMessage error={message.text} className="mb-4" />
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Selection (Required) */}
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

            <motion.button
              type="submit"
              className="w-full bg-[#008080] text-white p-3 rounded-lg font-medium disabled:opacity-50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Sign Up'}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default RegisterWithGoogle;
