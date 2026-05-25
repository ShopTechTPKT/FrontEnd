import React from "react";
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";

const TableSortHeader = ({ label, sortKey, currentSort, onSort, className = "" }) => {
  const isSorted = currentSort?.key === sortKey;
  const isAsc = isSorted && currentSort?.direction === "asc";

  return (
    <th 
      className={`cursor-pointer hover:bg-[var(--color-bg-muted)] transition-colors ${className}`}
      onClick={() => onSort(sortKey)}
    >
      <div className="flex items-center gap-1.5">
        <span>{label}</span>
        <span className="text-[var(--color-text-muted)] flex flex-col opacity-50">
          {!isSorted ? (
            <FaSort size={12} className="opacity-70" />
          ) : isAsc ? (
            <FaSortUp size={12} className="text-[var(--color-primary)] opacity-100" />
          ) : (
            <FaSortDown size={12} className="text-[var(--color-primary)] opacity-100" />
          )}
        </span>
      </div>
    </th>
  );
};

export default TableSortHeader;
