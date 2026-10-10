// src/components/SearchBar.jsx
import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

/**
 * SearchBar component with debounce.
 * Props:
 *   onSearch: function to call with the search term
 *   placeholder: placeholder text for the input
 */
const SearchBar = ({ onSearch, placeholder = 'Search...' }) => {
  const [value, setValue] = useState('');
  // debounce: wait 300ms after user stops typing
  useEffect(() => {
    const handler = setTimeout(() => {
      onSearch(value.trim());
    }, 300);
    return () => clearTimeout(handler);
  }, [value, onSearch]);

  return (
    <div className="flex items-center w-full md:w-1/3 border rounded-md overflow-hidden bg-white">
      <span className="px-2 text-gray-500">
        <Search size={20} />
      </span>
      <input
        type="text"
        className="flex-1 py-2 px-2 text-sm outline-none"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  );
};

export default SearchBar;
