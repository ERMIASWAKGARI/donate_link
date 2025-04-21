/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useState } from 'react';
import { EditableField } from './EditableField';
import { AvailabilitySelector } from './VolunteerInfo';

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
  hasChanges,
}) => {
  const [customInput, setCustomInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  if (fieldConfig.roles && !fieldConfig.roles.includes(user.role)) {
    return null;
  }
  // Skip field if showIf condition exists and returns false
  if (fieldConfig.showIf && !fieldConfig.showIf(user)) {
    return null;
  }

  const renderWithIcon = (content) => (
    <div className="flex items-start gap-3">
      <div className="pt-1 text-teal-500">{fieldConfig.icon}</div>
      <div className="flex-1">{content}</div>
    </div>
  );

  // In FieldRenderer.js
  if (fieldConfig.type === 'phone') {
    return renderWithIcon(
      <EditableField
        fieldName={fieldConfig.fieldName}
        label={fieldConfig.label}
        value={
          user[fieldConfig.fieldName] || (
            <span className="text-gray-400">Not provided</span>
          )
        }
        editComponent={
          <div className="flex gap-2">
            <select
              defaultValue={user.phoneCountryCode || '+251'} // Default to Ethiopia
              onChange={(e) =>
                handleFieldChange('phoneCountryCode', e.target.value)
              }
              className="mt-1 block w-1/3 rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
            >
              {fieldConfig.countryCodes.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </select>
            <input
              type="tel"
              defaultValue={user[fieldConfig.fieldName] || ''}
              onChange={(e) =>
                handleFieldChange(fieldConfig.fieldName, e.target.value)
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
              placeholder={fieldConfig.placeholder}
            />
          </div>
        }
        editingField={editingField}
        loading={loading}
        onEdit={onEdit}
        onCancel={onCancel}
        onSave={onSave}
        hasChanges={hasChanges}
      />
    );
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
    return renderWithIcon(
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
        hasChanges={hasChanges}
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
        hasChanges={hasChanges}
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
        hasChanges={hasChanges}
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

    // Separate predefined options and custom values
    const predefinedOptions = fieldConfig.options || [];
    const customValues = currentValues.filter(
      (value) => !predefinedOptions.includes(value)
    );
    const selectedPredefined = currentValues.filter((value) =>
      predefinedOptions.includes(value)
    );

    const availableOptions = predefinedOptions.filter(
      (option) => !selectedPredefined.includes(option)
    );

    const handleAddSelection = (value) => {
      if (value === 'other') {
        setShowCustomInput(true);
        return;
      }

      if (value && !currentValues.includes(value)) {
        const newValues = [...currentValues, value];
        handleFieldChange(fieldConfig.fieldName, newValues);
      }
    };

    const handleAddCustom = () => {
      if (customInput.trim() && !currentValues.includes(customInput)) {
        const newValues = [...currentValues, customInput.trim()];
        handleFieldChange(fieldConfig.fieldName, newValues);
        setCustomInput('');
        setShowCustomInput(false);
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
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-gray-800"
                >
                  {value}
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
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-gray-800"
                >
                  {value}
                  <button
                    type="button"
                    onClick={() => handleRemoveSelection(value)}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="space-y-2">
              {availableOptions.length > 0 && (
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
                  <option value="other">Other (specify)...</option>
                </select>
              )}

              {showCustomInput && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    className="flex-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                    placeholder={`Enter custom ${fieldConfig.label.toLowerCase()}`}
                  />
                  <button
                    type="button"
                    onClick={handleAddCustom}
                    disabled={!customInput.trim()}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCustomInput(false)}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        }
        editingField={editingField}
        loading={loading}
        onEdit={onEdit}
        onCancel={onCancel}
        onSave={onSave}
        hasChanges={hasChanges}
      />
    );
  }

  if (fieldConfig.type === 'availability') {
    return (
      <EditableField
        fieldName={fieldConfig.fieldName}
        label={fieldConfig.label}
        value={
          user[fieldConfig.fieldName]?.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {user[fieldConfig.fieldName].map(
                ({ day, startTime, endTime }) => (
                  <span
                    key={day}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-gray-800"
                  >
                    {day}: {startTime}-{endTime}
                  </span>
                )
              )}
            </div>
          ) : (
            <span className="text-gray-400">Not provided</span>
          )
        }
        editComponent={
          <AvailabilitySelector
            value={
              formData[fieldConfig.fieldName] ||
              user[fieldConfig.fieldName] ||
              []
            }
            onChange={(value) =>
              handleFieldChange(fieldConfig.fieldName, value)
            }
            days={fieldConfig.days}
          />
        }
        editingField={editingField}
        loading={loading}
        onEdit={onEdit}
        onCancel={onCancel}
        onSave={onSave}
        hasChanges={hasChanges}
      />
    );
  }

  // Default to text input
  return renderWithIcon(
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
      hasChanges={hasChanges}
    />
  );
};
