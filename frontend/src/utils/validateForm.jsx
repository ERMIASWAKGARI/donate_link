const validateForm = (formData, selectedRole, setErrors) => {
  const newErrors = {};

  // Name field validation based on role
  if (
    (selectedRole === 'individual_donor' || selectedRole === 'volunteer') &&
    !formData.name.match(/^[A-Za-z\s]+$/)
  ) {
    newErrors.name = 'Name should only contain letters.';
  }

  if (selectedRole === 'ngo' && !formData.ngoName) {
    newErrors.ngoName = 'NGO Name is required.';
  }

  // Email validation
  if (
    !formData.email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
  ) {
    newErrors.email = 'Enter a valid email address.';
  }

  // Password validation
  if (formData.password.length < 8) {
    newErrors.password = 'Password must be at least 8 characters.';
  }

  // Confirm password validation
  if (formData.password !== formData.confirmPassword) {
    newErrors.confirmPassword = 'Passwords do not match.';
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

export default validateForm;
