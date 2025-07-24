import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { InventoryCard } from '../components/inventory/InventoryCard';
import { InventoryFilters } from '../components/inventory/InventoryFilters';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import inventoryApi from '../services/inventoryApi';
import type { InventoryItem, CatalogFilters } from '../types/inventory';

export const AdminInventoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<CatalogFilters>({
    page: 1,
    limit: 12,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 12,
    hasNextPage: false,
    hasPreviousPage: false
  });
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Check if user is admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Load items
  const loadItems = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await inventoryApi.getAdminItems(filters);
      setItems(data.items);
      setPagination(data.pagination);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load items');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, [filters]);

  const handleFiltersChange = (newFilters: CatalogFilters) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters({
      page: 1,
      limit: 12,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
  };

  const handleCreateItem = () => {
    navigate('/admin/inventory/create');
  };

  const handleEditItem = (item: InventoryItem) => {
    navigate(`/admin/inventory/edit/${item.id}`);
  };

  const handleDeleteItem = async (item: InventoryItem) => {
    if (!confirm(`Are you sure you want to delete "${item.name}"? This will make it unavailable to users.`)) {
      return;
    }

    try {
      setIsDeleting(item.id);
      await inventoryApi.deleteItem(item.id);
      
      // Refresh the list
      await loadItems();
      
      // Show success message
      alert(`"${item.name}" has been marked as unavailable.`);
    } catch (err: any) {
      alert(`Failed to delete item: ${err.response?.data?.message || 'Unknown error'}`);
    } finally {
      setIsDeleting(null);
    }
  };

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getStats = () => {
    const available = items.filter(item => item.isAvailable).length;
    const unavailable = items.filter(item => !item.isAvailable).length;
    const totalCategories = new Set(items.map(item => item.category)).size;
    
    return { available, unavailable, totalCategories };
  };

  const stats = getStats();

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">You need admin privileges to access this page.</p>
          <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
        </div>
      </div>
    );
  }

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
              <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
              <p className="text-gray-600 mt-1">
                Manage food items, nutritional data, and availability
              </p>
            </div>
            
            <Button
              onClick={handleCreateItem}
              className="bg-primary-600 hover:bg-primary-700"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add New Item
            </Button>
          </div>

          {/* Admin Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-900">{pagination.totalItems}</div>
              <div className="text-sm text-gray-600">Total Items</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">{stats.available}</div>
              <div className="text-sm text-green-700">Available</div>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-red-600">{stats.unavailable}</div>
              <div className="text-sm text-red-700">Unavailable</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.totalCategories}</div>
              <div className="text-sm text-blue-700">Categories</div>
            </div>
          </div>
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
            <div className="text-gray-400 text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No items found</h3>
            <p className="text-gray-600 mb-4">
              {filters.search || filters.category
                ? 'Try adjusting your search criteria'
                : 'Start by adding your first inventory item'
              }
            </p>
            <div className="space-x-4">
              {filters.search || filters.category ? (
                <Button variant="outline" onClick={handleResetFilters}>
                  Clear Filters
                </Button>
              ) : null}
              <Button onClick={handleCreateItem}>
                Add New Item
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Admin Actions Bar */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Bulk actions (coming soon): Export data, bulk edit, import from CSV
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    Export CSV
                  </Button>
                  <Button variant="outline" size="sm">
                    Import CSV
                  </Button>
                </div>
              </div>
            </div>

            {/* Items Grid with Admin Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {items.map((item) => (
                <div key={item.id} className="relative">
                  <InventoryCard
                    item={item}
                    onClick={() => handleEditItem(item)}
                    showAdminDetails={true}
                  />
                  
                  {/* Admin Action Buttons */}
                  <div className="absolute top-2 right-2 flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditItem(item);
                      }}
                      className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow text-blue-600 hover:text-blue-700"
                      title="Edit item"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteItem(item);
                      }}
                      disabled={isDeleting === item.id}
                      className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow text-red-600 hover:text-red-700 disabled:opacity-50"
                      title={item.isAvailable ? "Mark as unavailable" : "Already unavailable"}
                    >
                      {isDeleting === item.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                      ) : (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
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
      </div>
    </div>
  );
}; 