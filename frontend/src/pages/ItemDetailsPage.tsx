import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import inventoryApi from '../services/inventoryApi';
import type { InventoryItem } from '../types/inventory';

export const ItemDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [item, setItem] = useState<InventoryItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadItem(id);
    }
  }, [id]);

  const loadItem = async (itemId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const itemData = await inventoryApi.getCatalogItem(itemId);
      setItem(itemData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load item');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading item details...</p>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Item Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'This item could not be found.'}</p>
          <Button onClick={() => navigate('/catalog')} variant="outline">
            Browse Catalog
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{item.name}</h1>
              <p className="text-gray-600 mt-1">{item.category}</p>
            </div>
            <div className="flex items-center space-x-4">
              {user?.role === 'admin' && (
                <Link to={`/admin/inventory/edit/${item.id}`}>
                  <Button variant="outline">Edit Item</Button>
                </Link>
              )}
              <Button onClick={() => navigate('/catalog')}>
                Back to Catalog
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
          <p className="text-gray-700">{item.description}</p>
          
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Nutrition (per 100g)</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{item.nutritionalInfo.calories}</div>
                <div className="text-sm text-blue-700">Calories</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{item.nutritionalInfo.protein}g</div>
                <div className="text-sm text-green-700">Protein</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{item.nutritionalInfo.carbohydrates}g</div>
                <div className="text-sm text-yellow-700">Carbs</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{item.nutritionalInfo.fat}g</div>
                <div className="text-sm text-purple-700">Fat</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 