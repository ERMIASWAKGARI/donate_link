/* eslint-disable react/prop-types */
import { Spin } from 'antd';
import DataTable from '../common/DataTable';
import ErrorDisplay from '../common/ErrorDisplay';

export const userColumns = [
  {
    Header: '#',
    accessor: '', // No data accessor needed
    Cell: ({ row }) => (
      <span className="text-sm text-gray-600">{row.index + 1}</span>
    ),
    width: 50, // Fixed width for the number column
  },

  {
    Header: 'Name',
    accessor: 'name',
    Cell: ({ value }) => value || 'N/A',
  },
  {
    Header: 'Email',
    accessor: 'email',
    Cell: ({ value }) => value || 'N/A',
  },
  {
    Header: 'Joined Date',
    accessor: 'createdAt',
    Cell: ({ value }) => {
      if (!value) return 'N/A';

      // Format the date to be more readable
      const date = new Date(value);
      return (
        <span className="text-sm text-gray-600">
          {date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </span>
      );
    },
  },
  {
    Header: 'Actions',
    accessor: 'actions',
    Cell: ({ row, onView, onBan, onUnban }) => {
      const user = row.original || {};
      const userId = user._id;

      if (!userId) {
        console.error('Missing user ID for row:', row);
        return <span className="text-gray-400">N/A</span>;
      }

      return (
        <div className="flex space-x-2">
          <button
            onClick={() => onView(userId)}
            className="flex items-center text-[#008080] hover:text-white hover:bg-[#008080] border border-[#008080] px-2 py-1 rounded-md text-sm font-medium transition duration-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            View
          </button>

          {user.isBanned ? (
            <button
              onClick={() => onUnban(userId)}
              className="flex items-center text-[#008080] hover:text-white hover:bg-[#008080] border border-[#008080] px-2 py-1 rounded-md text-sm font-medium transition duration-200"
            >
              {' '}
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Unban
            </button>
          ) : (
            <button
              onClick={() => onBan(userId)}
              className="flex items-center text-red-500 hover:text-white hover:bg-red-500 border border-red-500 px-2 py-1 rounded-md text-sm font-medium transition duration-200"
            >
              {' '}
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                />
              </svg>
              Ban
            </button>
          )}
        </div>
      );
    },
  },
];

export const UserTable = ({
  users,
  loading,
  error,
  selectedUsers,
  onSelectUser,
  onSelectAll,
  onView,
  onBan,
  onUnban,
  isProcessing,
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorDisplay message={error.message || 'Failed to load users'} />
      </div>
    );
  }

  return (
    <div className="px-6 py-4">
      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <DataTable
          columns={userColumns.map((col) =>
            col.accessor === 'actions'
              ? {
                  ...col,
                  Cell: (props) =>
                    col.Cell({
                      ...props,
                      onView,
                      onBan,
                      onUnban,
                      isProcessing,
                    }),
                }
              : col
          )}
          data={users || []}
          onSelect={onSelectUser}
          onSelectAll={onSelectAll}
          selectedItems={selectedUsers}
          isProcessing={isProcessing}
        />
      </div>
    </div>
  );
};
