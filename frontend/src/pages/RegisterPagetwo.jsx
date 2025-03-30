import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaBuilding, FaHandsHelping, FaUsers, FaInfoCircle, FaArrowLeft } from 'react-icons/fa';
import AlertMessage from '../components/AlertMessage';
import validateForm from '../utils/validateForm';
import GoogleAuth from '../components/GoogleAuth';
import RegisterWithGoogle from '../components/RegisterWithGoogle';
import Header from '../components/common/Header';

// Card images
const cardImages = {
  individual_donor: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2071&q=80',
  organization_donor: 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
  volunteer: 'https://images.unsplash.com/photo-1521791055366-0d553872125f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2069&q=80',
  ngo: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
};

const EnhancedRegisterPage = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState('');
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
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });
  const [googleUser, setGoogleUser] = useState(null);
  const [isRegisteringWithGoogle, setIsRegisteringWithGoogle] = useState(false);

  const roles = [
    {
      id: 'individual_donor',
      title: 'Individual Donor',
      icon: <FaUser className="text-xl" />,
      color: 'from-blue-500 to-blue-600',
      highlight: 'hover:shadow-blue-200',
      description: 'Make personal donations to causes you care about',
      fields: ['name', 'email', 'phone', 'password', 'confirmPassword']
    },
    {
      id: 'organization_donor',
      title: 'Organization Donor',
      icon: <FaBuilding className="text-xl" />,
      color: 'from-purple-500 to-purple-600',
      highlight: 'hover:shadow-purple-200',
      description: 'Corporate giving & social responsibility programs',
      fields: ['organizationName', 'email', 'phone', 'password', 'confirmPassword']
    },
    {
      id: 'volunteer',
      title: 'Volunteer',
      icon: <FaHandsHelping className="text-xl" />,
      color: 'from-green-500 to-green-600',
      highlight: 'hover:shadow-green-200',
      description: 'Donate your time and skills to make a difference',
      fields: ['name', 'email', 'phone', 'password', 'confirmPassword']
    },
    {
      id: 'ngo',
      title: 'NGO Partner',
      icon: <FaUsers className="text-xl" />,
      color: 'from-orange-500 to-orange-600',
      highlight: 'hover:shadow-orange-200',
      description: 'Register your nonprofit to receive support',
      fields: ['ngoName', 'email', 'phone', 'password', 'confirmPassword']
    }
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
    if (!validateForm(formData, selectedRole, setErrors)) return;

    let filteredData = {
      role: selectedRole,
      password: formData.password,
    };

    if (formData.email) filteredData.email = formData.email;
    if (formData.phone) filteredData.phone = `${formData.countryCode}${formData.phone}`;

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
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'An error occurred. Please try again.',
      });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  const currentRole = roles.find(role => role.id === selectedRole);

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="w-full max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold text-gray-800 mb-3">
              {!selectedRole ? 'Join Our Movement' : `Register as ${currentRole?.title}`}
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {!selectedRole 
                ? 'Select how you\'d like to participate in creating positive change'
                : currentRole?.description}
            </p>
            <div className="w-24 h-1.5 bg-gradient-to-r from-green-400 to-blue-500 rounded-full mx-auto mt-4"></div>
          </motion.div>

          <AlertMessage message={message} />

          {!selectedRole ? (
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
                    <div className="bg-yellow-500 h-full flex flex-col">
                      <div className="h-40 overflow-hidden">
                        <img 
                          src={cardImages[role.id]} 
                          alt={role.title}
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                        />
                      </div>
                      <div className={`bg-gradient-to-r ${role.color} p-6 text-white flex-1 flex flex-col`}>
                        <div className="flex items-center justify-between mb-4">
                          <div className="bg-white bg-opacity-20 p-3 rounded-full">
                            {role.icon}
                          </div>
                          <FaInfoCircle className="text-white opacity-80 hover:opacity-100 transition" />
                        </div>
                        <div className="mt-auto">
                          <h3 className="text-xl font-bold">{role.title}</h3>
                          <p className="text-white text-opacity-90 mt-2 text-sm">{role.description}</p>
                          <motion.button
                            className="mt-4 bg-yellow-500 bg-opacity-20 hover:bg-opacity-30 text-white font-medium py-2 px-21 rounded-lg transition-all"
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
          ) : (
            <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-3xl shadow-2xl p-8">
              {!isRegisteringWithGoogle ? (
                <>
                  <button
                    onClick={handleRoleChange}
                    className="flex items-center text-gray-600 hover:text-gray-800 mb-6"
                  >
                    <FaArrowLeft className="mr-2" />
                    Back to role selection
                  </button>

                  <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
                    {currentRole?.fields.includes('name') && (
                      <div>
                        <label className="block text-gray-700 mb-2">Full Name</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          required
                        />
                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                      </div>
                    )}

                    {currentRole?.fields.includes('organizationName') && (
                      <div>
                        <label className="block text-gray-700 mb-2">Organization Name</label>
                        <input
                          type="text"
                          name="organizationName"
                          value={formData.organizationName}
                          onChange={handleChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          required
                        />
                      </div>
                    )}

                    {currentRole?.fields.includes('ngoName') && (
                      <div>
                        <label className="block text-gray-700 mb-2">NGO Name</label>
                        <input
                          type="text"
                          name="ngoName"
                          value={formData.ngoName}
                          onChange={handleChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                          required
                        />
                      </div>
                    )}

                    {currentRole?.fields.includes('email') && (
                      <div>
                        <label className="block text-gray-700 mb-2">Email</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                      </div>
                    )}

                    {currentRole?.fields.includes('phone') && (
                      <div>
                        <label className="block text-gray-700 mb-2">Phone Number</label>
                        <div className="flex">
                          <select
                            name="countryCode"
                            value={formData.countryCode}
                            onChange={handleChange}
                            className="p-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="+251">🇪🇹 +251</option>
                            <option value="+1">🇺🇸 +1</option>
                            <option value="+44">🇬🇧 +44</option>
                            <option value="+91">🇮🇳 +91</option>
                          </select>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                      </div>
                    )}

                    {currentRole?.fields.includes('password') && (
                      <div>
                        <label className="block text-gray-700 mb-2">Password</label>
                        <input
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          required
                        />
                        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                      </div>
                    )}

                    {currentRole?.fields.includes('confirmPassword') && (
                      <div>
                        <label className="block text-gray-700 mb-2">Confirm Password</label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          required
                        />
                        {errors.confirmPassword && (
                          <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                        )}
                      </div>
                    )}

                    <motion.button
                      type="submit"
                      className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Complete Registration
                    </motion.button>
                  </form>

                  <div className="mt-8 text-center">
                    <p className="text-gray-600 mb-4">Or register with</p>
                    {googleUser ? (
                      <RegisterWithGoogle googleUser={googleUser} />
                    ) : (
                      <GoogleAuth
                        setGoogleUser={setGoogleUser}
                        setIsRegisteringWithGoogle={setIsRegisteringWithGoogle}
                      />
                    )}
                  </div>

                  <div className="text-center mt-8 text-gray-600">
                    <p>
                      Already have an account?{' '}
                      <a href="/login" className="text-blue-500 hover:underline font-medium">
                        Log in
                      </a>
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      By joining, you agree to our{' '}
                      <a href="/terms" className="text-blue-500 hover:underline">
                        Terms
                      </a>{' '}
                      and{' '}
                      <a href="/privacy" className="text-blue-500 hover:underline">
                        Privacy Policy
                      </a>
                    </p>
                  </div>
                </>
              ) : (
                <>
                  {googleUser ? (
                    <RegisterWithGoogle googleUser={googleUser} />
                  ) : (
                    <GoogleAuth
                      setGoogleUser={setGoogleUser}
                      setIsRegisteringWithGoogle={setIsRegisteringWithGoogle}
                    />
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default EnhancedRegisterPage;