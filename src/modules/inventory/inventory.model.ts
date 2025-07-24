import mongoose, { Document, Schema } from 'mongoose';

// Nutritional information per 100g
export interface INutritionalInfo {
  calories: number; // kcal per 100g
  protein: number; // grams per 100g
  carbohydrates: number; // grams per 100g
  fat: number; // grams per 100g
  fiber: number; // grams per 100g
  sugar: number; // grams per 100g
  sodium: number; // mg per 100g
  cholesterol: number; // mg per 100g
  saturatedFat: number; // grams per 100g
  transFat: number; // grams per 100g
}

// Vitamins and minerals per 100g
export interface IVitaminsAndMinerals {
  vitaminA?: number; // mcg per 100g
  vitaminC?: number; // mg per 100g
  vitaminD?: number; // mcg per 100g
  vitaminE?: number; // mg per 100g
  vitaminK?: number; // mcg per 100g
  thiamine?: number; // mg per 100g (B1)
  riboflavin?: number; // mg per 100g (B2)
  niacin?: number; // mg per 100g (B3)
  vitaminB6?: number; // mg per 100g
  folate?: number; // mcg per 100g
  vitaminB12?: number; // mcg per 100g
  calcium?: number; // mg per 100g
  iron?: number; // mg per 100g
  magnesium?: number; // mg per 100g
  phosphorus?: number; // mg per 100g
  potassium?: number; // mg per 100g
  zinc?: number; // mg per 100g
}

// Health and dietary information
export interface IHealthProperties {
  healthBenefits: string[]; // Array of health benefits
  healthRisks: string[]; // Array of potential health risks/allergens
  dietaryRestrictions: string[]; // e.g., 'vegetarian', 'vegan', 'gluten-free', 'dairy-free'
  allergens: string[]; // Common allergens: 'nuts', 'dairy', 'gluten', 'soy', etc.
  glycemicIndex?: number; // 0-100 scale
  antioxidantLevel?: 'low' | 'medium' | 'high';
}

// Storage and handling information
export interface IStorageInfo {
  shelfLife: number; // days
  storageTemperature: string; // e.g., 'room temperature', 'refrigerated', 'frozen'
  storageConditions: string[]; // e.g., 'dry place', 'away from light', 'airtight container'
}

export interface IInventoryItem extends Document {
  name: string;
  description: string;
  category: string; // e.g., 'vegetables', 'fruits', 'grains', 'proteins', 'spices', 'dairy'
  subcategory?: string; // e.g., 'leafy greens', 'citrus fruits', 'whole grains'
  
  // Measurement and availability
  baseUnit: 'grams'; // Always grams for consistency
  minimumQuantity: number; // Minimum grams for recipes
  isAvailable: boolean;
  
  // Nutritional data (per 100g)
  nutritionalInfo: INutritionalInfo;
  vitaminsAndMinerals?: IVitaminsAndMinerals;
  
  // Health and dietary properties
  healthProperties: IHealthProperties;
  
  // Storage and handling
  storageInfo: IStorageInfo;
  
  // Administrative data
  addedBy: mongoose.Types.ObjectId; // Reference to admin user
  lastUpdatedBy: mongoose.Types.ObjectId;
  
