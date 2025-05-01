/* eslint-disable react/prop-types */
// src/pages/admin/PostManagement/StatusFilters.js
import { Select } from 'antd';

const { Option } = Select;

const StatusFilters = ({ statusFilter, handleStatusChange }) => {
  return (
    <div className="">
      <Select
        value={statusFilter || undefined}
        onChange={handleStatusChange}
        placeholder="Filter by status"
        allowClear
        className="w-40"
      >
        <Option value="active">Active</Option>
        <Option value="pending">Pending</Option>
        <Option value="completed">Completed</Option>
        <Option value="rejected">Rejected</Option>
      </Select>
    </div>
  );
};

export default StatusFilters;
