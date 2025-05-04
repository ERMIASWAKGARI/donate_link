import React, { useState } from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import SkeletonLoader from "./SkeletonLoader"; // Import the SkeletonLoader component
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";

const Table = ({ columns, data, DetailComponent, loading, error }) => {
  const [expandedRows, setExpandedRows] = useState([]);

  const handleRowClick = (rowIndex) => {
    const isRowCurrentlyExpanded = expandedRows.includes(rowIndex);
    const newExpandedRows = isRowCurrentlyExpanded
      ? expandedRows.filter((index) => index !== rowIndex)
      : [...expandedRows, rowIndex];

    setExpandedRows(newExpandedRows);
  };

  // Define columns for react-table
  const tableColumns = React.useMemo(
    () =>
      columns.map((col) => ({
        accessorKey: col, // Use the column name as the accessor key
        header: col, // Use the column name as the header
        cell: (info) => info.getValue(), // Render the cell value directly
      })),
    [columns]
  );

  // Use the useReactTable hook
  const table = useReactTable({
    data,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="overflow-x-scroll w-full">
      <table className="min-w-full border-collapse dark:bg-darkCard table">
        <thead className="table-header-group">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr
              key={headerGroup.id}
              className="border dark:border-gray-800 dark:text-darkText table-row"
            >
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="p-2 cursor-pointer font-semibold text-left table-cell"
                  onClick={header.column.getToggleSortingHandler()}
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                  {{
                    asc: " 🔼",
                    desc: " 🔽",
                  }[header.column.getIsSorted()] ?? null}
                </th>
              ))}
              {DetailComponent && (
                <th className="p-2  dark:border-gray-800 font-semibold text-left table-cell"></th>
              )}
            </tr>
          ))}
        </thead>
        {loading ? (
          <SkeletonLoader rows={5} columns={columns} />
        ) : error ? (
          <tbody>
            <tr className="dark:border-gray-800">
              <td
                colSpan={columns.length + 1}
                className="text-red-800 bg-yellow-300 p-1 px-2 text-center"
              >
                {error}
              </td>
            </tr>
          </tbody>
        ) : data.length > 0 ? (
          <tbody className="bg-white dark:border-gray-800 dark:bg-darkBg table-row-group">
            {table.getRowModel().rows.map((row, rowIndex) => (
              <React.Fragment key={row.id}>
                <tr className="border dark:border-gray-800 table-row">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="p-2 relative table-cell">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                  {DetailComponent && (
                    <td className="p-2 table-cell">
                      <button onClick={() => handleRowClick(rowIndex)}>
                        {expandedRows.includes(rowIndex) ? (
                          <FiChevronUp className="text-2xl" />
                        ) : (
                          <FiChevronDown className="text-2xl" />
                        )}
                      </button>
                    </td>
                  )}
                </tr>
                {expandedRows.includes(rowIndex) && DetailComponent && (
                  <tr className="border dark:border-gray-800 table-row">
                    <td colSpan={columns.length + 1} className="table-cell">
                      <DetailComponent
                        status={row.original?.status}
                        data={row.original?.tickets}
                        id={row.original?.id}
                      />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        ) : (
          <tbody>
            <tr>
              <td
                colSpan={columns.length + 1}
                className="text-red-800 bg-yellow-300 p-1 px-2 text-center"
              >
                No data found
              </td>
            </tr>
          </tbody>
        )}
      </table>
    </div>
  );
};

export default Table;
