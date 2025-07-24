import Joi from 'joi';

// Nutritional information validation
const nutritionalInfoSchema = Joi.object({
  calories: Joi.number().min(0).max(1000).required()
    .messages({
      'number.min': 'Calories must be a positive number',
      'number.max': 'Calories per 100g cannot exceed 1000'
    }),
  protein: Joi.number().min(0).max(100).required()
    .messages({
      'number.min': 'Protein must be a positive number',
      'number.max': 'Protein per 100g cannot exceed 100g'
    }),
  carbohydrates: Joi.number().min(0).max(100).required()
    .messages({
      'number.min': 'Carbohydrates must be a positive number',
      'number.max': 'Carbohydrates per 100g cannot exceed 100g'
    }),
  fat: Joi.number().min(0).max(100).required()
    .messages({
      'number.min': 'Fat must be a positive number',
      'number.max': 'Fat per 100g cannot exceed 100g'
    }),
  fiber: Joi.number().min(0).max(50).required()
    .messages({
      'number.min': 'Fiber must be a positive number',
      'number.max': 'Fiber per 100g cannot exceed 50g'
    }),
  sugar: Joi.number().min(0).max(100).required()
    .messages({
      'number.min': 'Sugar must be a positive number',
      'number.max': 'Sugar per 100g cannot exceed 100g'
    }),
  sodium: Joi.number().min(0).max(50000).required()
    .messages({
      'number.min': 'Sodium must be a positive number',
      'number.max': 'Sodium per 100g cannot exceed 50000mg'
    }),
  cholesterol: Joi.number().min(0).max(3000).required()
    .messages({
      'number.min': 'Cholesterol must be a positive number',
      'number.max': 'Cholesterol per 100g cannot exceed 3000mg'
    }),
  saturatedFat: Joi.number().min(0).max(100).required()
    .messages({
      'number.min': 'Saturated fat must be a positive number',
      'number.max': 'Saturated fat per 100g cannot exceed 100g'
    }),
  transFat: Joi.number().min(0).max(100).required()
    .messages({
      'number.min': 'Trans fat must be a positive number',
      'number.max': 'Trans fat per 100g cannot exceed 100g'
    })
});

// Vitamins and minerals validation
const vitaminsAndMineralsSchema = Joi.object({
  vitaminA: Joi.number().min(0).max(50000),
  vitaminC: Joi.number().min(0).max(2000),
  vitaminD: Joi.number().min(0).max(250),
  vitaminE: Joi.number().min(0).max(1000),
  vitaminK: Joi.number().min(0).max(5000),
  thiamine: Joi.number().min(0).max(100),
  riboflavin: Joi.number().min(0).max(100),
  niacin: Joi.number().min(0).max(500),
  vitaminB6: Joi.number().min(0).max(100),
  folate: Joi.number().min(0).max(5000),
  vitaminB12: Joi.number().min(0).max(1000),
  calcium: Joi.number().min(0).max(5000),
  iron: Joi.number().min(0).max(500),
  magnesium: Joi.number().min(0).max(2000),
  phosphorus: Joi.number().min(0).max(5000),
  potassium: Joi.number().min(0).max(10000),
  zinc: Joi.number().min(0).max(1000)
});

// Health properties validation
const healthPropertiesSchema = Joi.object({
  healthBenefits: Joi.array().items(
    Joi.string().trim().min(3).max(200)
      .messages({
        'string.min': 'Health benefit must be at least 3 characters',
        'string.max': 'Health benefit cannot exceed 200 characters'
      })
  ).min(0).max(20).required(),
  
  healthRisks: Joi.array().items(
    Joi.string().trim().min(3).max(200)
      .messages({
        'string.min': 'Health risk must be at least 3 characters',
        'string.max': 'Health risk cannot exceed 200 characters'
      })
  ).min(0).max(20).required(),
  
  dietaryRestrictions: Joi.array().items(
    Joi.string().valid(
      'vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'nut-free', 
      'soy-free', 'kosher', 'halal', 'keto-friendly', 'paleo-friendly'
    )
  ).min(0).max(10).required(),
  
  allergens: Joi.array().items(
    Joi.string().valid(
      'nuts', 'peanuts', 'tree-nuts', 'dairy', 'gluten', 'wheat', 
      'soy', 'eggs', 'fish', 'shellfish', 'sesame'
    )
  ).min(0).max(15).required(),
  
  glycemicIndex: Joi.number().min(0).max(100)
    .messages({
      'number.min': 'Glycemic index must be between 0 and 100',
      'number.max': 'Glycemic index must be between 0 and 100'
    }),
  
  antioxidantLevel: Joi.string().valid('low', 'medium', 'high')
});

