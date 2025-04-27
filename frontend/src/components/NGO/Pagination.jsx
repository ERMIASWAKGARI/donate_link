import { FaChevronRight, FaChevronLeft } from "react-icons/fa";

const Pagination = ({ current, total, pageSize, onChange }) => {
  const totalPages = Math.ceil(total / pageSize);

  // Calculate the range of pages to show
  const getPageRange = () => {
    const range = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        range.push(i);
      }
    } else {
      const leftOffset = Math.floor(maxVisiblePages / 2);
      const rightOffset = Math.ceil(maxVisiblePages / 2) - 1;

      let start = current - leftOffset;
      let end = current + rightOffset;

      if (start < 1) {
        start = 1;
        end = maxVisiblePages;
      }

      if (end > totalPages) {
        start = totalPages - (maxVisiblePages - 1);
        end = totalPages;
      }

      for (let i = start; i <= end; i++) {
        range.push(i);
      }

      // Add ellipsis if needed
      if (start > 1) {
        range.unshift("...");
        range.unshift(1);
      }

      if (end < totalPages) {
        range.push("...");
        range.push(totalPages);
      }
    }

    return range;
  };

  return (
    <div className="mt-8 flex justify-center">
      <nav className="inline-flex rounded-md shadow-sm">
        <button
          onClick={() => onChange(current - 1)}
          disabled={current === 1}
          className={`px-3 py-2 rounded-l-md ${
            current === 1
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white text-gray-700 hover:bg-gray-50"
          }`}
        >
          <FaChevronLeft />
        </button>

        {getPageRange().map((page, index) => (
          <button
            key={index}
            onClick={() => (typeof page === "number" ? onChange(page) : null)}
            className={`px-4 py-2 ${
              current === page
                ? "bg-primary text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            } ${typeof page !== "number" ? "cursor-default" : ""}`}
            disabled={typeof page !== "number"}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => onChange(current + 1)}
          disabled={current === totalPages}
          className={`px-3 py-2 rounded-r-md ${
            current === totalPages
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white text-gray-700 hover:bg-gray-50"
          }`}
        >
          <FaChevronRight />
        </button>
      </nav>
    </div>
  );
};

export default Pagination;
