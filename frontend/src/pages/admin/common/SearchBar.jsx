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
        className="bg-yellow-400 text-green-900 px-3 py-1 text-sm font-medium hover:bg-yellow-500 transition-colors shadow-sm"
      >
        Search
      </button>
    </form>
  );
};

export default SearchBar;
