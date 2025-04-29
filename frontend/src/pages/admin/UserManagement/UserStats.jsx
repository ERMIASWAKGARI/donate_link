/* eslint-disable react/prop-types */
import { Spin } from 'antd';

const roleOptions = [
  { value: '', label: 'All Roles' },
  { value: 'individual_donor', label: 'Individual Donors' },
  { value: 'organization_donor', label: 'Organization Donors' },
  { value: 'volunteer', label: 'Volunteers' },
  { value: 'ngo', label: 'NGOs' },
  { value: 'admin', label: 'Admins' },
];

export const UserStats = ({ pagination, users, loading, selectedRole }) => (
  <div className="flex flex-wrap gap-3 mt-3 md:mt-0">
    {pagination && (
      <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
        <span className="text-sm font-medium text-white/80">Total Users</span>
        <p className="text-xl font-bold text-white">
          {pagination.totalItems?.toLocaleString() || 0}
        </p>
      </div>
    )}
    {selectedRole && (
      <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
        <span className="text-sm font-medium text-white/80">Filtered</span>
        <p className="text-xl font-bold text-white flex items-center gap-2">
          {loading ? (
            <>
              <Spin size="small" />
              <span>
                {roleOptions.find((r) => r.value === selectedRole)?.label}
              </span>
            </>
          ) : (
            `${users.length} ${
              roleOptions.find((r) => r.value === selectedRole)?.label
            }`
          )}
        </p>
      </div>
    )}
  </div>
);