  // Additional metadata
  alternativeNames: string[]; // Common alternative names
  seasonality?: string[]; // Months when in season (for fresh items)
  origin?: string; // Geographic origin
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const nutritionalInfoSchema = new Schema<INutritionalInfo>({
  calories: { type: Number, required: true, min: 0 },
  protein: { type: Number, required: true, min: 0 },
  carbohydrates: { type: Number, required: true, min: 0 },
  fat: { type: Number, required: true, min: 0 },
  fiber: { type: Number, required: true, min: 0 },
  sugar: { type: Number, required: true, min: 0 },
  sodium: { type: Number, required: true, min: 0 },
  cholesterol: { type: Number, required: true, min: 0 },
  saturatedFat: { type: Number, required: true, min: 0 },
  transFat: { type: Number, required: true, min: 0 }
}, { _id: false });

const vitaminsAndMineralsSchema = new Schema<IVitaminsAndMinerals>({
  vitaminA: { type: Number, min: 0 },
  vitaminC: { type: Number, min: 0 },
  vitaminD: { type: Number, min: 0 },
  vitaminE: { type: Number, min: 0 },
  vitaminK: { type: Number, min: 0 },
  thiamine: { type: Number, min: 0 },
  riboflavin: { type: Number, min: 0 },
  niacin: { type: Number, min: 0 },
  vitaminB6: { type: Number, min: 0 },
  folate: { type: Number, min: 0 },
  vitaminB12: { type: Number, min: 0 },
  calcium: { type: Number, min: 0 },
  iron: { type: Number, min: 0 },
  magnesium: { type: Number, min: 0 },
  phosphorus: { type: Number, min: 0 },
  potassium: { type: Number, min: 0 },
  zinc: { type: Number, min: 0 }
}, { _id: false });

const healthPropertiesSchema = new Schema<IHealthProperties>({
  healthBenefits: [{ type: String, trim: true }],
  healthRisks: [{ type: String, trim: true }],
  dietaryRestrictions: [{ 
    type: String, 
    enum: ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'nut-free', 'soy-free', 'kosher', 'halal', 'keto-friendly', 'paleo-friendly'],
    trim: true 
  }],
  allergens: [{ 
    type: String, 
    enum: ['nuts', 'peanuts', 'tree-nuts', 'dairy', 'gluten', 'wheat', 'soy', 'eggs', 'fish', 'shellfish', 'sesame'],
    trim: true 
  }],
  glycemicIndex: { type: Number, min: 0, max: 100 },
  antioxidantLevel: { type: String, enum: ['low', 'medium', 'high'] }
}, { _id: false });

const storageInfoSchema = new Schema<IStorageInfo>({
  shelfLife: { type: Number, required: true, min: 1 }, // days
  storageTemperature: { 
    type: String, 
    required: true,
    enum: ['room-temperature', 'refrigerated', 'frozen', 'cool-dry-place'],
    trim: true 
  },
  storageConditions: [{ 
    type: String, 
    enum: ['dry-place', 'away-from-light', 'airtight-container', 'ventilated', 'humidity-controlled'],
    trim: true 
  }]
}, { _id: false });

const inventoryItemSchema = new Schema<IInventoryItem>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
    index: true // For search optimization
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  category: {
    type: String,
    required: true,
    enum: [
      'vegetables', 'fruits', 'grains', 'legumes', 'proteins', 'dairy', 
      'spices', 'herbs', 'oils', 'nuts-seeds', 'beverages', 'sweeteners'
    ],
    index: true
  },
  subcategory: {
    type: String,
    trim: true,
    maxlength: 50
  },
  
  baseUnit: {
    type: String,
    default: 'grams',
    enum: ['grams'] // Always grams for consistency
  },
  minimumQuantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  isAvailable: {
    type: Boolean,
    default: true,
    index: true
  },
  
  nutritionalInfo: {
    type: nutritionalInfoSchema,
    required: true
  },
  vitaminsAndMinerals: vitaminsAndMineralsSchema,
  healthProperties: {
    type: healthPropertiesSchema,
    required: true
  },
  storageInfo: {
    type: storageInfoSchema,
    required: true
  },
  
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  alternativeNames: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  seasonality: [{
    type: String,
    enum: ['january', 'february', 'march', 'april', 'may', 'june', 
           'july', 'august', 'september', 'october', 'november', 'december']
  }],
  origin: {
    type: String,
    trim: true,
    maxlength: 100
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc: any, ret: any) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Compound indexes for efficient queries
inventoryItemSchema.index({ category: 1, isAvailable: 1 });
inventoryItemSchema.index({ name: 'text', description: 'text', alternativeNames: 'text' });
inventoryItemSchema.index({ 'healthProperties.dietaryRestrictions': 1 });
inventoryItemSchema.index({ 'healthProperties.allergens': 1 });

// Static method to get available items by category
inventoryItemSchema.statics.getByCategory = function(category: string) {
  return this.find({ category, isAvailable: true }).sort({ name: 1 });
};

// Static method to search items
inventoryItemSchema.statics.searchItems = function(query: string, options: any = {}) {
  const searchQuery: any = {
    $and: [
      { isAvailable: true },
      {
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { alternativeNames: { $regex: query, $options: 'i' } }
        ]
      }
    ]
  };

  if (options.category) {
    searchQuery.$and.push({ category: options.category });
  }

  if (options.dietaryRestrictions && options.dietaryRestrictions.length > 0) {
    searchQuery.$and.push({ 'healthProperties.dietaryRestrictions': { $in: options.dietaryRestrictions } });
  }

  return this.find(searchQuery).sort({ name: 1 });
};

export const InventoryItem = mongoose.model<IInventoryItem>('InventoryItem', inventoryItemSchema); 