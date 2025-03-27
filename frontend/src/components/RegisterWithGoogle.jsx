import { useState } from 'react';

// eslint-disable-next-line react/prop-types
const RegisterWithGoogle = ({ googleUser }) => {
  const [role, setRole] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userData = {
      ...googleUser,
      role,
      phone: phone || undefined, // Optional phone field
    };

    console.log(userData);

    const response = await fetch('http://localhost:5000/api/users/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    console.log('Registration Response:', data);

    if (data.status === 'success') {
      localStorage.setItem('accessToken', data.data.accessToken);
      alert('Registration successful!');
      window.location.href = '/dashboard';
    } else {
      alert('Registration Failed: ' + data.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-700">
          Complete Registration
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Phone Number (Optional) */}
          <input
            type="tel"
            placeholder="Phone Number (Optional)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
          />

          {/* Role Selection (Required) */}
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">Select Role</option>
            <option value="individual_donor">Individual Donor</option>
            <option value="organization_donor">Organization Donor</option>
            <option value="volunteer">Volunteer</option>
            <option value="ngo">NGO</option>
          </select>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-700 transition"
          >
            Complete Registration
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterWithGoogle;
