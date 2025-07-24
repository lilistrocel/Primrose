import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import type { CatalogFilters } from '../../types/inventory';
import { CATEGORIES, DIETARY_RESTRICTIONS, ALLERGENS } from '../../types/inventory';

interface InventoryFiltersProps {
  filters: CatalogFilters;
  onFiltersChange: (filters: CatalogFilters) => void;
  onReset: () => void;
  isLoading?: boolean;
}

export const InventoryFilters: React.FC<InventoryFiltersProps> = ({
  filters,
  onFiltersChange,
  onReset,
  isLoading = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, search: e.target.value, page: 1 });
  };

  const handleCategoryChange = (category: string) => {
    onFiltersChange({ 
      ...filters, 
      category: category === filters.category ? undefined : category, 
      page: 1 
    });
  };

  const handleDietaryRestrictionToggle = (restriction: string) => {
    const current = filters.dietaryRestrictions || [];
    const updated = current.includes(restriction)
      ? current.filter(r => r !== restriction)
      : [...current, restriction];
    
    onFiltersChange({ 
      ...filters, 
      dietaryRestrictions: updated.length > 0 ? updated : undefined, 
      page: 1 
    });
  };

  const handleAllergenToggle = (allergen: string) => {
    const current = filters.excludeAllergens || [];
    const updated = current.includes(allergen)
      ? current.filter(a => a !== allergen)
      : [...current, allergen];
    
    onFiltersChange({ 
      ...filters, 
      excludeAllergens: updated.length > 0 ? updated : undefined, 
      page: 1 
    });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [sortBy, sortOrder] = e.target.value.split('-');
    onFiltersChange({ 
      ...filters, 
      sortBy: sortBy as any, 
      sortOrder: sortOrder as 'asc' | 'desc' 
    });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.category) count++;
    if (filters.dietaryRestrictions?.length) count++;
    if (filters.excludeAllergens?.length) count++;
    return count;
  };

  const formatCategoryName = (category: string) => {
    return category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="card bg-white">
      {/* Search Bar */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Search items, ingredients, or nutrients..."
            value={filters.search || ''}
            onChange={handleSearchChange}
            className="w-full"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setIsExpanded(!isExpanded)}
            className="whitespace-nowrap"
          >
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
            </svg>
            Filters
            {getActiveFilterCount() > 0 && (
              <span className="ml-2 bg-primary-100 text-primary-800 text-xs font-medium px-2 py-1 rounded-full">
                {getActiveFilterCount()}
              </span>
            )}
          </Button>

          {getActiveFilterCount() > 0 && (
            <Button
              variant="outline"
              onClick={onReset}
              className="text-gray-600"
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Sort Dropdown */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Sort by:</label>
          <select
            value={`${filters.sortBy || 'name'}-${filters.sortOrder || 'asc'}`}
            onChange={handleSortChange}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="category-asc">Category (A-Z)</option>
            <option value="calories-asc">Calories (Low to High)</option>
            <option value="calories-desc">Calories (High to Low)</option>
            <option value="protein-desc">Protein (High to Low)</option>
            <option value="protein-asc">Protein (Low to High)</option>
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="space-y-6 border-t pt-6">
          {/* Categories */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Categories</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={`
                    px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left
                    ${filters.category === category
                      ? 'bg-primary-100 text-primary-800 border-primary-200'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200'
                    }
                    border
                  `}
                >
                  {formatCategoryName(category)}
                </button>
              ))}
            </div>
          </div>

          {/* Dietary Restrictions */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Dietary Preferences</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
              {DIETARY_RESTRICTIONS.map((restriction) => (
                <button
                  key={restriction}
                  onClick={() => handleDietaryRestrictionToggle(restriction)}
                  className={`
                    px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left
                    ${filters.dietaryRestrictions?.includes(restriction)
                      ? 'bg-green-100 text-green-800 border-green-200'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200'
                    }
                    border
                  `}
                >
                  <div className="flex items-center">
                    <span className="mr-2">
                      {filters.dietaryRestrictions?.includes(restriction) ? '✓' : '○'}
                    </span>
                    {formatCategoryName(restriction)}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Exclude Allergens */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Exclude Allergens</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {ALLERGENS.map((allergen) => (
                <button
                  key={allergen}
                  onClick={() => handleAllergenToggle(allergen)}
                  className={`
                    px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left
                    ${filters.excludeAllergens?.includes(allergen)
                      ? 'bg-red-100 text-red-800 border-red-200'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200'
                    }
                    border
                  `}
                >
                  <div className="flex items-center">
                    <span className="mr-2">
                      {filters.excludeAllergens?.includes(allergen) ? '🚫' : '○'}
                    </span>
                    {formatCategoryName(allergen)}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Filters */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Filters</h3>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onFiltersChange({ 
                  ...filters, 
                  sortBy: 'protein', 
                  sortOrder: 'desc' 
                })}
              >
                🥩 High Protein
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onFiltersChange({ 
                  ...filters, 
                  sortBy: 'calories', 
                  sortOrder: 'asc' 
                })}
              >
                🔥 Low Calorie
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onFiltersChange({ 
                  ...filters, 
                  dietaryRestrictions: ['vegan'] 
                })}
              >
                🌱 Vegan
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onFiltersChange({ 
                  ...filters, 
                  dietaryRestrictions: ['gluten-free'] 
                })}
              >
                🌾 Gluten-Free
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onFiltersChange({ 
                  ...filters, 
                  dietaryRestrictions: ['keto-friendly'] 
                })}
              >
                🥑 Keto
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
          <span className="ml-2 text-sm text-gray-600">Searching...</span>
        </div>
      )}
    </div>
  );
}; 