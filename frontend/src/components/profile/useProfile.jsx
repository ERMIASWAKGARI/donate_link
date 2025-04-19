import { useEffect, useState } from 'react';

export const useProfile = (user, onProfileUpdate) => {
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [editingField, setEditingField] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({});
  const [hasChanges, setHasChanges] = useState(false); // Track changes

  useEffect(() => {
    let completedFields = 0;
    const totalFields = 6; // name, email, phone, address, bio, dob

    if (user?.name) completedFields++;
    if (user?.email && user?.isEmailVerified) completedFields++;
    if (user?.phone && user?.isPhoneVerified) completedFields++;
    if (user?.address) completedFields++;
    if (user?.bio) completedFields++;
    if (user?.dob) completedFields++;

    setProfileCompletion(Math.round((completedFields / totalFields) * 100));
  }, [user]);

  const handleCancelEdit = () => {
    setEditingField(null);
    setFormData({});
    setHasChanges(false);
  };

  const handleFieldChange = (fieldName, value) => {
    setFormData((prev) => {
      const newFormData = {
        ...prev,
        [fieldName]: value,
        ...(fieldName === 'country' && {
          address: {
            ...prev.address,
            country: value,
            ...(!user.address?.region && { region: '' }),
            ...(!user.address?.city && { city: '' }),
          },
        }),
        ...(fieldName === 'region' && {
          address: {
            ...prev.address,
            region: value,
          },
        }),
        ...(fieldName === 'city' && {
          address: {
            ...prev.address,
            city: value,
          },
        }),
      };

      // Check if there are actual changes
      const hasChanges = checkForChanges(newFormData, fieldName);
      setHasChanges(hasChanges);

      return newFormData;
    });
  };

  // Helper function to check for actual changes
  const checkForChanges = (currentFormData, fieldName) => {
    if (fieldName === 'address') {
      return (
        currentFormData.address?.country !== user.address?.country ||
        currentFormData.address?.region !== user.address?.region ||
        currentFormData.address?.city !== user.address?.city
      );
    }

    if (Array.isArray(currentFormData[fieldName])) {
      // For array fields (like multiselect)
      const currentValues = currentFormData[fieldName] || [];
      const userValues = user[fieldName] || [];
      return (
        currentValues.length !== userValues.length ||
        currentValues.some((val) => !userValues.includes(val)) ||
        userValues.some((val) => !currentValues.includes(val))
      );
    }

    return currentFormData[fieldName] !== user[fieldName];
  };

  const handleSaveField = async (fieldName) => {
    try {
      setLoading(true);

      let updateData = {};
      if (fieldName === 'address') {
        updateData = {
          address: {
            country: formData.address?.country || user.address?.country,
            region: formData.address?.region || user.address?.region,
            city: formData.address?.city || user.address?.city,
          },
        };
      } else {
        updateData = {
          [fieldName]:
            formData[fieldName] !== undefined
              ? formData[fieldName]
              : user[fieldName],
        };
      }

      await onProfileUpdate(updateData);
      setEditingField(null);
      setFormData({});
      setHasChanges(false);
    } catch (error) {
      console.error(`Failed to update ${fieldName}`, error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    profileCompletion,
    editingField,
    loading,
    formData,
    hasChanges, // Expose hasChanges
    handleCancelEdit,
    handleSaveField,
    handleFieldChange,
    setEditingField,
  };
};
