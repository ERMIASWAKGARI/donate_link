import { useState } from 'react';

// eslint-disable-next-line react/prop-types
const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="flex">
      <input
        type="text"
        placeholder="Search users..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="border border-gray-300  px-4 py-2 focus:outline-none focus:ring-1 focus:ring-[#008080]"
      />
      <button
        type="submit"
        className="flex items-center gap-1  px-3 py-1.5 rounded-md text-sm font-medium transition duration-200 text-gray-700 hover:bg-teal-100 border border-[#008080]"
      >
        Search
      </button>
    </form>
  );
};

export default SearchBar;
