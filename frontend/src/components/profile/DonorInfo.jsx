/* eslint-disable react/prop-types */
import { SolutionOutlined } from '@ant-design/icons';
import { FieldRenderer } from './FieldRenderer';
import { donorFields } from './profileFields';

export const DonorInfo = ({
  user,
  editingField,
  loading,
  onEdit,
  onCancel,
  onSave,
  handleFieldChange,
  hasChanges,
}) => {
  const horizontalFields = [
    'donorType',
    'preferredDonations',
    'donationFrequency',
  ];

  const otherFields = donorFields.filter(
    (field) => !horizontalFields.includes(field.fieldName)
  );

  return (
    <>
      <h2 className="text-lg font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-200 flex items-center">
        <SolutionOutlined className="mr-2 text-teal-500" />
        Donor Information
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {donorFields
          .filter((field) => horizontalFields.includes(field.fieldName))
          .map((field) => (
            <div
              key={field.fieldName}
              className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <FieldRenderer
                key={field.fieldName}
                fieldConfig={field}
                user={user}
                editingField={editingField}
                loading={loading}
                onEdit={onEdit}
                onCancel={onCancel}
                onSave={onSave}
                handleFieldChange={handleFieldChange}
                hasChanges={hasChanges}
              />
            </div>
          ))}
      </div>

      {/* Vertical Fields Section */}
      <div className="space-y-6">
        {otherFields.map((field) => (
          <FieldRenderer
            key={field.fieldName}
            fieldConfig={field}
            user={user}
            editingField={editingField}
            loading={loading}
            onEdit={onEdit}
            onCancel={onCancel}
            onSave={onSave}
            handleFieldChange={handleFieldChange}
            hasChanges={hasChanges}
          />
        ))}
      </div>
    </>
  );
};
