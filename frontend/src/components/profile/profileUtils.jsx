export const getRoleTagColor = (role) => {
  switch (role) {
    case 'admin':
      return 'bg-red-100 text-red-800';
    case 'ngo':
      return 'bg-teal-100 text-teal-800';
    case 'volunteer':
      return 'bg-blue-100 text-blue-800';
    case 'organization_donor':
      return 'bg-green-100 text-green-800';
    case 'individual_donor':
      return 'bg-amber-100 text-amber-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getVerificationStatus = (status) => {
  switch (status) {
    case 'verified':
      return {
        color: 'bg-green-100 text-green-800',
        icon: 'text-green-500',
        text: 'Verified',
      };
    case 'pending':
      return {
        color: 'bg-amber-100 text-amber-800',
        icon: 'text-amber-500',
        text: 'Pending',
      };
    case 'not_verified':
      return {
        color: 'bg-red-100 text-red-800',
        icon: 'text-red-500',
        text: 'Not Verified',
      };
    default:
      return {
        color: 'bg-gray-100 text-gray-800',
        icon: null,
        text: 'Unknown',
      };
  }
};
