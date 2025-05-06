/* eslint-disable no-unused-vars */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Spin } from 'antd';
import { AnimatePresence, motion } from 'framer-motion';
import { Eye, EyeOff, X } from 'lucide-react';
import {
  FaBuilding,
  FaHandsHelping,
  FaInfoCircle,
  FaUser,
  FaUsers,
} from 'react-icons/fa';
import GoogleAuth from '../components/GoogleAuth';
import RegisterWithGoogle from '../components/RegisterWithGoogle';
import Header from '../components/common/Header';
import validateForm from '../utils/validateForm';

import ErrorMessage from '../components/ErrorMessage';
import SuccessMessage from '../components/SuccessMessage';

// Card images
const cardImages = {
  individual_donor:
    'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2071&q=80',
  organization_donor:
    'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
  volunteer:
    'https://images.unsplash.com/photo-1521791055366-0d553872125f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2069&q=80',
  ngo: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
};

const EnhancedRegisterPage = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState('');
  const [loginMethod, setLoginMethod] = useState('email'); // 'email' or 'phone'
  const [formData, setFormData] = useState({
    name: '',
    organizationName: '',
    ngoName: '',
    email: '',
    phone: '',
    countryCode: '+251',
    password: '',
    confirmPassword: '',
    role: '',
    agreedToTerms: false,
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });
  const [googleUser, setGoogleUser] = useState(null);
  const [isRegisteringWithGoogle, setIsRegisteringWithGoogle] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const roles = [
    {
      id: 'individual_donor',
      title: 'Individual Donor',
      icon: <FaUser className="text-xl" />,
      color: 'bg-gray-100',
      highlight: 'hover:shadow-gray-200',
      description: 'Make personal donations to causes you care about',
      fields: ['name', 'email', 'phone', 'password', 'confirmPassword'],
    },
    {
      id: 'organization_donor',
      title: 'Organization Donor',
      icon: <FaBuilding className="text-xl" />,
      color: 'bg-gray-100',
      highlight: 'hover:shadow-gray-200',
      description: 'Corporate giving & social responsibility programs',
      fields: [
        'organizationName',
        'email',
        'phone',
        'password',
        'confirmPassword',
      ],
    },
    {
      id: 'volunteer',
      title: 'Volunteer',
      icon: <FaHandsHelping className="text-xl" />,
      color: 'bg-gray-100',
      highlight: 'hover:shadow-gray-200',
      description: 'Donate your time and skills to make a difference',
      fields: ['name', 'email', 'phone', 'password', 'confirmPassword'],
    },
    {
      id: 'ngo',
      title: 'NGO Partner',
      icon: <FaUsers className="text-xl" />,
      color: 'bg-gray-100',
      highlight: 'hover:shadow-gray-200',
      description: 'Register your nonprofit to receive support',
      fields: ['ngoName', 'email', 'phone', 'password', 'confirmPassword'],
    },
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setFormData({ ...formData, role });
  };

  const handleRoleChange = () => {
    setSelectedRole('');
    setFormData({
      name: '',
      organizationName: '',
      ngoName: '',
      email: '',
      phone: '',
      countryCode: '+251',
      password: '',
      confirmPassword: '',
      role: '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate that either email or phone is provided
    if (loginMethod === 'email' && !formData.email) {
      setErrors({ ...errors, email: 'Please enter your email' });
      setLoading(false);
      return;
    }
    if (loginMethod === 'phone' && !formData.phone) {
      setErrors({ ...errors, phone: 'Please enter your phone number' });
      setLoading(false);
      return;
    }

    if (!validateForm(formData, selectedRole, setErrors)) {
      setLoading(false);
      return;
    }

    let filteredData = {
      role: selectedRole,
      password: formData.password,
    };

    // Only include the selected method
    if (loginMethod === 'email') {
      filteredData.email = formData.email;
    } else {
      filteredData.phone = `${formData.countryCode}${formData.phone}`;
    }

    if (selectedRole === 'individual_donor' || selectedRole === 'volunteer') {
      filteredData.name = formData.name;
    } else if (selectedRole === 'organization_donor') {
      filteredData.name = formData.organizationName;
    } else if (selectedRole === 'ngo') {
      filteredData.name = formData.ngoName;
    }

    try {
      const response = await fetch('http://localhost:5000/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filteredData),
      });

      const data = await response.json();

      if (data.status === 'success') {
        setMessage({
          type: 'success',
          text: `Registration successful! Please verify your ${data.data.verificationType}.`,
        });

        setLoading(false);

        setTimeout(() => {
          setMessage({ type: '', text: '' });
          if (data.data.verificationType === 'email') {
            navigate(`/verify-email?email=${data.data.email}`);
          } else if (data.data.verificationType === 'phone') {
            navigate(`/verify-otp?phone=${data.data.phone}`);
          }
        }, 3000);
      } else {
        setMessage({
          type: 'error',
          text: `Registration Failed: ${data.message}`,
        });
        setLoading(false);
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'An error occurred. Please try again.',
      });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } finally {
      setLoading(false);
    }
  };

  const currentRole = roles.find((role) => role.id === selectedRole);

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="w-full max-w-6xl">
          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold text-gray-800 mb-3">
              Join Our Movement
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Select how you&apos;d like to participate in creating positive
              change
            </p>
          </motion.div>

          {/* Role Selection Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {roles.map((role) => (
              <motion.div
                key={role.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="relative"
              >
                <motion.div
                  className={`h-full rounded-2xl overflow-hidden shadow-lg cursor-pointer transition-all duration-300 hover:shadow-xl ${role.highlight}`}
                  onClick={() => handleRoleSelect(role.id)}
                  whileHover={{ y: -10, scale: 1.03 }}
                >
                  <div className="h-full flex flex-col">
                    <div className="h-40 overflow-hidden">
                      <img
                        src={cardImages[role.id]}
                        alt={role.title}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                      />
                    </div>
                    <div
                      className={`${role.color} p-6 text-gray-800 flex-1 flex flex-col`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="bg-gray-200 p-3 rounded-full">
                          {role.icon}
                        </div>
                        <FaInfoCircle className="text-gray-600 opacity-80 hover:opacity-100 transition" />
                      </div>
                      <div className="mt-auto">
                        <h3 className="text-xl font-bold">{role.title}</h3>
                        <p className="text-gray-600 mt-2 text-sm">
                          {role.description}
                        </p>
                        <motion.button
                          className="mt-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-all"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Select
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>

          {/* Registration Modal */}
          <AnimatePresence>
            {selectedRole && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 backdrop-blur-sm bg-black/30 z-50 flex items-center justify-center p-4"
              >
                <motion.div
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-auto overflow-y-auto max-h-[90vh]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-8">
                    <div className="flex justify-between items-start mb-6 relative">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-800">
                          Register as {currentRole?.title}
                        </h2>
                        <p className="text-gray-600">
                          {currentRole?.description}
                        </p>
                      </div>
                      <button
                        onClick={handleRoleChange}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X size={24} />
                      </button>
                    </div>
                    {loading && (
                      <div className="absolute inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
                        <Spin size="large" />
                      </div>
                    )}
                    {message.type === 'success' && (
                      <SuccessMessage message={message.text} className="mb-4" />
                    )}
                    {message.type === 'error' && (
                      <ErrorMessage error={message.text} className="mb-4" />
                    )}
                    {message.type === 'info' && (
                      <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded-md border border-blue-100">
                        {message.text}
                      </div>
                    )}

                    {isRegisteringWithGoogle ? (
                      <RegisterWithGoogle
                        googleUser={googleUser}
                        onCancel={() => setIsRegisteringWithGoogle(false)}
                      />
                    ) : (
                      <form onSubmit={handleSubmit} className="space-y-4">
                        {currentRole?.fields.includes('name') && (
                          <div>
                            <label className="block text-gray-700 mb-1">
                              Full Name
                            </label>
                            <input
                              type="text"
                              name="name"
                              value={formData.name}
                              onChange={handleChange}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008080]"
                              required
                            />
                            {errors.name && (
                              <p className="text-red-500 text-sm mt-1">
                                {errors.name}
                              </p>
                            )}
                          </div>
                        )}

                        {currentRole?.fields.includes('organizationName') && (
                          <div>
                            <label className="block text-gray-700 mb-1">
                              Organization Name
                            </label>
                            <input
                              type="text"
                              name="organizationName"
                              value={formData.organizationName}
                              onChange={handleChange}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008080]"
                              required
                            />
                          </div>
                        )}

                        {currentRole?.fields.includes('ngoName') && (
                          <div>
                            <label className="block text-gray-700 mb-1">
                              NGO Name
                            </label>
                            <input
                              type="text"
                              name="ngoName"
                              value={formData.ngoName}
                              onChange={handleChange}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008080]"
                              required
                            />
                          </div>
                        )}

                        {/* Login Method Toggle */}
                        <div className="flex mb-4 border-b">
                          <button
                            type="button"
                            className={`flex-1 py-2 font-medium text-sm ${
                              loginMethod === 'email'
                                ? 'text-[#008080] border-b-2 border-[#008080]'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                            onClick={() => setLoginMethod('email')}
                          >
                            Use Email
                          </button>
                          <button
                            type="button"
                            className={`flex-1 py-2 font-medium text-sm ${
                              loginMethod === 'phone'
                                ? 'text-[#008080] border-b-2 border-[#008080]'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                            onClick={() => setLoginMethod('phone')}
                          >
                            Use Phone
                          </button>
                        </div>

                        {/* Email or Phone Input */}
                        {loginMethod === 'email' ? (
                          <div>
                            <label className="block text-gray-700 mb-1">
                              Email Address
                            </label>
                            <input
                              type="email"
                              name="email"
                              placeholder="your@email.com"
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008080]"
                              onChange={handleChange}
                              value={formData.email}
                            />
                            {errors.email && (
                              <p className="text-red-500 text-sm mt-1">
                                {errors.email}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div>
                            <label className="block text-gray-700 mb-1">
                              Phone Number
                            </label>
                            <div className="flex">
                              <select
                                name="countryCode"
                                className="p-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-[#008080]"
                                value={formData.countryCode}
                                onChange={handleChange}
                              >
                                <option value="+251">🇪🇹 +251</option>
                                <option value="+1">🇺🇸 +1</option>
                                <option value="+44">🇬🇧 +44</option>
                                <option value="+91">🇮🇳 +91</option>
                              </select>
                              <input
                                type="tel"
                                name="phone"
                                placeholder="1234567890"
                                className="flex-1 p-3 border-t border-b border-r border-gray-300 rounded-r-lg focus:ring-2 focus:ring-[#008080]"
                                onChange={handleChange}
                                value={formData.phone}
                              />
                            </div>
                            {errors.phone && (
                              <p className="text-red-500 text-sm mt-1">
                                {errors.phone}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Password Field */}
                        <div>
                          <label className="block text-gray-700 mb-1">
                            Password
                          </label>
                          <div className="relative">
                            <input
                              type={showPassword ? 'text' : 'password'}
                              name="password"
                              placeholder="••••••••"
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008080] pr-10"
                              onChange={handleChange}
                              value={formData.password}
                              required
                            />
                            <button
                              type="button"
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                              onClick={() => setShowPassword(!showPassword)}
                              aria-label={
                                showPassword ? 'Hide password' : 'Show password'
                              }
                            >
                              {showPassword ? (
                                <EyeOff size={18} className="text-gray-400" />
                              ) : (
                                <Eye size={18} className="text-gray-400" />
                              )}
                            </button>
                          </div>
                          {errors.password && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.password}
                            </p>
                          )}
                        </div>

                        {/* Confirm Password Field */}
                        <div>
                          <label className="block text-gray-700 mb-1">
                            Confirm Password
                          </label>
                          <div className="relative">
                            <input
                              type={showConfirmPassword ? 'text' : 'password'}
                              name="confirmPassword"
                              placeholder="••••••••"
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008080] pr-10"
                              onChange={handleChange}
                              value={formData.confirmPassword}
                              required
                            />
                            <button
                              type="button"
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                              onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                              }
                              aria-label={
                                showConfirmPassword
                                  ? 'Hide password'
                                  : 'Show password'
                              }
                            >
                              {showConfirmPassword ? (
                                <EyeOff size={18} className="text-gray-400" />
                              ) : (
                                <Eye size={18} className="text-gray-400" />
                              )}
                            </button>
                          </div>
                          {errors.confirmPassword && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.confirmPassword}
                            </p>
                          )}
                        </div>

                        <div className="flex items-start mb-4">
                          <div className="flex items-center h-5">
                            <input
                              id="terms"
                              name="agreedToTerms"
                              type="checkbox"
                              checked={formData.agreedToTerms}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  agreedToTerms: e.target.checked,
                                })
                              }
                              className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-[#008080]"
                              required
                            />
                          </div>
                          <label
                            htmlFor="terms"
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
                        {errors.agreedToTerms && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.agreedToTerms}
                          </p>
                        )}

                        <motion.button
                          type="submit"
                          className={`w-full bg-[#008080] text-white p-3 rounded-lg font-medium transition-colors mb-4 focus:outline-none focus:ring-2 focus:ring-[#008080] focus:ring-offset-2 ${
                            !formData.agreedToTerms
                              ? 'opacity-50 cursor-not-allowed'
                              : ''
                          }`}
                          whileHover={
                            formData.agreedToTerms ? { scale: 1.02 } : {}
                          }
                          whileTap={
                            formData.agreedToTerms ? { scale: 0.98 } : {}
                          }
                          disabled={!formData.agreedToTerms || loading}
                        >
                          Sign Up
                        </motion.button>
                      </form>
                    )}

                    <div className="mt-6 text-center">
                      <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-2 bg-white text-gray-500">
                            Or register with
                          </span>
                        </div>
                      </div>

                      {googleUser ? (
                        <RegisterWithGoogle googleUser={googleUser} />
                      ) : (
                        <GoogleAuth
                          setGoogleUser={setGoogleUser}
                          setIsRegisteringWithGoogle={
                            setIsRegisteringWithGoogle
                          }
                        />
                      )}
                    </div>

                    <div className="text-center mt-6 text-gray-600">
                      <p className="text-sm">
                        Already have an account?{' '}
                        <a
                          href="/login"
                          className="text-[#008080] hover:underline font-medium"
                        >
                          Log in
                        </a>
                      </p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
};

export default EnhancedRegisterPage;
