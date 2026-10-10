// src/components/CategoryFilter.jsx
import React, { useState } from 'react';
import { CATEGORIES } from '../utils/constants';

/**
 * CategoryFilter renders distinct product categories as horizontally scrollable chips.
 * Props:
 *   onSelect: (category: string) => void – called with selected category or '' for all.
 */
const CategoryFilter = ({ onSelect }) => {
  const [active, setActive] = useState('');

  const handleSelect = (cat) => {
    const newCat = cat === active ? '' : cat;
    setActive(newCat);
    onSelect(newCat);
  };

  return (
    <div className="flex space-x-2 overflow-x-auto py-2 no-scrollbar">
      <button
        onClick={() => handleSelect('')}
        className={`px-4 py-1 rounded-full whitespace-nowrap text-sm ${active === '' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800'}`}
      >
        All
      </button>
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => handleSelect(cat)}
          className={`px-4 py-1 rounded-full whitespace-nowrap text-sm ${active === cat ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800'}`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;
