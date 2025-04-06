/* eslint-disable react/prop-types */
import DataTable from '../common/DataTable';
import ErrorDisplay from '../common/ErrorDisplay';
import Spinner from '../common/Spinner ';
import StatusBadge from '../common/StatusBadge';

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
    Header: 'ID',
    accessor: '_id',
    Cell: ({ value }) => (
      <span className="text-sm text-gray-600">
        {value ? value.slice(0, 6) + '...' : 'N/A'}
      </span>
    ),
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
    Header: 'Status',
    accessor: 'status',
    Cell: ({ row }) => {
      const user = row.original || {};
      return (
        <StatusBadge
          isBanned={user.isBanned || false}
          isVerified={user.isVerified || false}
        />
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
            className="px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm flex items-center"
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
              className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
            >
              Unban
            </button>
          ) : (
            <button
              onClick={() => onBan(userId)}
              className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
            >
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
        <Spinner size="lg" color="indigo" />
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
