import React from "react";
import { FaAngleDoubleLeft, FaAngleDoubleRight } from "react-icons/fa";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  // Number of pages to show based on screen size
  const getVisiblePages = () => {
    if (window.innerWidth <= 640) {
      // Small screens (e.g., phones)
      return 2;
    } else if (window.innerWidth <= 1024) {
      // Medium screens (e.g., tablets)
      return 7;
    } else {
      // Large screens (e.g., desktops)
      return 9;
    }
  };

  const visiblePages = getVisiblePages();
  const pages = [...Array(totalPages).keys()].map((num) => num + 1);

  // Calculate pagination range
  const startPage = Math.max(
    1,
    Math.min(
      currentPage - Math.floor(visiblePages / 2),
      totalPages - visiblePages + 1
    )
  );
  const endPage = Math.min(totalPages, startPage + visiblePages - 1);

  // Handle previous page click
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  // Handle next page click
  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className="flex items-center justify-center space-x-2 mt-4">
      <button
        onClick={handlePrevious}
        disabled={currentPage === 1}
        className={`px-3 py-1 border dark:border-gray-600 flex justify-center items-center gap-1 rounded ${
          currentPage === 1 ? "bg-gray-300 dark:bg-darkCard" : "bg-white dark:bg-darkCard hover:bg-gray-200"
        }`}
      >
        <FaAngleDoubleLeft />{" "}
        <span>{window.innerWidth >= 640 && "Previous"}</span>
      </button>

      {startPage > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className="px-3 py-1 border dark:border-gray-600  rounded bg-white dark:bg-darkCard hover:bg-gray-200"
          >
            1
          </button>
          {startPage > 2 && (
            <span className="px-3 py-1 border rounded dark:bg-darkCard bg-white">...</span>
          )}
        </>
      )}

      {pages.slice(startPage - 1, endPage).map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 py-1 border dark:border-gray-600  rounded ${
            page === currentPage
              ? "bg-ternary text-white"
              : "bg-white dark:bg-darkCard hover:bg-gray-200"
          }`}
        >
          {page}
        </button>
      ))}

      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && (
            <span className="px-3 py-1 dark:border-gray-600  border rounded dark:bg-darkCard bg-white">...</span>
          )}
          <button
            onClick={() => onPageChange(totalPages)}
            className="px-3 py-1 border rounded bg-white dark:bg-darkCard hover:bg-gray-200"
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className={`px-3 flex justify-center dark:border-gray-600  dark:bg-darkCard items-center gap-1 py-1 border rounded ${
          currentPage === totalPages
            ? "bg-gray-300"
            : "bg-white dark:bg-darkCard hover:bg-gray-200"
        }`}
      >
        <span>{window.innerWidth >= 640 && "Next"}</span> <FaAngleDoubleRight />
      </button>
    </div>
  );
};

export default Pagination;
