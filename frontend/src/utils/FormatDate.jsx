// src/utils/formatDate.js
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';

  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', options);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

// Optional: You can add more date formatting functions if needed
export const formatDateOnly = (dateString) => {
  if (!dateString) return 'N/A';

  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', options);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

export default formatDate;
