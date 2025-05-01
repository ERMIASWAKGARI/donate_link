/* eslint-disable react/prop-types */
// src/pages/admin/PostManagement/PostFilters.js
import { Input, Select } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

const { Option } = Select;

const PostFilters = ({
  searchQuery,
  selectedType,
  selectedSort,
  handleSearch,
  changeType,
  changeSort,
}) => {
  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-center md:space-x-4 space-y-2 md:space-y-0">
      <div className="flex-1">
        <Input
          placeholder="Search posts..."
          prefix={<SearchOutlined />}
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          allowClear
          className="w-full md:w-64"
        />
      </div>

      <div className="flex space-x-2 gap-4">
        <Select
          value={selectedType || undefined}
          onChange={changeType}
          placeholder="Filter by type"
          allowClear
          className="w-40"
        >
          <Option value="donation">Donation</Option>
          <Option value="need">Need</Option>
        </Select>

        <Select
          value={selectedSort || undefined}
          onChange={changeSort}
          placeholder="Sort by"
          allowClear
          className="w-40"
        >
          <Option value="-createdAt">Newest First</Option>
          <Option value="createdAt">Oldest First</Option>
          <Option value="-updatedAt">Recently Updated</Option>
          <Option value="updatedAt">Least Recently Updated</Option>
        </Select>
      </div>
    </div>
  );
};

export default PostFilters;
