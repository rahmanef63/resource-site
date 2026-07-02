import { Search, Filter, ArrowUpDown } from "lucide-react";
import { useState } from "react";

interface SearchFilterSortProps {
  searchPlaceholder: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  sortOptions: { value: string; label: string }[];
  sortValue: string;
  onSortChange: (value: string) => void;
  filterOptions?: { value: string; label: string }[];
  filterValue?: string;
  onFilterChange?: (value: string) => void;
}

export function SearchFilterSort({
  searchPlaceholder,
  searchValue,
  onSearchChange,
  sortOptions,
  sortValue,
  onSortChange,
  filterOptions,
  filterValue,
  onFilterChange,
}: SearchFilterSortProps) {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-8">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-foreground/40" />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      
      <div className="flex gap-2">
        {filterOptions && filterValue !== undefined && onFilterChange && (
          <div className="relative">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-muted transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filter</span>
            </button>
            {showFilters && (
              <div className="absolute right-0 mt-2 w-48 bg-background border rounded-lg shadow-lg z-10">
                {filterOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      onFilterChange(option.value);
                      setShowFilters(false);
                    }}
                    className={`w-full text-left px-4 py-2 hover:bg-muted transition-colors ${
                      filterValue === option.value ? "bg-muted font-medium" : ""
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        
        <div className="relative">
          <ArrowUpDown className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-foreground/40 pointer-events-none" />
          <select
            value={sortValue}
            onChange={(e) => onSortChange(e.target.value)}
            className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary appearance-none bg-background"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
