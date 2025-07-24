import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { InventoryCard } from '../components/inventory/InventoryCard';
import { InventoryFilters } from '../components/inventory/InventoryFilters';
import { Button } from '../components/ui/Button';
import inventoryApi from '../services/inventoryApi';
import type { InventoryItem, CatalogFilters } from '../types/inventory';

export const CatalogPage: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<CatalogFilters>({
    page: 1,
    limit: 12,
    sortBy: 'name',
    sortOrder: 'asc'
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 12,
    hasNextPage: false,
    hasPreviousPage: false
  });
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [categories, setCategories] = useState<{category: string, count: number}[]>([]);

  // Load items
  const loadItems = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await inventoryApi.getCatalog(filters);
      setItems(data.items);
      setPagination(data.pagination);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load items');
    } finally {
      setIsLoading(false);
    }
  };

  // Load categories
  const loadCategories = async () => {
    try {
      const categoryData = await inventoryApi.getCategories();
      setCategories(categoryData);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  useEffect(() => {
    loadItems();
  }, [filters]);

  useEffect(() => {
    loadCategories();
  }, []);

  const handleFiltersChange = (newFilters: CatalogFilters) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters({
      page: 1,
      limit: 12,
      sortBy: 'name',
      sortOrder: 'asc'
    });
  };

  const handleItemClick = (item: InventoryItem) => {
    navigate(`/catalog/items/${item.id}`);
  };

  const handleCompareToggle = (item: InventoryItem) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(item.id)) {
      newSelected.delete(item.id);
    } else {
      if (newSelected.size >= 5) {
        alert('You can compare up to 5 items at a time');
        return;
      }
      newSelected.add(item.id);
    }
    setSelectedItems(newSelected);
  };

  const handleCompareItems = () => {
    if (selectedItems.size < 2) {
      alert('Please select at least 2 items to compare');
      return;
    }
    const itemIds = Array.from(selectedItems);
    navigate(`/catalog/compare?items=${itemIds.join(',')}`);
  };

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getQuickStats = () => {
    if (items.length === 0) return null;
    
    const totalCalories = items.reduce((sum, item) => sum + item.nutritionalInfo.calories, 0);
    const avgCalories = Math.round(totalCalories / items.length);
    const highProteinCount = items.filter(item => item.nutritionalInfo.protein > 10).length;
    const veganCount = items.filter(item => 
      item.healthProperties.dietaryRestrictions.includes('vegan')
    ).length;

    return { avgCalories, highProteinCount, veganCount };
  };

  const stats = getQuickStats();

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={loadItems}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Food Catalog</h1>
              <p className="text-gray-600 mt-1">
                Discover nutritional information for thousands of ingredients
              </p>
            </div>
            
            {selectedItems.size > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">
                  {selectedItems.size} item{selectedItems.size > 1 ? 's' : ''} selected
                </span>
                <Button
                  onClick={handleCompareItems}
                  disabled={selectedItems.size < 2}
                  className="bg-primary-600 hover:bg-primary-700"
                >
                  Compare Items
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedItems(new Set())}
                >
                  Clear
                </Button>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-gray-900">{pagination.totalItems}</div>
                <div className="text-sm text-gray-600">Total Items</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-orange-600">{stats.avgCalories}</div>
                <div className="text-sm text-orange-700">Avg Calories</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-600">{stats.highProteinCount}</div>
                <div className="text-sm text-blue-700">High Protein</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600">{stats.veganCount}</div>
                <div className="text-sm text-green-700">Vegan Options</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="mb-8">
          <InventoryFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onReset={handleResetFilters}
            isLoading={isLoading}
          />
        </div>

        {/* Results */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {filters.search || filters.category ? 'Search Results' : 'All Items'}
              </h2>
              <p className="text-sm text-gray-600">
                Showing {items.length} of {pagination.totalItems} items
                {filters.search && ` for "${filters.search}"`}
                {filters.category && ` in ${filters.category}`}
              </p>
            </div>
          </div>
        </div>

        {/* Items Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-20 bg-gray-200 rounded mb-4"></div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-16 bg-gray-200 rounded"></div>
                  <div className="h-16 bg-gray-200 rounded"></div>
                  <div className="h-16 bg-gray-200 rounded"></div>
                  <div className="h-16 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No items found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search criteria or browse our categories
            </p>
            <Button variant="outline" onClick={handleResetFilters}>
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <InventoryCard
                key={item.id}
                item={item}
                onClick={() => handleItemClick(item)}
                showCompareButton
                onCompare={handleCompareToggle}
                isSelected={selectedItems.has(item.id)}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center mt-12 space-x-2">
            <Button
              variant="outline"
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={!pagination.hasPreviousPage}
            >
              Previous
            </Button>
            
            {[...Array(pagination.totalPages)].map((_, i) => {
              const page = i + 1;
              const isCurrentPage = page === pagination.currentPage;
              const showPage = 
                page === 1 ||
                page === pagination.totalPages ||
                Math.abs(page - pagination.currentPage) <= 2;

              if (!showPage) {
                if (page === pagination.currentPage - 3 || page === pagination.currentPage + 3) {
                  return <span key={page} className="px-2">...</span>;
                }
                return null;
              }

              return (
                <Button
                  key={page}
                  variant={isCurrentPage ? 'primary' : 'outline'}
                  onClick={() => handlePageChange(page)}
                  className="min-w-[40px]"
                >
                  {page}
                </Button>
              );
            })}

            <Button
              variant="outline"
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNextPage}
            >
              Next
            </Button>
          </div>
        )}

        {/* Categories Quick Access */}
        {categories.length > 0 && !filters.category && (
          <div className="mt-16">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Browse by Category</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {categories.map((cat) => (
                <button
                  key={cat.category}
                  onClick={() => handleFiltersChange({ ...filters, category: cat.category, page: 1 })}
                  className="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow text-left"
                >
                  <div className="font-medium text-gray-900 capitalize">
                    {cat.category.replace('-', ' ')}
                  </div>
                  <div className="text-sm text-gray-600">{cat.count} items</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 