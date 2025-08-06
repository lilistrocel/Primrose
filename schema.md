# Database Schema Documentation

This document provides comprehensive schema definitions for the Primrose application database. Use this to understand data structures or generate sample data.

## Database: MongoDB

### Collections Overview
- **users** - User accounts and authentication
- **inventoryitems** - Food items and ingredients catalog

---

## 1. Users Collection

### Schema: `User`

```typescript
interface IUser {
  _id: ObjectId;
  firstName: string;        // 2-50 chars, required
  lastName: string;         // 2-50 chars, required  
  email: string;           // unique, valid email, required
  password: string;        // hashed with bcrypt, min 8 chars
  role: 'user' | 'admin'; // default: 'user'
  isActive: boolean;       // default: true
  createdAt: Date;         // auto-generated
  updatedAt: Date;         // auto-generated
}
```

### Validation Rules:
- **firstName**: 2-50 characters, alphabetic + spaces/hyphens
- **lastName**: 2-50 characters, alphabetic + spaces/hyphens
- **email**: Must be unique and valid email format
- **password**: Minimum 8 characters, hashed with bcrypt
- **role**: Either 'user' or 'admin'

### Sample Data:
```json
{
  "firstName": "John",
  "lastName": "Doe", 
  "email": "john.doe@example.com",
  "password": "$2b$12$hashedPasswordString",
  "role": "user",
  "isActive": true
}
```

---

## 2. Inventory Items Collection

### Schema: `InventoryItem`

```typescript
interface IInventoryItem {
  _id: ObjectId;
  name: string;                    // 2-100 chars, unique, required
  description: string;             // 10-500 chars, required
  category: FoodCategory;          // enum, required, indexed
  subcategory?: string;            // 2-50 chars, optional
  
  // Measurement
  baseUnit: 'grams';              // always 'grams' for consistency
  minimumQuantity: number;        // integer, min 1, max 10000, default 1
  isAvailable: boolean;           // default true, indexed
  
  // Nutrition (all per 100g)
  nutritionalInfo: INutritionalInfo;     // required
  vitaminsAndMinerals?: IVitaminsAndMinerals; // optional
  
  // Health & Diet
  healthProperties: IHealthProperties;   // required
  
  // Storage
  storageInfo: IStorageInfo;            // required
  
  // Administration
  addedBy: ObjectId;                    // ref to User, required
  lastUpdatedBy: ObjectId;              // ref to User, required
  
  // Metadata
  alternativeNames: string[];           // 0-10 items, 2-50 chars each
  seasonality?: string[];               // month names, 0-12 items
  origin?: string;                      // 2-100 chars
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}
```

### Sub-Schema: Nutritional Info (per 100g)

```typescript
interface INutritionalInfo {
  calories: number;        // 0-1000 kcal
  protein: number;         // 0-100g
  carbohydrates: number;   // 0-100g
  fat: number;            // 0-100g
  fiber: number;          // 0-50g
  sugar: number;          // 0-100g
  sodium: number;         // 0-50000mg
  cholesterol: number;    // 0-3000mg
  saturatedFat: number;   // 0-100g
  transFat: number;       // 0-100g
}
```

### Sub-Schema: Vitamins & Minerals (per 100g)

```typescript
interface IVitaminsAndMinerals {
  vitaminA?: number;      // 0-50000 IU
  vitaminC?: number;      // 0-2000mg
  vitaminD?: number;      // 0-250 IU
  vitaminE?: number;      // 0-1000mg
  vitaminK?: number;      // 0-5000mcg
  thiamine?: number;      // 0-100mg (B1)
  riboflavin?: number;    // 0-100mg (B2)
  niacin?: number;        // 0-500mg (B3)
  vitaminB6?: number;     // 0-100mg
  folate?: number;        // 0-5000mcg
  vitaminB12?: number;    // 0-1000mcg
  calcium?: number;       // 0-5000mg
  iron?: number;          // 0-500mg
  magnesium?: number;     // 0-2000mg
  phosphorus?: number;    // 0-5000mg
  potassium?: number;     // 0-10000mg
  zinc?: number;          // 0-1000mg
}
```

### Sub-Schema: Health Properties

```typescript
interface IHealthProperties {
  healthBenefits: string[];       // 0-20 items, 3-200 chars each
  healthRisks: string[];          // 0-20 items, 3-200 chars each
  dietaryRestrictions: DietaryRestriction[]; // 0-10 items
  allergens: Allergen[];          // 0-15 items
  glycemicIndex?: number;         // 0-100
  antioxidantLevel?: 'low' | 'medium' | 'high';
}
```

### Sub-Schema: Storage Information

```typescript
interface IStorageInfo {
  shelfLife: number;              // 1-10000 days
  storageTemperature: StorageTemperature; // enum, required
  storageConditions: StorageCondition[];  // 0-10 items
}
```

---

## 3. Enums and Constants

