/* eslint-disable react/prop-types */
const DataTable = ({
  columns,
  data = [],
  onSelect,
  onSelectAll,
  selectedItems,
  isProcessing,
}) => {
  const allSelected = selectedItems.length === data.length && data.length > 0;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              <input
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                checked={allSelected}
                onChange={() => onSelectAll(!allSelected)}
                disabled={isProcessing || data.length === 0}
              />
            </th>
            {columns.map((column) => (
              <th
                key={column.Header}
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {column.Header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map(
            (
              row,
              index // Add index parameter here
            ) => (
              <tr key={row._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(row._id)}
                    onChange={() => onSelect(row._id)}
                    disabled={isProcessing}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                </td>
                {columns.map((column) => (
                  <td
                    key={`${row._id}-${column.accessor}`}
                    className="px-6 py-4 whitespace-nowrap"
                  >
                    {column.Cell
                      ? column.Cell({
                          row: { original: row, index }, // Pass index here
                          value: row[column.accessor],
                          isProcessing,
                        })
                      : row[column.accessor]}
                  </td>
                ))}
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
};
export default DataTable;
