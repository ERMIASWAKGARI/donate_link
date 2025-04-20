/* eslint-disable react/prop-types */
import { UserOutlined } from '@ant-design/icons';
import { AdminInfo } from './AdminInfo';
import { DonorInfo } from './DonorInfo';
import { FieldRenderer } from './FieldRenderer';
import { NgoInfo } from './NgoInfo';
import { basicProfileFields } from './profileFields';
import { ProfileHeader } from './ProfileHeader';
import { useProfile } from './useProfile';
import { VolunteerInfo } from './VolunteerInfo';

export const ProfileBasicInfo = ({
  user,
  onProfileUpdate,
  onProfilePictureUpload,
  onVerificationDocsSubmit,
}) => {
  const {
    profileCompletion,
    editingField,
    loading,
    handleCancelEdit,
    handleSaveField,
    handleFieldChange,
    setEditingField,
    formData,
    hasChanges,
  } = useProfile(user, onProfileUpdate);

  const renderRoleSpecificInfo = () => {
    switch (user.role) {
      case 'volunteer':
        return (
          <VolunteerInfo
            user={user}
            editingField={editingField}
            formData={formData}
            loading={loading}
            onEdit={setEditingField}
            onCancel={handleCancelEdit}
            onSave={handleSaveField}
            handleFieldChange={handleFieldChange}
            hasChanges={hasChanges}
          />
        );
      case 'ngo':
        return (
          <NgoInfo
            user={user}
            editingField={editingField}
            loading={loading}
            onEdit={setEditingField}
            onCancel={handleCancelEdit}
            onSave={handleSaveField}
            handleFieldChange={handleFieldChange}
          />
        );
      case 'individual_donor':
      case 'organization_donor':
        return (
          <DonorInfo
            user={user}
            editingField={editingField}
            loading={loading}
            onEdit={setEditingField}
            onCancel={handleCancelEdit}
            onSave={handleSaveField}
            handleFieldChange={handleFieldChange}
            hasChanges={hasChanges}
          />
        );
      case 'admin':
        return (
          <AdminInfo
            user={user}
            editingField={editingField}
            loading={loading}
            onEdit={setEditingField}
            onCancel={handleCancelEdit}
            onSave={handleSaveField}
            handleFieldChange={handleFieldChange}
            hasChanges={hasChanges}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          <ProfileHeader
            user={user}
            profileCompletion={profileCompletion}
            onProfilePictureUpload={onProfilePictureUpload}
            onVerificationDocsSubmit={onVerificationDocsSubmit} // Pass it down
          />

          <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-gray-50 p-6 rounded-xl">
                <h2 className="text-lg font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-200 flex items-center">
                  <UserOutlined className="mr-2 text-teal-500" />
                  Basic Information
                </h2>

                {basicProfileFields.map((field) => (
                  <FieldRenderer
                    key={field.fieldName}
                    fieldConfig={field}
                    user={user}
                    editingField={editingField}
                    loading={loading}
                    onEdit={setEditingField}
                    onCancel={handleCancelEdit}
                    onSave={handleSaveField}
                    handleFieldChange={handleFieldChange}
                    hasChanges={hasChanges}
                  />
                ))}
              </div>
            </div>
            <div>
              <div className="bg-gray-50 p-6 rounded-xl sticky top-6">
                {renderRoleSpecificInfo()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileBasicInfo;
