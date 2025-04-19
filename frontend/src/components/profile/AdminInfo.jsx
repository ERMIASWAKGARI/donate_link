/* eslint-disable react/prop-types */
import { SafetyOutlined } from '@ant-design/icons';
import { FieldRenderer } from './FieldRenderer';
import { adminFields } from './profileFields';

export const AdminInfo = ({ user }) => (
  <>
    <h2 className="text-lg font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-200 flex items-center">
      <SafetyOutlined className="mr-2 text-teal-500" />
      Admin Information
    </h2>

    {adminFields.map((field) => (
      <FieldRenderer key={field.fieldName} fieldConfig={field} user={user} />
    ))}
  </>
);