// Storage information validation
const storageInfoSchema = Joi.object({
  shelfLife: Joi.number().integer().min(1).max(10000).required()
    .messages({
      'number.min': 'Shelf life must be at least 1 day',
      'number.max': 'Shelf life cannot exceed 10000 days',
      'number.integer': 'Shelf life must be a whole number of days'
    }),
  
  storageTemperature: Joi.string()
    .valid('room-temperature', 'refrigerated', 'frozen', 'cool-dry-place')
    .required(),
  
  storageConditions: Joi.array().items(
    Joi.string().valid(
      'dry-place', 'away-from-light', 'airtight-container', 
      'ventilated', 'humidity-controlled'
    )
  ).min(0).max(10).required()
});

// Main item creation schema
export const createItemSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required()
    .messages({
      'string.min': 'Item name must be at least 2 characters',
      'string.max': 'Item name cannot exceed 100 characters',
      'any.required': 'Item name is required'
    }),
  
  description: Joi.string().trim().min(10).max(500).required()
    .messages({
      'string.min': 'Description must be at least 10 characters',
      'string.max': 'Description cannot exceed 500 characters',
      'any.required': 'Description is required'
    }),
  
  category: Joi.string()
    .valid(
      'vegetables', 'fruits', 'grains', 'legumes', 'proteins', 'dairy',
      'spices', 'herbs', 'oils', 'nuts-seeds', 'beverages', 'sweeteners'
    )
    .required()
    .messages({
      'any.only': 'Category must be one of: vegetables, fruits, grains, legumes, proteins, dairy, spices, herbs, oils, nuts-seeds, beverages, sweeteners',
      'any.required': 'Category is required'
    }),
  
  subcategory: Joi.string().trim().min(2).max(50).optional()
    .messages({
      'string.min': 'Subcategory must be at least 2 characters',
      'string.max': 'Subcategory cannot exceed 50 characters'
    }),
  
  minimumQuantity: Joi.number().integer().min(1).max(10000).default(1)
    .messages({
      'number.min': 'Minimum quantity must be at least 1 gram',
      'number.max': 'Minimum quantity cannot exceed 10000 grams',
      'number.integer': 'Minimum quantity must be a whole number'
    }),
  
  isAvailable: Joi.boolean().default(true),
  
  nutritionalInfo: nutritionalInfoSchema.required()
    .messages({
      'any.required': 'Nutritional information is required'
    }),
  
  vitaminsAndMinerals: vitaminsAndMineralsSchema.optional(),
  
  healthProperties: healthPropertiesSchema.required()
    .messages({
      'any.required': 'Health properties are required'
    }),
  
  storageInfo: storageInfoSchema.required()
    .messages({
      'any.required': 'Storage information is required'
    }),
  
  alternativeNames: Joi.array().items(
    Joi.string().trim().min(2).max(50)
      .messages({
        'string.min': 'Alternative name must be at least 2 characters',
        'string.max': 'Alternative name cannot exceed 50 characters'
      })
  ).min(0).max(10).default([]),
  
  seasonality: Joi.array().items(
    Joi.string().valid(
      'january', 'february', 'march', 'april', 'may', 'june',
      'july', 'august', 'september', 'october', 'november', 'december'
    )
  ).min(0).max(12).default([]),
  
  origin: Joi.string().trim().min(2).max(100).optional()
    .messages({
      'string.min': 'Origin must be at least 2 characters',
      'string.max': 'Origin cannot exceed 100 characters'
    })
});

