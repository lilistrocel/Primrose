import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import inventoryApi from '../services/inventoryApi';
import type { InventoryItem } from '../types/inventory';

interface ComparisonData {
  id: string;
  name: string;
  nutritionalInfo: InventoryItem['nutritionalInfo'];
  vitaminsAndMinerals?: InventoryItem['vitaminsAndMinerals'];
  healthProperties: InventoryItem['healthProperties'];
}

export const ComparisonPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [items, setItems] = useState<ComparisonData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const itemIds = searchParams.get('items')?.split(',') || [];
    if (itemIds.length === 0) {
      setError('No items to compare');
      setIsLoading(false);
      return;
    }

    loadComparison(itemIds);
  }, [searchParams]);

  const loadComparison = async (itemIds: string[]) => {
    try {
      setIsLoading(true);
      setError(null);
      const comparisonData = await inventoryApi.compareItems(itemIds);
      setItems(comparisonData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load comparison');
    } finally {
      setIsLoading(false);
    }
  };

  // Future use for nutritional percentage calculations
  // const getNutritionPercentage = (value: number, nutrient: string) => {
  //   const dailyValues: Record<string, number> = {
  //     calories: 2000, protein: 50, carbohydrates: 300, fat: 65, fiber: 25,
  //     sodium: 2300, calcium: 1000, iron: 18, vitaminC: 90
  //   };
  //   const daily = dailyValues[nutrient];
  //   if (!daily) return 0;
  //   return Math.min((value / daily) * 100, 100);
  // };

  const getBestValue = (nutrient: string, higher = true) => {
    if (items.length === 0) return null;
    
    const values = items.map(item => {
      if (nutrient in item.nutritionalInfo) {
        return item.nutritionalInfo[nutrient as keyof typeof item.nutritionalInfo] as number;
      }
      if (item.vitaminsAndMinerals && nutrient in item.vitaminsAndMinerals) {
        return item.vitaminsAndMinerals[nutrient as keyof typeof item.vitaminsAndMinerals] as number;
      }
      return 0;
    });

    const bestValue = higher ? Math.max(...values) : Math.min(...values);
    return values.indexOf(bestValue);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading comparison...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Comparison Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link to="/catalog">
            <Button>Back to Catalog</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Items to Compare</h2>
          <p className="text-gray-600 mb-4">Please select items from the catalog to compare.</p>
          <Link to="/catalog">
            <Button>Browse Catalog</Button>
          </Link>
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
              <h1 className="text-3xl font-bold text-gray-900">Nutrition Comparison</h1>
              <p className="text-gray-600 mt-1">
                Compare nutritional values per 100g serving
              </p>
            </div>
            <Link to="/catalog">
              <Button variant="outline">Back to Catalog</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Items Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
          {items.map((item) => (
            <div key={item.id} className="card text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.name}</h3>
              <div className="text-3xl font-bold text-primary-600">
                {item.nutritionalInfo.calories} kcal
              </div>
              <div className="text-sm text-gray-600">per 100g</div>
            </div>
          ))}
        </div>

        {/* Nutrition Comparison Table */}
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Nutritional Information</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nutrient (per 100g)
                  </th>
                  {items.map((item) => (
                    <th key={item.id} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {item.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* Macronutrients */}
                {[
                  { key: 'calories', label: 'Calories', unit: 'kcal', higher: false },
                  { key: 'protein', label: 'Protein', unit: 'g', higher: true },
                  { key: 'carbohydrates', label: 'Carbohydrates', unit: 'g', higher: false },
                  { key: 'fat', label: 'Total Fat', unit: 'g', higher: false },
                  { key: 'saturatedFat', label: 'Saturated Fat', unit: 'g', higher: false },
                  { key: 'fiber', label: 'Fiber', unit: 'g', higher: true },
                  { key: 'sugar', label: 'Sugar', unit: 'g', higher: false },
                  { key: 'sodium', label: 'Sodium', unit: 'mg', higher: false },
                  { key: 'cholesterol', label: 'Cholesterol', unit: 'mg', higher: false }
                ].map((nutrient) => {
                  const bestIndex = getBestValue(nutrient.key, nutrient.higher);
                  
                  return (
                    <tr key={nutrient.key}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {nutrient.label}
                      </td>
                      {items.map((item, index) => {
                        const value = item.nutritionalInfo[nutrient.key as keyof typeof item.nutritionalInfo] as number;
                        const isBest = bestIndex === index;
                        
                        return (
                          <td key={item.id} className={`px-6 py-4 whitespace-nowrap text-center text-sm ${isBest ? 'bg-green-50 text-green-900 font-semibold' : 'text-gray-900'}`}>
                            <div className="flex flex-col items-center">
                              <span>{value}{nutrient.unit}</span>
                              {isBest && (
                                <span className="text-xs text-green-600 mt-1">★ Best</span>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Vitamins & Minerals */}
        {items.some(item => item.vitaminsAndMinerals) && (
          <div className="card overflow-hidden mt-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Vitamins & Minerals</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vitamin/Mineral
                    </th>
                    {items.map((item) => (
                      <th key={item.id} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {item.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {[
                    { key: 'vitaminC', label: 'Vitamin C', unit: 'mg' },
                    { key: 'vitaminA', label: 'Vitamin A', unit: 'μg' },
                    { key: 'calcium', label: 'Calcium', unit: 'mg' },
                    { key: 'iron', label: 'Iron', unit: 'mg' },
                    { key: 'potassium', label: 'Potassium', unit: 'mg' },
                    { key: 'magnesium', label: 'Magnesium', unit: 'mg' }
                  ].map((vitamin) => {
                    const hasData = items.some(item => 
                      item.vitaminsAndMinerals && 
                      item.vitaminsAndMinerals[vitamin.key as keyof typeof item.vitaminsAndMinerals]
                    );

                    if (!hasData) return null;

                    const bestIndex = getBestValue(vitamin.key, true);
                    
                    return (
                      <tr key={vitamin.key}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {vitamin.label}
                        </td>
                        {items.map((item, index) => {
                          const value = item.vitaminsAndMinerals?.[vitamin.key as keyof typeof item.vitaminsAndMinerals] || 0;
                          const isBest = bestIndex === index && value > 0;
                          
                          return (
                            <td key={item.id} className={`px-6 py-4 whitespace-nowrap text-center text-sm ${isBest ? 'bg-green-50 text-green-900 font-semibold' : 'text-gray-900'}`}>
                              <div className="flex flex-col items-center">
                                <span>{value > 0 ? `${value}${vitamin.unit}` : '–'}</span>
                                {isBest && (
                                  <span className="text-xs text-green-600 mt-1">★ Best</span>
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Health Properties Comparison */}
        <div className="card mt-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Health Properties</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
            {items.map((item) => (
              <div key={item.id} className="space-y-4">
                <h3 className="font-semibold text-gray-900">{item.name}</h3>
                
                {/* Dietary Restrictions */}
                {item.healthProperties.dietaryRestrictions.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Dietary</h4>
                    <div className="flex flex-wrap gap-1">
                      {item.healthProperties.dietaryRestrictions.map((restriction) => (
                        <span key={restriction} className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                          {restriction}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Allergens */}
                {item.healthProperties.allergens.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Allergens</h4>
                    <div className="flex flex-wrap gap-1">
                      {item.healthProperties.allergens.map((allergen) => (
                        <span key={allergen} className="px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-full">
                          {allergen}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Antioxidant Level */}
                {item.healthProperties.antioxidantLevel && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Antioxidants</h4>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      item.healthProperties.antioxidantLevel === 'high' ? 'text-green-700 bg-green-100' :
                      item.healthProperties.antioxidantLevel === 'medium' ? 'text-yellow-700 bg-yellow-100' :
                      'text-gray-700 bg-gray-100'
                    }`}>
                      {item.healthProperties.antioxidantLevel}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mt-8">
          <Link to="/catalog">
            <Button variant="outline">Compare Different Items</Button>
          </Link>
          <Button onClick={() => window.print()}>
            Print Comparison
          </Button>
        </div>
      </div>
    </div>
  );
}; 