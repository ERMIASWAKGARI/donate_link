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
}) => (
  <>
    <h2 className="text-lg font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-200 flex items-center">
      <SolutionOutlined className="mr-2 text-teal-500" />
      Donor Information
    </h2>

    {donorFields.map((field) => (
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
  </>
);