### Food Categories
```typescript
type FoodCategory = 
  | 'vegetables' | 'fruits' | 'grains' | 'legumes' 
  | 'proteins' | 'dairy' | 'spices' | 'herbs' 
  | 'oils' | 'nuts-seeds' | 'beverages' | 'sweeteners';
```

### Dietary Restrictions
```typescript
type DietaryRestriction = 
  | 'vegetarian' | 'vegan' | 'gluten-free' | 'dairy-free' 
  | 'nut-free' | 'soy-free' | 'kosher' | 'halal' 
  | 'keto-friendly' | 'paleo-friendly';
```

### Allergens
```typescript
type Allergen = 
  | 'nuts' | 'peanuts' | 'tree-nuts' | 'dairy' | 'gluten' 
  | 'wheat' | 'soy' | 'eggs' | 'fish' | 'shellfish' | 'sesame';
```

### Storage Temperature
```typescript
type StorageTemperature = 
  | 'room-temperature' | 'refrigerated' | 'frozen' | 'cool-dry-place';
```

### Storage Conditions
```typescript
type StorageCondition = 
  | 'dry-place' | 'away-from-light' | 'airtight-container' 
  | 'ventilated' | 'humidity-controlled';
```

### Seasonality Months
```typescript
type Month = 
  | 'january' | 'february' | 'march' | 'april' | 'may' | 'june'
  | 'july' | 'august' | 'september' | 'october' | 'november' | 'december';
```

---

## 4. Sample Inventory Item Data

### Example: Fresh Spinach

```json
{
  "name": "Fresh Spinach",
  "description": "Fresh baby spinach leaves, perfect for salads, smoothies, and cooking. Rich in iron, vitamins, and antioxidants.",
  "category": "vegetables",
  "subcategory": "leafy greens",
  "baseUnit": "grams",
  "minimumQuantity": 50,
  "isAvailable": true,
  "nutritionalInfo": {
    "calories": 23,
    "protein": 2.9,
    "carbohydrates": 3.6,
    "fat": 0.4,
    "fiber": 2.2,
    "sugar": 0.4,
    "sodium": 79,
    "cholesterol": 0,
    "saturatedFat": 0.1,
    "transFat": 0
  },
  "vitaminsAndMinerals": {
    "vitaminA": 9376,
    "vitaminC": 28.1,
    "vitaminK": 483,
    "folate": 194,
    "iron": 2.7,
    "calcium": 99,
    "potassium": 558,
    "magnesium": 79
  },
  "healthProperties": {
    "healthBenefits": [
      "High in iron for blood health",
      "Rich in antioxidants",
      "Supports eye health with lutein",
      "Good source of folate"
    ],
    "healthRisks": [
      "High in oxalates - may affect kidney stone formation",
      "May interact with blood thinning medications"
    ],
    "dietaryRestrictions": ["vegetarian", "vegan", "gluten-free", "dairy-free", "keto-friendly"],
    "allergens": [],
    "glycemicIndex": 15,
    "antioxidantLevel": "high"
  },
  "storageInfo": {
    "shelfLife": 7,
    "storageTemperature": "refrigerated",
    "storageConditions": ["airtight-container", "humidity-controlled"]
  },
  "alternativeNames": ["Baby Spinach", "Spinach Leaves"],
  "seasonality": ["march", "april", "may", "september", "october", "november"],
  "origin": "Mediterranean region"
}
```

---

## 5. Database Indexes

### Users Collection
- `email` - unique index
- `role` - compound index with isActive

### Inventory Items Collection  
- `name` - unique index
- `category` - single field index
- `isAvailable` - single field index
- `name, description, alternativeNames` - text search index
- `healthProperties.dietaryRestrictions` - array index

---

## 6. Data Generation Guidelines

When generating sample data:

### For Nutritional Values:
- Keep realistic proportions (protein + carbs + fat ≈ total macros)
- Calories should roughly match: (protein × 4) + (carbs × 4) + (fat × 9)
- Fiber should be subset of carbohydrates
- Use real nutritional data when possible

### For Health Properties:
- Match benefits/restrictions to actual food properties
- Include common allergens where appropriate
- Set realistic glycemic index values
- Consider actual antioxidant content

### For Food Items:
- Use real food names and descriptions
- Match categories with actual food types
- Set reasonable shelf life and storage requirements
- Include authentic alternative names
- Use actual geographic origins

### Variety Suggestions:
- **Vegetables**: spinach, carrots, broccoli, tomatoes, onions, peppers
- **Fruits**: apples, bananas, berries, citrus, stone fruits
- **Grains**: rice, wheat, quinoa, oats, barley
- **Proteins**: chicken, fish, beans, tofu, eggs
- **Dairy**: milk, cheese, yogurt, butter
- **Spices**: salt, pepper, cumin, turmeric, paprika

This schema supports a comprehensive food database with detailed nutritional information, health properties, and storage requirements suitable for recipe planning and dietary tracking applications. 