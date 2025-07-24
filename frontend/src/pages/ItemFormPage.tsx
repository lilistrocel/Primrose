import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';
import inventoryApi from '../services/inventoryApi';
import type { CreateItemData, UpdateItemData, InventoryItem } from '../types/inventory';
import { CATEGORIES, DIETARY_RESTRICTIONS, ALLERGENS } from '../types/inventory';

export const ItemFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const isEditing = Boolean(id);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [item, setItem] = useState<InventoryItem | null>(null);

  // Form data state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    subcategory: '',
    baseUnit: 'grams' as const,
    minimumQuantity: 0,
    isAvailable: true,
    
    // Nutritional info
    calories: 0,
    protein: 0,
    carbohydrates: 0,
    fat: 0,
    saturatedFat: 0,
    transFat: 0,
    fiber: 0,
    sugar: 0,
    sodium: 0,
    cholesterol: 0,

    // Vitamins & Minerals (optional)
    vitaminC: 0,
    vitaminA: 0,
    calcium: 0,
    iron: 0,
    potassium: 0,
    magnesium: 0,

    // Health properties
    healthBenefits: '',
    healthRisks: '',
    dietaryRestrictions: [] as string[],
    allergens: [] as string[],
    glycemicIndex: 0,
    antioxidantLevel: '',

    // Storage info
    shelfLife: 0,
    storageTemperature: '',
    storageConditions: '',

    // Alternative names
    alternativeNames: '',
    seasonality: '',
    origin: ''
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Check admin access
  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Load item data for editing
  useEffect(() => {
    if (isEditing && id) {
      loadItem(id);
    }
  }, [isEditing, id]);

  const loadItem = async (itemId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const itemData = await inventoryApi.getAdminItem(itemId);
      setItem(itemData);
      
      // Populate form with existing data
      setFormData({
        name: itemData.name,
        description: itemData.description,
        category: itemData.category,
        subcategory: itemData.subcategory || '',
        baseUnit: itemData.baseUnit,
        minimumQuantity: itemData.minimumQuantity,
        isAvailable: itemData.isAvailable,
        
        // Nutritional info
        calories: itemData.nutritionalInfo.calories,
        protein: itemData.nutritionalInfo.protein,
        carbohydrates: itemData.nutritionalInfo.carbohydrates,
        fat: itemData.nutritionalInfo.fat,
        saturatedFat: itemData.nutritionalInfo.saturatedFat,
        transFat: itemData.nutritionalInfo.transFat,
        fiber: itemData.nutritionalInfo.fiber,
        sugar: itemData.nutritionalInfo.sugar,
        sodium: itemData.nutritionalInfo.sodium,
        cholesterol: itemData.nutritionalInfo.cholesterol,

        // Vitamins & Minerals
        vitaminC: itemData.vitaminsAndMinerals?.vitaminC || 0,
        vitaminA: itemData.vitaminsAndMinerals?.vitaminA || 0,
        calcium: itemData.vitaminsAndMinerals?.calcium || 0,
        iron: itemData.vitaminsAndMinerals?.iron || 0,
        potassium: itemData.vitaminsAndMinerals?.potassium || 0,
        magnesium: itemData.vitaminsAndMinerals?.magnesium || 0,

        // Health properties
        healthBenefits: itemData.healthProperties.healthBenefits.join(', '),
        healthRisks: itemData.healthProperties.healthRisks.join(', '),
        dietaryRestrictions: itemData.healthProperties.dietaryRestrictions,
        allergens: itemData.healthProperties.allergens,
        glycemicIndex: itemData.healthProperties.glycemicIndex || 0,
        antioxidantLevel: itemData.healthProperties.antioxidantLevel || '',

        // Storage info
        shelfLife: itemData.storageInfo.shelfLife,
        storageTemperature: itemData.storageInfo.storageTemperature,
        storageConditions: itemData.storageInfo.storageConditions.join(', '),

        // Additional info
        alternativeNames: itemData.alternativeNames.join(', '),
        seasonality: itemData.seasonality?.join(', ') || '',
        origin: itemData.origin || ''
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load item');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleArrayToggle = (field: 'dietaryRestrictions' | 'allergens', value: string) => {
    const currentArray = formData[field];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    setFormData(prev => ({ ...prev, [field]: newArray }));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!formData.category) errors.category = 'Category is required';
    if (formData.calories < 0) errors.calories = 'Calories cannot be negative';
    if (formData.protein < 0) errors.protein = 'Protein cannot be negative';
    if (formData.carbohydrates < 0) errors.carbohydrates = 'Carbohydrates cannot be negative';
    if (formData.fat < 0) errors.fat = 'Fat cannot be negative';
    if (formData.minimumQuantity < 0) errors.minimumQuantity = 'Minimum quantity cannot be negative';
    if (formData.shelfLife <= 0) errors.shelfLife = 'Shelf life must be greater than 0';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError('Please fix the validation errors below');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      const itemData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category,
        subcategory: formData.subcategory.trim() || undefined,
        ...(isEditing ? {} : { baseUnit: formData.baseUnit }), // Only include baseUnit when creating
        minimumQuantity: formData.minimumQuantity,
        isAvailable: formData.isAvailable,
        
        nutritionalInfo: {
          calories: formData.calories,
          protein: formData.protein,
          carbohydrates: formData.carbohydrates,
          fat: formData.fat,
          saturatedFat: formData.saturatedFat,
          transFat: formData.transFat,
          fiber: formData.fiber,
          sugar: formData.sugar,
          sodium: formData.sodium,
          cholesterol: formData.cholesterol
        },

        vitaminsAndMinerals: {
          vitaminC: formData.vitaminC || undefined,
          vitaminA: formData.vitaminA || undefined,
          calcium: formData.calcium || undefined,
          iron: formData.iron || undefined,
          potassium: formData.potassium || undefined,
          magnesium: formData.magnesium || undefined
        },

        healthProperties: {
          healthBenefits: formData.healthBenefits ? formData.healthBenefits.split(',').map(s => s.trim()) : [],
          healthRisks: formData.healthRisks ? formData.healthRisks.split(',').map(s => s.trim()) : [],
          dietaryRestrictions: formData.dietaryRestrictions,
          allergens: formData.allergens,
          glycemicIndex: formData.glycemicIndex || undefined,
          antioxidantLevel: formData.antioxidantLevel || undefined
        },

        storageInfo: {
          shelfLife: formData.shelfLife,
          storageTemperature: formData.storageTemperature,
          storageConditions: formData.storageConditions ? formData.storageConditions.split(',').map(s => s.trim()) : []
        },

        alternativeNames: formData.alternativeNames ? formData.alternativeNames.split(',').map(s => s.trim()) : [],
        seasonality: formData.seasonality ? formData.seasonality.split(',').map(s => s.trim()) : undefined,
        origin: formData.origin.trim() || undefined
      };

      if (isEditing && id) {
        await inventoryApi.updateItem(id, itemData as UpdateItemData);
      } else {
        await inventoryApi.createItem(itemData as CreateItemData);
      }

      navigate('/admin/inventory');
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} item`);
    } finally {
      setIsSaving(false);
    }
  };

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading item...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">
                {isEditing ? 'Edit Item' : 'Create New Item'}
              </h1>
              <p className="text-gray-600 mt-1">
                {isEditing ? `Update "${item?.name}"` : 'Add a new food item to the inventory'}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate('/admin/inventory')}
            >
              Back to Inventory
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex">
              <div className="text-red-400 text-xl mr-3">⚠️</div>
              <div>
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Item Name *"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                error={validationErrors.name}
                placeholder="e.g., Organic Spinach"
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className={`input-field ${validationErrors.category ? 'border-red-300' : ''}`}
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map((category: string) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                {validationErrors.category && (
                  <p className="text-red-600 text-sm mt-1">{validationErrors.category}</p>
                )}
              </div>

              <Input
                label="Subcategory"
                value={formData.subcategory}
                onChange={(e) => handleInputChange('subcategory', e.target.value)}
                placeholder="e.g., Leafy Greens"
              />

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isAvailable"
                  checked={formData.isAvailable}
                  onChange={(e) => handleInputChange('isAvailable', e.target.checked)}
                  className="h-4 w-4 text-primary-600 border-gray-300 rounded"
                />
                <label htmlFor="isAvailable" className="ml-2 text-sm text-gray-700">
                  Available to users
                </label>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className={`input-field ${validationErrors.description ? 'border-red-300' : ''}`}
                placeholder="Describe the item, its properties, and uses..."
              />
              {validationErrors.description && (
                <p className="text-red-600 text-sm mt-1">{validationErrors.description}</p>
              )}
            </div>
          </div>

          {/* Nutritional Information */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Nutritional Information (per 100g)</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input
                label="Calories (kcal) *"
                type="number"
                value={formData.calories}
                onChange={(e) => handleInputChange('calories', Number(e.target.value))}
                error={validationErrors.calories}
                min="0"
                step="0.1"
              />
              <Input
                label="Protein (g) *"
                type="number"
                value={formData.protein}
                onChange={(e) => handleInputChange('protein', Number(e.target.value))}
                error={validationErrors.protein}
                min="0"
                step="0.1"
              />
              <Input
                label="Carbohydrates (g) *"
                type="number"
                value={formData.carbohydrates}
                onChange={(e) => handleInputChange('carbohydrates', Number(e.target.value))}
                error={validationErrors.carbohydrates}
                min="0"
                step="0.1"
              />
              <Input
                label="Total Fat (g) *"
                type="number"
                value={formData.fat}
                onChange={(e) => handleInputChange('fat', Number(e.target.value))}
                error={validationErrors.fat}
                min="0"
                step="0.1"
              />
              <Input
                label="Saturated Fat (g)"
                type="number"
                value={formData.saturatedFat}
                onChange={(e) => handleInputChange('saturatedFat', Number(e.target.value))}
                min="0"
                step="0.1"
              />
              <Input
                label="Trans Fat (g)"
                type="number"
                value={formData.transFat}
                onChange={(e) => handleInputChange('transFat', Number(e.target.value))}
                min="0"
                step="0.1"
              />
              <Input
                label="Fiber (g)"
                type="number"
                value={formData.fiber}
                onChange={(e) => handleInputChange('fiber', Number(e.target.value))}
                min="0"
                step="0.1"
              />
              <Input
                label="Sugar (g)"
                type="number"
                value={formData.sugar}
                onChange={(e) => handleInputChange('sugar', Number(e.target.value))}
                min="0"
                step="0.1"
              />
              <Input
                label="Sodium (mg)"
                type="number"
                value={formData.sodium}
                onChange={(e) => handleInputChange('sodium', Number(e.target.value))}
                min="0"
                step="0.1"
              />
              <Input
                label="Cholesterol (mg)"
                type="number"
                value={formData.cholesterol}
                onChange={(e) => handleInputChange('cholesterol', Number(e.target.value))}
                min="0"
                step="0.1"
              />
            </div>
          </div>

          {/* Vitamins & Minerals */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Vitamins & Minerals (Optional)</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input
                label="Vitamin C (mg)"
                type="number"
                value={formData.vitaminC}
                onChange={(e) => handleInputChange('vitaminC', Number(e.target.value))}
                min="0"
                step="0.1"
              />
              <Input
                label="Vitamin A (μg)"
                type="number"
                value={formData.vitaminA}
                onChange={(e) => handleInputChange('vitaminA', Number(e.target.value))}
                min="0"
                step="0.1"
              />
              <Input
                label="Calcium (mg)"
                type="number"
                value={formData.calcium}
                onChange={(e) => handleInputChange('calcium', Number(e.target.value))}
                min="0"
                step="0.1"
              />
              <Input
                label="Iron (mg)"
                type="number"
                value={formData.iron}
                onChange={(e) => handleInputChange('iron', Number(e.target.value))}
                min="0"
                step="0.01"
              />
              <Input
                label="Potassium (mg)"
                type="number"
                value={formData.potassium}
                onChange={(e) => handleInputChange('potassium', Number(e.target.value))}
                min="0"
                step="0.1"
              />
              <Input
                label="Magnesium (mg)"
                type="number"
                value={formData.magnesium}
                onChange={(e) => handleInputChange('magnesium', Number(e.target.value))}
                min="0"
                step="0.1"
              />
            </div>
          </div>

          {/* Health Properties */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Health Properties</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Health Benefits
                </label>
                <textarea
                  value={formData.healthBenefits}
                  onChange={(e) => handleInputChange('healthBenefits', e.target.value)}
                  rows={3}
                  className="input-field"
                  placeholder="Enter benefits separated by commas (e.g., High in antioxidants, Supports immune system)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Health Risks/Warnings
                </label>
                <textarea
                  value={formData.healthRisks}
                  onChange={(e) => handleInputChange('healthRisks', e.target.value)}
                  rows={3}
                  className="input-field"
                  placeholder="Enter risks separated by commas (e.g., High in oxalates, May interact with blood thinners)"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Dietary Restrictions
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {DIETARY_RESTRICTIONS.map((restriction: string) => (
                    <label key={restriction} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.dietaryRestrictions.includes(restriction)}
                        onChange={() => handleArrayToggle('dietaryRestrictions', restriction)}
                        className="h-4 w-4 text-primary-600 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{restriction}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Allergens
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {ALLERGENS.map((allergen: string) => (
                    <label key={allergen} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.allergens.includes(allergen)}
                        onChange={() => handleArrayToggle('allergens', allergen)}
                        className="h-4 w-4 text-red-600 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{allergen}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <Input
                label="Glycemic Index"
                type="number"
                value={formData.glycemicIndex}
                onChange={(e) => handleInputChange('glycemicIndex', Number(e.target.value))}
                min="0"
                max="100"
                helperText="0-100 scale (0-55: Low, 56-69: Medium, 70+: High)"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Antioxidant Level
                </label>
                <select
                  value={formData.antioxidantLevel}
                  onChange={(e) => handleInputChange('antioxidantLevel', e.target.value)}
                  className="input-field"
                >
                  <option value="">Select level</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
          </div>

          {/* Storage Information */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Storage Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input
                label="Shelf Life (days) *"
                type="number"
                value={formData.shelfLife}
                onChange={(e) => handleInputChange('shelfLife', Number(e.target.value))}
                error={validationErrors.shelfLife}
                min="1"
              />
              <Input
                label="Storage Temperature"
                value={formData.storageTemperature}
                onChange={(e) => handleInputChange('storageTemperature', e.target.value)}
                placeholder="e.g., 0-4°C, Room temperature"
              />
              <Input
                label="Storage Conditions"
                value={formData.storageConditions}
                onChange={(e) => handleInputChange('storageConditions', e.target.value)}
                placeholder="e.g., Cool, dry place"
              />
            </div>
          </div>

          {/* Additional Information */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Additional Information</h2>
            <div className="space-y-6">
              <Input
                label="Alternative Names"
                value={formData.alternativeNames}
                onChange={(e) => handleInputChange('alternativeNames', e.target.value)}
                placeholder="Comma-separated list (e.g., Baby spinach, Palak)"
              />
              <Input
                label="Seasonality"
                value={formData.seasonality}
                onChange={(e) => handleInputChange('seasonality', e.target.value)}
                placeholder="Comma-separated months (e.g., March, April, May)"
              />
              <Input
                label="Origin/Region"
                value={formData.origin}
                onChange={(e) => handleInputChange('origin', e.target.value)}
                placeholder="e.g., Mediterranean, India, Worldwide"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/inventory')}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              isLoading={isSaving}
            >
              {isEditing ? 'Update Item' : 'Create Item'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}; 