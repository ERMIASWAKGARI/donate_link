/* eslint-disable react/prop-types */
import { CloseOutlined, EditOutlined, SaveOutlined } from '@ant-design/icons';

export const EditableField = ({
  fieldName,
  label,
  value,
  editComponent,
  editingField,
  loading,
  onEdit,
  onCancel,
  onSave,
  hasChanges, // New prop to determine if there are changes
}) => {
  return (
    <div className="mb-6">
      <div className="flex justify-between items-start mb-1">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
        {editingField === fieldName ? (
          <div className="flex space-x-2">
            <button
              onClick={onCancel}
              disabled={loading}
              className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
            >
              <CloseOutlined className="mr-1" />
              Cancel
            </button>
            <button
              onClick={() => onSave(fieldName)}
              disabled={loading || !hasChanges} // Disable if no changes
              className={`text-teal-500 hover:text-teal-700 disabled:opacity-50 ${
                !hasChanges ? 'cursor-not-allowed' : ''
              }`}
            >
              <SaveOutlined className="mr-1" />
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        ) : (
          <button
            onClick={() => onEdit(fieldName)}
            className="text-teal-500 hover:text-teal-800 transition-colors"
          >
            <EditOutlined className="mr-1" />
          </button>
        )}
      </div>

      {editingField === fieldName ? (
        editComponent
      ) : (
        <div className="mt-1 flex items-center">
          <span className="text-gray-900">
            {value || <span className="text-gray-400">Not provided</span>}
          </span>
        </div>
      )}
    </div>
  );
};
