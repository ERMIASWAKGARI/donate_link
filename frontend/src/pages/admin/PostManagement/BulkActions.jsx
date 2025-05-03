/* eslint-disable react/prop-types */
// src/pages/admin/PostManagement/BulkActions.js
import { Button } from 'antd';

const BulkActions = ({
  selectedCount,
  isProcessing,
  // Add other props for bulk actions
}) => {
  return (
    <div className="flex items-center space-x-4">
      <span className="text-blue-600 font-medium">
        {selectedCount} selected
      </span>

      {/* Add bulk action buttons as needed */}
      <Button
        type="primary"
        danger
        size="small"
        loading={isProcessing}
        // onClick={onBulkDelete}
      >
        Delete
      </Button>
    </div>
  );
};

export default BulkActions;
