import React from 'react';

const SeasonSelector = ({ currentYear, onYearChange }) => {
  // Generate list of years from 2026 down to 2016
  const years = Array.from({ length: 2026 - 2016 + 1 }, (_, i) => 2026 - i);

  return (
    <div className="season-selector">
      <label htmlFor="season-select" className="season-label">Season:</label>
      <select 
        id="season-select"
        value={currentYear} 
        onChange={(e) => onYearChange(parseInt(e.target.value))}
        className="season-dropdown"
      >
        {years.map(year => (
          <option key={year} value={year}>
            {year - 1}-{String(year).slice(-2)}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SeasonSelector;
