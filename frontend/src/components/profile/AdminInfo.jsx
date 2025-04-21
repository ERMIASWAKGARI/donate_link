/* eslint-disable react/prop-types */
import { SafetyOutlined } from '@ant-design/icons';
import { FieldRenderer } from './FieldRenderer';
import { adminFields } from './profileFields';

export const AdminInfo = ({ user, hasChanges }) => {
  const horizontalFields = ['adminLevel', 'lastAction', 'permissions'];
  const otherFields = adminFields.filter(
    (field) => !horizontalFields.includes(field.fieldName)
  );

  return (
    <>
      <h2 className="text-lg font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-200 flex items-center">
        <SafetyOutlined className="mr-2 text-teal-500" />
        Admin Information
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {adminFields
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
            hasChanges={hasChanges}
          />
        ))}
      </div>
    </>
  );
};
