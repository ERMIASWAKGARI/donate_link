import { useState, useMemo } from "react";
import PropTypes from "prop-types";

const DataTable = ({
  columns,
  data,
  onRowClick,
  selectable = false,
  bulkActions = [],
}) => {
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return data;
    return [...data].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  }, [data, sortConfig]);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const toggleRow = (id) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  const toggleAllRows = () => {
    if (selectedRows.size === data.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(data.map((item) => item._id)));
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {bulkActions.length > 0 && selectedRows.size > 0 && (
        <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-b">
          <div className="text-sm text-gray-500">
            {selectedRows.size} selected
          </div>
          <div className="space-x-2">
            {bulkActions.map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={() => action.action(Array.from(selectedRows))}
                className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700"
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {selectable && (
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    checked={selectedRows.size === data.length}
                    onChange={toggleAllRows}
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.accessor}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => column.sortable && handleSort(column.accessor)}
                  onKeyDown={(e) =>
                    column.sortable &&
                    e.key === "Enter" &&
                    handleSort(column.accessor)
                  }
                  role="columnheader"
                  tabIndex={column.sortable ? 0 : -1}
                >
                  <div className="flex items-center">
                    {column.header}
                    {column.sortable && (
                      <span className="ml-2">
                        {sortConfig.key === column.accessor
                          ? sortConfig.direction === "asc"
                            ? "↑"
                            : "↓"
                          : "↕"}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedData.map((row) => (
              <tr
                key={row._id}
                className={`hover:bg-gray-50 ${
                  onRowClick ? "cursor-pointer" : ""
                }`}
                onClick={() => onRowClick && onRowClick(row)}
                onKeyDown={(e) =>
                  onRowClick && e.key === "Enter" && onRowClick(row)
                }
                role="row"
                tabIndex={onRowClick ? 0 : -1}
              >
                {selectable && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      checked={selectedRows.has(row._id)}
                      onChange={() => toggleRow(row._id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
                )}
                {columns.map((column) => (
                  <td
                    key={column.accessor}
                    className="px-6 py-4 whitespace-nowrap"
                  >
                    {column.cell ? column.cell(row) : row[column.accessor]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

DataTable.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      header: PropTypes.string.isRequired,
      accessor: PropTypes.string.isRequired,
      sortable: PropTypes.bool,
      cell: PropTypes.func,
    })
  ).isRequired,
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  onRowClick: PropTypes.func,
  selectable: PropTypes.bool,
  bulkActions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      action: PropTypes.func.isRequired,
    })
  ),
};

DataTable.defaultProps = {
  onRowClick: null,
  selectable: false,
  bulkActions: [],
};

export default DataTable;
