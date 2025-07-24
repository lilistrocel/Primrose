import React from 'react';
import type { InventoryItem } from '../../types/inventory';

interface InventoryCardProps {
  item: InventoryItem;
  onClick?: () => void;
  showAdminDetails?: boolean;
  showCompareButton?: boolean;
  onCompare?: (item: InventoryItem) => void;
  isSelected?: boolean;
}

export const InventoryCard: React.FC<InventoryCardProps> = ({
  item,
  onClick,
  showAdminDetails = false,
  showCompareButton = false,
  onCompare,
  isSelected = false
}) => {
  const handleCardClick = () => {
    if (onClick) {
      onClick();
    }
  };

  const handleCompareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCompare) {
      onCompare(item);
    }
  };

  const formatCategoryName = (category: string) => {
    return category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getAntioxidantColor = (level?: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'high': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-400 bg-gray-50';
    }
  };

  const getStorageIcon = (temperature: string) => {
    switch (temperature) {
      case 'frozen':
        return '❄️';
      case 'refrigerated':
        return '🧊';
      case 'room-temperature':
        return '🌡️';
      case 'cool-dry-place':
        return '📦';
      default:
        return '📦';
    }
  };

  return (
    <div
      className={`
        card cursor-pointer transition-all duration-200 hover:shadow-lg
        ${isSelected ? 'ring-2 ring-primary-500 bg-primary-50' : 'hover:bg-gray-50'}
        ${!item.isAvailable ? 'opacity-60' : ''}
      `}
      onClick={handleCardClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {item.name}
            </h3>
            {!item.isAvailable && (
              <span className="px-2 py-1 text-xs font-medium text-red-600 bg-red-100 rounded-full">
                Unavailable
              </span>
            )}
          </div>
          <span className="text-sm text-primary-600 font-medium">
            {formatCategoryName(item.category)}
            {item.subcategory && ` • ${formatCategoryName(item.subcategory)}`}
          </span>
        </div>
        
        {showCompareButton && (
          <button
            onClick={handleCompareClick}
            className={`
              ml-2 p-2 rounded-lg transition-colors
              ${isSelected 
                ? 'bg-primary-600 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-primary-100 hover:text-primary-600'
              }
            `}
            title={isSelected ? 'Remove from comparison' : 'Add to comparison'}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>

      {/* Description */}
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
        {item.description}
      </p>

      {/* Nutrition Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-orange-50 rounded-lg p-3">
          <div className="text-2xl font-bold text-orange-600">
            {item.nutritionalInfo.calories}
          </div>
          <div className="text-xs text-orange-700 font-medium">kcal/100g</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="text-2xl font-bold text-blue-600">
            {item.nutritionalInfo.protein}g
          </div>
          <div className="text-xs text-blue-700 font-medium">protein</div>
        </div>
        <div className="bg-green-50 rounded-lg p-3">
          <div className="text-2xl font-bold text-green-600">
            {item.nutritionalInfo.fiber}g
          </div>
          <div className="text-xs text-green-700 font-medium">fiber</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-3">
          <div className="text-2xl font-bold text-purple-600">
            {item.nutritionalInfo.carbohydrates}g
          </div>
          <div className="text-xs text-purple-700 font-medium">carbs</div>
        </div>
      </div>

      {/* Health Properties */}
      <div className="space-y-2 mb-4">
        {/* Dietary Restrictions */}
        {item.healthProperties.dietaryRestrictions.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {item.healthProperties.dietaryRestrictions.slice(0, 3).map((restriction) => (
              <span
                key={restriction}
                className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full"
              >
                {restriction}
              </span>
            ))}
            {item.healthProperties.dietaryRestrictions.length > 3 && (
              <span className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full">
                +{item.healthProperties.dietaryRestrictions.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Antioxidant Level */}
        {item.healthProperties.antioxidantLevel && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600">Antioxidants:</span>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getAntioxidantColor(item.healthProperties.antioxidantLevel)}`}>
              {item.healthProperties.antioxidantLevel}
            </span>
          </div>
        )}
      </div>

      {/* Storage Info */}
      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
        <div className="flex items-center gap-1">
          <span>{getStorageIcon(item.storageInfo.storageTemperature)}</span>
          <span className="capitalize">
            {item.storageInfo.storageTemperature.replace('-', ' ')}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L10 9.586V6z" clipRule="evenodd" />
          </svg>
          <span>{item.storageInfo.shelfLife} days</span>
        </div>
      </div>

      {/* Admin Details */}
      {showAdminDetails && item.addedBy && (
        <div className="border-t pt-3 mt-3">
          <div className="text-xs text-gray-500">
            <div>Added by: {item.addedBy.firstName} {item.addedBy.lastName}</div>
            <div>Created: {new Date(item.createdAt).toLocaleDateString()}</div>
            {item.lastUpdatedBy && item.lastUpdatedBy.id !== item.addedBy.id && (
              <div>Updated by: {item.lastUpdatedBy.firstName} {item.lastUpdatedBy.lastName}</div>
            )}
          </div>
        </div>
      )}

      {/* Allergen Warning */}
      {item.healthProperties.allergens.length > 0 && (
        <div className="border-t pt-3 mt-3">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-xs text-red-600 font-medium">
              Contains: {item.healthProperties.allergens.join(', ')}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}; 