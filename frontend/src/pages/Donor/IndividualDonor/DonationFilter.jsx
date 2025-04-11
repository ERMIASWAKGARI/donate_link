import { Search, Filter, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import {
  setFilters,
  resetFilters,
  fetchFilteredNeeds,
} from "../../../redux/needSlice";

const DonationFilter = ({ categories }) => {
  const dispatch = useDispatch();
  const { filters } = useSelector((state) => state.needs);

  const handleSearchChange = (value) => {
    const newFilters = { ...filters, searchTerm: value };
    dispatch(setFilters(newFilters));
    dispatch(fetchFilteredNeeds(newFilters));
  };

  const handleCategoryChange = (value) => {
    const newFilters = { ...filters, category: value };
    dispatch(setFilters(newFilters));
    dispatch(fetchFilteredNeeds(newFilters));
  };

  const handleReset = () => {
    dispatch(resetFilters());
    dispatch(fetchFilteredNeeds({ searchTerm: "", category: "all" }));
    if (document.getElementById("searchInput")) {
      document.getElementById("searchInput").value = "";
    }
    const selectElement = document.querySelector("select");
    if (selectElement) {
      selectElement.value = "all";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8"
    >
      <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
        {/* Search Input */}
        <div className="flex-1 relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-green-600 transition-colors">
            <Search className="h-5 w-5" />
          </div>
          <input
            type="text"
            onChange={(e) => handleSearchChange(e.target.value)}
            defaultValue={filters.searchTerm}
            className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
            placeholder=" search "
            id="searchInput"
          />
          {/* <label
            htmlFor="searchInput"
            className="absolute left-9 top-3 text-gray-400 pointer-events-none transition-all duration-200 group-focus-within:text-xs group-focus-within:-translate-y-4 group-focus-within:text-green-600 peer-placeholder-shown:text-base peer-placeholder-shown:translate-y-0"
          >
            Search...
          </label> */}
        </div>

        {/* Category Select */}
        <div className="relative w-full md:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Filter className="h-5 w-5" />
          </div>
          <select
            onChange={(e) => handleCategoryChange(e.target.value)}
            defaultValue={filters.category}
            className="appearance-none block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white cursor-pointer transition-all duration-200"
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
            <ChevronDown className="h-5 w-5" />
          </div>
        </div>

        {/* Reset Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleCategoryChange("service")}
          className="px-4 py-3 text-gray-500 hover:text-green-600 font-medium rounded-lg border border-gray-200 hover:border-green-300 transition-colors"
        >
          service
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleReset}
          className="px-4 py-3 text-gray-500 hover:text-green-600 font-medium rounded-lg border border-gray-200 hover:border-green-300 transition-colors"
        >
          Reset
        </motion.button>
      </div>

      {/* Active Filters Display */}
      {(filters.searchTerm || filters.category !== "all") && (
        <div className="mt-4 flex flex-wrap gap-2">
          {filters.searchTerm && (
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center">
              Search: {filters.searchTerm}
              <button
                onClick={() => handleSearchChange("")}
                className="ml-1 text-green-600 hover:text-green-800"
              >
                ×
              </button>
            </span>
          )}
          {filters.category !== "all" && (
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center">
              Category: {filters.category}
              <button
                onClick={() => handleCategoryChange("all")}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default DonationFilter;
