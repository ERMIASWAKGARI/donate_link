import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import AlertMessage from '../components/AlertMessage';
import validateForm from '../utils/validateForm';

function RegisterPage() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    organizationName: '',
    ngoName: '',
    email: '',
    phone: '',
    countryCode: '+251', // Default to Ethiopia
    password: '',
    confirmPassword: '',
    role: '',
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle role selection
  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setFormData({ ...formData, role });
  };

  // Allow user to go back and change role
  const handleRoleChange = () => {
    setSelectedRole('');
    setFormData({
      name: '',
      organizationName: '',
      ngoName: '',
      email: '',
      phone: '',
      countryCode: '+251', // Default to Ethiopia
      password: '',
      confirmPassword: '',
      role: '',
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm(formData, selectedRole, setErrors)) return;

    let filteredData = {
      role: formData.role,
      password: formData.password,
    };

    if (formData.email) {
      filteredData.email = formData.email;
    }

    if (formData.phone) {
      filteredData.phone = `${formData.countryCode}${formData.phone}`;
    }

    if (selectedRole === 'individual_donor' || selectedRole === 'volunteer') {
      filteredData.name = formData.name;
    } else if (selectedRole === 'organization_donor') {
      filteredData.name = formData.organizationName;
    } else if (selectedRole === 'ngo') {
      filteredData.name = formData.ngoName;
    }

    console.log(filteredData);

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
          }
          if (data.data.verificationType === 'phone') {
            navigate(`/verify-otp?phone=${data.data.phone}`);
          }
        }, 3000);
      } else {
        setMessage({
          type: 'error',
          text: `Registration Failed: ${data.message}`,
        });

        setTimeout(() => {
          setMessage({ type: '', text: '' });
        }, 3000);
      }
    } catch (error) {
      console.error('Registration Error:', error.message);
      setMessage({
        type: 'error',
        text: 'An error occurred. Please try again.',
      });

      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <div className="flex items-center justify-between mb-4">
          {selectedRole && (
            <button
              onClick={handleRoleChange}
              className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
            >
              ⬅️
            </button>
          )}
          <h2 className="text-2xl font-bold flex-grow text-center">Register</h2>
        </div>

        <AlertMessage message={message} />

        {!selectedRole ? (
          <div className="grid grid-cols-2 gap-4 mb-4">
            {['individual_donor', 'organization_donor', 'volunteer', 'ngo'].map(
              (role) => (
                <button
                  key={role}
                  className={`p-3 rounded ${
                    selectedRole === role
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-300 text-black'
                  }`}
                  onClick={() => handleRoleSelect(role)}
                >
                  {role.replace('_', ' ').toUpperCase()}
                </button>
              )
            )}
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Field (Varies Based on Role) */}
              {selectedRole === 'individual_donor' ||
              selectedRole === 'volunteer' ? (
                <div>
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    className="w-full p-2 border border-gray-300 rounded"
                    onChange={handleChange}
                    required
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm">{errors.name}</p>
                  )}
                </div>
              ) : selectedRole === 'organization_donor' ? (
                <div>
                  <input
                    type="text"
                    name="organizationName"
                    placeholder="Organization Name"
                    className="w-full p-2 border border-gray-300 rounded"
                    onChange={handleChange}
                    required
                  />
                </div>
              ) : (
                <div>
                  <input
                    type="text"
                    name="ngoName"
                    placeholder="NGO Name"
                    className="w-full p-2 border border-gray-300 rounded"
                    onChange={handleChange}
                    required
                  />
                </div>
              )}

              <input
                type="email"
                name="email"
                placeholder="Email"
                className="w-full p-2 border border-gray-300 rounded"
                onChange={handleChange}
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email}</p>
              )}

              {/* Phone Number with Country Code */}
              <div className="flex">
                <select
                  name="countryCode"
                  className="p-2 border border-gray-300 rounded-l"
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
                  placeholder="Phone Number"
                  className="w-full p-2 border border-gray-300 rounded-r"
                  onChange={handleChange}
                />
              </div>
              {errors.phone && (
                <p className="text-red-500 text-sm">{errors.phone}</p>
              )}

              <input
                type="password"
                name="password"
                placeholder="Password"
                className="w-full p-2 border border-gray-300 rounded"
                onChange={handleChange}
                required
              />
              {errors.password && (
                <p className="text-red-500 text-sm">{errors.password}</p>
              )}

              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                className="w-full p-2 border border-gray-300 rounded"
                onChange={handleChange}
                required
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm">{errors.confirmPassword}</p>
              )}

              <button
                type="submit"
                className="w-full bg-green-500 text-white p-2 rounded"
              >
                Register
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default RegisterPage;
