export const validateProfile = (user, formData) => {
  const errors = {};

  // Name validation
  if (formData.name !== undefined) {
    if (user.role === 'individual_donor' || user.role === 'volunteer') {
      if (!formData.name || formData.name.trim() === '') {
        errors.name = 'Name is required';
      } else if (!/^[A-Za-z\s]+$/.test(formData.name)) {
        errors.name = 'Name should only contain letters';
      } else if (formData.name.length < 2) {
        errors.name = 'Name should be at least 2 characters';
      }
    }

    // NGO validation
    if (user.role === 'ngo') {
      if (!formData.name || formData.name.trim() === '') {
        errors.name = 'Organization name is required';
      } else if (formData.name.length < 3) {
        errors.name = 'Organization name too short';
      }
    }
  }

  // Phone validation (for all roles)
  if (formData.phone !== undefined) {
    if (!formData.phone) {
      errors.phone = 'Phone number is required';
    } else if (!/^\+?\d{9,15}$/.test(formData.phone)) {
      errors.phone = 'Enter a valid phone number (9-15 digits)';
    }
  }

  // Email validation
  if (formData.email !== undefined) {
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Enter a valid email address';
    }
  }

  return errors;
};
