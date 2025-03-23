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
    setFormData({ ...formData, role: '' });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm(formData, selectedRole, setErrors)) return;

    let filteredData = {
      role: formData.role,
      email: formData.email,
      password: formData.password,
    };

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
          navigate(
            `/verify?${data.data.verificationType}=${
              data.data[data.data.verificationType]
            }`
          );
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

        {/* Role Selection */}
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
                  {errors.organizationName && (
                    <p className="text-red-500 text-sm">
                      {errors.organizationName}
                    </p>
                  )}
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
                  {errors.ngoName && (
                    <p className="text-red-500 text-sm">{errors.ngoName}</p>
                  )}
                </div>
              )}

              <input
                type="email"
                name="email"
                placeholder="Email"
                className="w-full p-2 border border-gray-300 rounded"
                onChange={handleChange}
                required
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email}</p>
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
