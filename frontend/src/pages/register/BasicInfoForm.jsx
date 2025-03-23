/* eslint-disable react/prop-types */
import { useState } from 'react';

const BasicInfoForm = ({ formData, onChange, onNext }) => {
  const [errors, setErrors] = useState({});

  // 🔹 Validate form before moving to the next step
  const validateForm = () => {
    const newErrors = {};

    // 🔹 Validate Name (Only letters allowed)
    if (!formData.name.match(/^[A-Za-z\s]+$/)) {
      newErrors.name = 'Name should only contain letters.';
    }

    // 🔹 Validate Email
    if (
      !formData.email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
    ) {
      newErrors.email = 'Enter a valid email address.';
    }

    // 🔹 Validate Password (Minimum 8 characters)
    if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters.';
    }

    // 🔹 Validate Confirm Password (Should match password)
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    setErrors(newErrors);

    // ✅ If no errors, allow going to next step
    return Object.keys(newErrors).length === 0;
  };

  // 🔹 Handle Next Button Click
  const handleNext = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onNext(); // ✅ Proceed to next step if valid
    }
  };

  return (
    <>
      <h2 className="text-2xl font-bold mb-4 text-center">Basic Information</h2>
      <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
        <div>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            className="w-full p-2 border border-gray-300 rounded"
            onChange={onChange}
            required
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
        </div>

        <div>
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full p-2 border border-gray-300 rounded"
            onChange={onChange}
            required
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email}</p>
          )}
        </div>

        <input
          type="tel"
          name="phone"
          placeholder="Phone Number"
          className="w-full p-2 border border-gray-300 rounded"
          onChange={onChange}
        />

        <div>
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full p-2 border border-gray-300 rounded"
            onChange={onChange}
            required
          />
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password}</p>
          )}
        </div>

        <div>
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            className="w-full p-2 border border-gray-300 rounded"
            onChange={onChange}
            required
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm">{errors.confirmPassword}</p>
          )}
        </div>

        <button
          className="w-full bg-blue-500 text-white p-2 rounded"
          onClick={handleNext}
        >
          Next
        </button>
      </form>
    </>
  );
};

export default BasicInfoForm;
