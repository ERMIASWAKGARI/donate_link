import { Search, Filter, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";

const DonationFilter = ({ categories, onCategoryChange, onSearch }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8"
    >
      
      <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
        {/* Search Input with Floating Label */}
        <div className="flex-1 relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-green-600 transition-colors">
            <Search className="h-5 w-5" />
          </div>
          <input
            type="text"
            onChange={(e) => onSearch(e.target.value)}
            className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
            placeholder=" "
            id="searchInput"
          />
          <label 
            htmlFor="searchInput" 
            className="absolute left-9 top-3 text-gray-400 pointer-events-none transition-all duration-200 group-focus-within:text-xs group-focus-within:-translate-y-4 group-focus-within:text-green-600 peer-placeholder-shown:text-base peer-placeholder-shown:translate-y-0"
          >
            Search...
          </label>
        </div>
        
        {/* Enhanced Category Select */}
        <div className="relative w-full md:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Filter className="h-5 w-5" />
          </div>
          <select
            onChange={(e) => onCategoryChange(e.target.value)}
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

        {/* Reset Button (optional) */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            onSearch("");
            onCategoryChange("all");
            document.getElementById("searchInput").value = "";
            document.querySelector("select").value = "all";
          }}
          className="px-4 py-3 text-gray-500 hover:text-green-600 font-medium rounded-lg border border-gray-200 hover:border-green-300 transition-colors"
        >
          Reset
        </motion.button>
      </div>

      {/* Active Filters Display (optional) */}
      <div className="mt-4 flex flex-wrap gap-2">
        {/* This would dynamically show active filters */}
      </div>
    </motion.div>
  );
};

export default DonationFilter;