// Item update schema (all fields optional except those that should remain required)
export const updateItemSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).optional(),
  description: Joi.string().trim().min(10).max(500).optional(),
  category: Joi.string()
    .valid(
      'vegetables', 'fruits', 'grains', 'legumes', 'proteins', 'dairy',
      'spices', 'herbs', 'oils', 'nuts-seeds', 'beverages', 'sweeteners'
    )
    .optional(),
  subcategory: Joi.string().trim().min(2).max(50).optional(),
  baseUnit: Joi.string().valid('grams').optional(),
  minimumQuantity: Joi.number().integer().min(1).max(10000).optional(),
  isAvailable: Joi.boolean().optional(),
  nutritionalInfo: nutritionalInfoSchema.optional(),
  vitaminsAndMinerals: vitaminsAndMineralsSchema.optional(),
  healthProperties: healthPropertiesSchema.optional(),
  storageInfo: storageInfoSchema.optional(),
  alternativeNames: Joi.array().items(
    Joi.string().trim().min(2).max(50)
  ).min(0).max(10).optional(),
  seasonality: Joi.array().items(
    Joi.string().valid(
      'january', 'february', 'march', 'april', 'may', 'june',
      'july', 'august', 'september', 'october', 'november', 'december'
    )
  ).min(0).max(12).optional(),
  origin: Joi.string().trim().min(2).max(100).optional()
});

// Query parameters validation for catalog/search
export const catalogQuerySchema = Joi.object({
  category: Joi.string()
    .valid(
      'vegetables', 'fruits', 'grains', 'legumes', 'proteins', 'dairy',
      'spices', 'herbs', 'oils', 'nuts-seeds', 'beverages', 'sweeteners'
    )
    .optional(),
  
  search: Joi.string().trim().min(1).max(100).optional()
    .messages({
      'string.min': 'Search query must be at least 1 character',
      'string.max': 'Search query cannot exceed 100 characters'
    }),
  
  dietaryRestrictions: Joi.alternatives().try(
    Joi.string().valid(
      'vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'nut-free',
      'soy-free', 'kosher', 'halal', 'keto-friendly', 'paleo-friendly'
    ),
    Joi.array().items(
      Joi.string().valid(
        'vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'nut-free',
        'soy-free', 'kosher', 'halal', 'keto-friendly', 'paleo-friendly'
      )
    ).min(1).max(10)
  ).optional(),
  
  excludeAllergens: Joi.alternatives().try(
    Joi.string().valid(
      'nuts', 'peanuts', 'tree-nuts', 'dairy', 'gluten', 'wheat',
      'soy', 'eggs', 'fish', 'shellfish', 'sesame'
    ),
    Joi.array().items(
      Joi.string().valid(
        'nuts', 'peanuts', 'tree-nuts', 'dairy', 'gluten', 'wheat',
        'soy', 'eggs', 'fish', 'shellfish', 'sesame'
      )
    ).min(1).max(15)
  ).optional(),
  
  page: Joi.number().integer().min(1).default(1)
    .messages({
      'number.min': 'Page must be at least 1',
      'number.integer': 'Page must be a whole number'
    }),
  
  limit: Joi.number().integer().min(1).max(100).default(20)
    .messages({
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100',
      'number.integer': 'Limit must be a whole number'
    }),
  
  sortBy: Joi.string()
    .valid('name', 'category', 'calories', 'protein', 'createdAt')
    .default('name'),
  
  sortOrder: Joi.string().valid('asc', 'desc').default('asc')
});

// ID parameter validation
export const itemIdSchema = Joi.object({
  id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required()
    .messages({
      'string.pattern.base': 'Invalid item ID format',
      'any.required': 'Item ID is required'
    })
}); 