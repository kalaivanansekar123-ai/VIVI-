// src/components/SortSelect.jsx
import React from 'react';

/**
 * SortSelect renders a dropdown to choose sorting order.
 * Props:
 *   onChange: (value: string) => void – called with selected sort key.
 */
const SortSelect = ({ onChange }) => {
  return (
    <select
      className="border rounded-md py-1 px-2 focus:outline-none"
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">Default</option>
      <option value="price_asc">Price: Low → High</option>
      <option value="price_desc">Price: High → Low</option>
      <option value="newest">Newest</option>
    </select>
  );
};

export default SortSelect;
