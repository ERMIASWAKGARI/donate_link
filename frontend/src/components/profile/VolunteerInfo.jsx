/* eslint-disable react/prop-types */
import { TeamOutlined } from '@ant-design/icons';
import { FieldRenderer } from './FieldRenderer';
import { volunteerFields } from './profileFields';

export const VolunteerInfo = ({
  user,
  editingField,
  loading,
  formData,
  onEdit,
  onCancel,
  onSave,
  handleFieldChange,
}) => (
  <>
    <h2 className="text-lg font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-200 flex items-center">
      <TeamOutlined className="mr-2 text-teal-500" />
      Volunteer Information
    </h2>

    {volunteerFields.map((field) => (
      <FieldRenderer
        key={field.fieldName}
        fieldConfig={field}
        user={user}
        editingField={editingField}
        loading={loading}
        formData={formData}
        onEdit={onEdit}
        onCancel={onCancel}
        onSave={onSave}
        handleFieldChange={handleFieldChange}
      />
    ))}
  </>
);
