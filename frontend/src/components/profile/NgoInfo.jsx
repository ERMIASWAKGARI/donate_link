/* eslint-disable react/prop-types */
import { BankOutlined } from '@ant-design/icons';
import { FieldRenderer } from './FieldRenderer';
import { ngoFields } from './profileFields';

export const NgoInfo = ({
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
      <BankOutlined className="mr-2 text-teal-500" />
      NGO Information
    </h2>

    {ngoFields.map((field) => (
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
