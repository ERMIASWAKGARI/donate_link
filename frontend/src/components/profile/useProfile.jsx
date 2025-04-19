import { useEffect, useState } from 'react';

export const useProfile = (user, onProfileUpdate) => {
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [editingField, setEditingField] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({});

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

  const handleCancelEdit = () => setEditingField(null);

  const handleFieldChange = (fieldName, value) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,

      // Special handling for address compound field
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
    }));
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
        // For multi-select fields, use the formData if it exists, otherwise fall back to user data
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
    handleCancelEdit,
    handleSaveField,
    handleFieldChange,
    setEditingField,
  };
};
