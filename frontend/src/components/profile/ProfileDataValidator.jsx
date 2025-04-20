// components/ProfileValidator.js
export const validateProfile = (user, formData) => {
  const errors = {};

  // Name validation (for individual_donor and volunteer)
  if (
    (user.role === 'individual_donor' || user.role === 'volunteer') &&
    formData.name
  ) {
    if (!/^[A-Za-z\s]+$/.test(formData.name)) {
      errors.name = 'Name should only contain letters';
    }
    if (formData.name.length < 2) {
      errors.name = 'Name should be at least 2 characters';
    }
  }

  // NGO validation
  if (user.role === 'ngo') {
    if (!formData.name || formData.name.trim() === '') {
      errors.name = 'Organization name is required';
    }
    if (formData.name && formData.name.length < 3) {
      errors.name = 'Organization name too short';
    }
  }

  // Phone validation (for all roles)
  if (formData.phone) {
    if (!/^\d{9,15}$/.test(formData.phone)) {
      errors.phone = 'Enter a valid phone number (9-15 digits)';
    }
  }

  // Email validation (if editable)
  if (formData.email) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Enter a valid email address';
    }
  }

  return errors;
};
