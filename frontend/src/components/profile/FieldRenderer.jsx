/* eslint-disable react/prop-types */
import { EditableField } from './EditableField';

export const FieldRenderer = ({
  fieldConfig,
  user,
  editingField,
  loading,
  formData,
  onEdit,
  onCancel,
  onSave,
  handleFieldChange,
}) => {
  if (fieldConfig.roles && !fieldConfig.roles.includes(user.role)) {
    return null;
  }
  // Skip field if showIf condition exists and returns false
  if (fieldConfig.showIf && !fieldConfig.showIf(user)) {
    return null;
  }

  // Handle display-only fields
  if (fieldConfig.type === 'display') {
    return (
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700">
          {fieldConfig.label}
        </label>
        <div className="mt-1">
          {fieldConfig.displayComponent(user[fieldConfig.fieldName])}
        </div>
      </div>
    );
  }

  // Handle compound fields (like address)
  if (fieldConfig.type === 'compound') {
    return (
      <EditableField
        fieldName={fieldConfig.fieldName}
        label={fieldConfig.label}
        value={
          user[fieldConfig.fieldName] ? (
            <>
              {user[fieldConfig.fieldName].country},{' '}
              {user[fieldConfig.fieldName].region},{' '}
              {user[fieldConfig.fieldName].city}
            </>
          ) : (
            <span className="text-gray-400">Not provided</span>
          )
        }
        editComponent={
          <div className="space-y-2">
            {fieldConfig.fields.map((subField) => (
              <div key={subField.fieldName}>
                <label className="block text-sm font-medium text-gray-700">
                  {subField.label}
                </label>
                <input
                  type={subField.type}
                  defaultValue={
                    user[fieldConfig.fieldName]?.[subField.fieldName] || ''
                  }
                  onChange={(e) =>
                    handleFieldChange(subField.fieldName, e.target.value)
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                  placeholder={subField.placeholder}
                />
              </div>
            ))}
          </div>
        }
        editingField={editingField}
        loading={loading}
        onEdit={onEdit}
        onCancel={onCancel}
        onSave={onSave}
      />
    );
  }

  // Handle textarea fields
  if (fieldConfig.type === 'textarea') {
    return (
      <EditableField
        fieldName={fieldConfig.fieldName}
        label={fieldConfig.label}
        value={
          user[fieldConfig.fieldName] || (
            <span className="text-gray-400">Not provided</span>
          )
        }
        editComponent={
          <textarea
            defaultValue={user[fieldConfig.fieldName] || ''}
            onChange={(e) =>
              handleFieldChange(fieldConfig.fieldName, e.target.value)
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
            placeholder={fieldConfig.placeholder}
            rows={fieldConfig.rows}
          />
        }
        editingField={editingField}
        loading={loading}
        onEdit={onEdit}
        onCancel={onCancel}
        onSave={onSave}
      />
    );
  }

  // Handle select fields
  if (fieldConfig.type === 'select') {
    return (
      <EditableField
        fieldName={fieldConfig.fieldName}
        label={fieldConfig.label}
        value={
          user[fieldConfig.fieldName] || (
            <span className="text-gray-400">Not provided</span>
          )
        }
        editComponent={
          <select
            defaultValue={user[fieldConfig.fieldName] || ''}
            onChange={(e) =>
              handleFieldChange(fieldConfig.fieldName, e.target.value)
            }
            className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-teal-500 focus:outline-none focus:ring-teal-500 sm:text-sm"
          >
            {fieldConfig.options.map((option) => (
              <option key={option} value={option}>
                {option || 'Select an option'}
              </option>
            ))}
          </select>
        }
        editingField={editingField}
        loading={loading}
        onEdit={onEdit}
        onCancel={onCancel}
        onSave={onSave}
      />
    );
  }

  if (fieldConfig.type === 'multiselect') {
    // Get current values - prioritize formData over user data when editing
    const currentValues =
      editingField === fieldConfig.fieldName
        ? Array.isArray(formData[fieldConfig.fieldName])
          ? formData[fieldConfig.fieldName]
          : user[fieldConfig.fieldName] || []
        : user[fieldConfig.fieldName] || [];

    const availableOptions = fieldConfig.options.filter(
      (option) => !currentValues.includes(option)
    );

    const handleAddSelection = (value) => {
      if (value && !currentValues.includes(value)) {
        const newValues = [...currentValues, value];
        handleFieldChange(fieldConfig.fieldName, newValues);
      }
    };

    const handleRemoveSelection = (value) => {
      const newValues = currentValues.filter((item) => item !== value);
      handleFieldChange(fieldConfig.fieldName, newValues);
    };

    return (
      <EditableField
        fieldName={fieldConfig.fieldName}
        label={fieldConfig.label}
        value={
          currentValues.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {currentValues.map((value) => (
                <span
                  key={value}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                >
                  {value}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveSelection(value);
                    }}
                    className="ml-2 text-blue-500 hover:text-blue-700"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <span className="text-gray-400">Not provided</span>
          )
        }
        editComponent={
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2 mb-2">
              {currentValues.map((value) => (
                <span
                  key={value}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-teal-100 text-teal-800"
                >
                  {value}
                  <button
                    type="button"
                    onClick={() => handleRemoveSelection(value)}
                    className="ml-2 text-teal-500 hover:text-teal-700"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            {availableOptions.length > 0 ? (
              <select
                value=""
                onChange={(e) => {
                  handleAddSelection(e.target.value);
                  e.target.value = ''; // Reset the select
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
              >
                <option value="">
                  Add {fieldConfig.label.toLowerCase()}...
                </option>
                {availableOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-sm text-gray-500">All options selected</p>
            )}
          </div>
        }
        editingField={editingField}
        loading={loading}
        onEdit={onEdit}
        onCancel={onCancel}
        onSave={onSave}
      />
    );
  }

  // Default to text input
  return (
    <EditableField
      fieldName={fieldConfig.fieldName}
      label={fieldConfig.label}
      value={
        user[fieldConfig.fieldName] || (
          <span className="text-gray-400">Not provided</span>
        )
      }
      editComponent={
        <input
          type={fieldConfig.type || 'text'}
          defaultValue={user[fieldConfig.fieldName] || ''}
          onChange={(e) =>
            handleFieldChange(fieldConfig.fieldName, e.target.value)
          }
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
          placeholder={fieldConfig.placeholder}
          readOnly={fieldConfig.readOnly}
        />
      }
      editingField={editingField}
      loading={loading}
      onEdit={fieldConfig.readOnly ? null : onEdit}
      onCancel={onCancel}
      onSave={onSave}
    />
  );
};
