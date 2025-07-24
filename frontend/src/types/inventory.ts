// Nutritional information per 100g
export interface NutritionalInfo {
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  cholesterol: number;
  saturatedFat: number;
  transFat: number;
}

// Vitamins and minerals per 100g
export interface VitaminsAndMinerals {
  vitaminA?: number;
  vitaminC?: number;
  vitaminD?: number;
  vitaminE?: number;
  vitaminK?: number;
  thiamine?: number;
  riboflavin?: number;
  niacin?: number;
  vitaminB6?: number;
  folate?: number;
  vitaminB12?: number;
  calcium?: number;
  iron?: number;
  magnesium?: number;
  phosphorus?: number;
  potassium?: number;
  zinc?: number;
}

// Health and dietary information
export interface HealthProperties {
  healthBenefits: string[];
  healthRisks: string[];
  dietaryRestrictions: string[];
  allergens: string[];
  glycemicIndex?: number;
  antioxidantLevel?: 'low' | 'medium' | 'high';
}

// Storage and handling information
export interface StorageInfo {
  shelfLife: number;
  storageTemperature: 'room-temperature' | 'refrigerated' | 'frozen' | 'cool-dry-place';
  storageConditions: string[];
}

// Complete inventory item
export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  baseUnit: 'grams';
  minimumQuantity: number;
  isAvailable: boolean;
  nutritionalInfo: NutritionalInfo;
  vitaminsAndMinerals?: VitaminsAndMinerals;
  healthProperties: HealthProperties;
  storageInfo: StorageInfo;
  alternativeNames: string[];
  seasonality?: string[];
  origin?: string;
  createdAt: string;
  updatedAt: string;
  // Admin fields (only in admin views)
  addedBy?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  lastUpdatedBy?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

// API Response types
export interface InventoryApiResponse {
  success: boolean;
  message?: string;
  data: {
    item: InventoryItem;
  };
}

export interface InventoryListResponse {
  success: boolean;
  data: {
    items: InventoryItem[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
    filters?: {
      category?: string;
      dietaryRestrictions?: string[];
      excludeAllergens?: string[];
      search?: string;
    };
  };
}

export interface CategoriesResponse {
  success: boolean;
  data: {
    categories: {
      category: string;
      count: number;
      subcategories: string[];
    }[];
  };
}

export interface ComparisonResponse {
  success: boolean;
  data: {
    comparison: {
      id: string;
      name: string;
      nutritionalInfo: NutritionalInfo;
      vitaminsAndMinerals?: VitaminsAndMinerals;
      healthProperties: HealthProperties;
    }[];
  };
}

// Form data types
export interface CreateItemData {
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  minimumQuantity?: number;
  nutritionalInfo: NutritionalInfo;
  vitaminsAndMinerals?: VitaminsAndMinerals;
  healthProperties: HealthProperties;
  storageInfo: StorageInfo;
  alternativeNames?: string[];
  seasonality?: string[];
  origin?: string;
}

export interface UpdateItemData extends Partial<CreateItemData> {}

// Search and filter types
export interface CatalogFilters {
  category?: string;
  search?: string;
  dietaryRestrictions?: string[];
  excludeAllergens?: string[];
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'category' | 'calories' | 'protein' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// Constants
export const CATEGORIES = [
  'vegetables',
  'fruits', 
  'grains',
  'legumes',
  'proteins',
  'dairy',
  'spices',
  'herbs',
  'oils',
  'nuts-seeds',
  'beverages',
  'sweeteners'
] as const;

export const DIETARY_RESTRICTIONS = [
  'vegetarian',
  'vegan',
  'gluten-free',
  'dairy-free',
  'nut-free',
  'soy-free',
  'kosher',
  'halal',
  'keto-friendly',
  'paleo-friendly'
] as const;

export const ALLERGENS = [
  'nuts',
  'peanuts',
  'tree-nuts',
  'dairy',
  'gluten',
  'wheat',
  'soy',
  'eggs',
  'fish',
  'shellfish',
  'sesame'
] as const;

export const STORAGE_TEMPERATURES = [
  'room-temperature',
  'refrigerated',
  'frozen',
  'cool-dry-place'
] as const;

export const STORAGE_CONDITIONS = [
  'dry-place',
  'away-from-light',
  'airtight-container',
  'ventilated',
  'humidity-controlled'
] as const;

export const MONTHS = [
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december'
] as const;

export type Category = typeof CATEGORIES[number];
export type DietaryRestriction = typeof DIETARY_RESTRICTIONS[number];
export type Allergen = typeof ALLERGENS[number];
export type StorageTemperature = typeof STORAGE_TEMPERATURES[number];
export type StorageCondition = typeof STORAGE_CONDITIONS[number];
export type Month = typeof MONTHS[number]; 