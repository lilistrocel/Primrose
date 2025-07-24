const mongoose = require('mongoose');
const { InventoryItem } = require('../dist/modules/inventory/inventory.model');
const { User } = require('../dist/modules/auth/auth.model');
const chalk = require('chalk');
require('dotenv').config();

// Sample inventory items with realistic nutritional data
const sampleItems = [
  // Vegetables
  {
    name: 'Broccoli',
    description: 'Fresh green broccoli florets, rich in vitamins and minerals. Excellent source of vitamin C, vitamin K, and folate.',
    category: 'vegetables',
    subcategory: 'cruciferous',
    nutritionalInfo: {
      calories: 34,
      protein: 2.8,
      carbohydrates: 6.6,
      fat: 0.4,
      fiber: 2.6,
      sugar: 1.5,
      sodium: 33,
      cholesterol: 0,
      saturatedFat: 0.1,
      transFat: 0
    },
    vitaminsAndMinerals: {
      vitaminC: 89.2,
      vitaminK: 101.6,
      folate: 63,
      vitaminA: 623,
      calcium: 47,
      iron: 0.7,
      magnesium: 21,
      potassium: 316,
      zinc: 0.4
    },
    healthProperties: {
      healthBenefits: [
        'Rich in antioxidants',
        'Supports immune system',
        'May help reduce cancer risk',
        'Good for eye health',
        'Supports bone health'
      ],
      healthRisks: [],
      dietaryRestrictions: ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'keto-friendly', 'paleo-friendly'],
      allergens: [],
      glycemicIndex: 10,
      antioxidantLevel: 'high'
    },
    storageInfo: {
      shelfLife: 7,
      storageTemperature: 'refrigerated',
      storageConditions: ['humidity-controlled', 'ventilated']
    },
    alternativeNames: ['Calabrese', 'Crown broccoli'],
    seasonality: ['october', 'november', 'december', 'january', 'february', 'march'],
    origin: 'Mediterranean region'
  },
  
  {
    name: 'Spinach',
    description: 'Fresh baby spinach leaves, packed with iron and vitamins. Perfect for salads, smoothies, and cooking.',
    category: 'vegetables',
    subcategory: 'leafy greens',
    nutritionalInfo: {
      calories: 23,
      protein: 2.9,
      carbohydrates: 3.6,
      fat: 0.4,
      fiber: 2.2,
      sugar: 0.4,
      sodium: 79,
      cholesterol: 0,
      saturatedFat: 0.1,
      transFat: 0
    },
    vitaminsAndMinerals: {
      vitaminK: 483,
      vitaminA: 469,
      folate: 194,
      vitaminC: 28.1,
      iron: 2.7,
      magnesium: 79,
      potassium: 558,
      calcium: 99
    },
    healthProperties: {
      healthBenefits: [
        'High in iron',
        'Rich in antioxidants',
        'Supports eye health',
        'May help regulate blood pressure',
        'Good for bone health'
      ],
      healthRisks: ['Contains oxalates'],
      dietaryRestrictions: ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'keto-friendly', 'paleo-friendly'],
      allergens: [],
      glycemicIndex: 15,
      antioxidantLevel: 'high'
    },
    storageInfo: {
      shelfLife: 5,
      storageTemperature: 'refrigerated',
      storageConditions: ['humidity-controlled', 'away-from-light']
    },
    alternativeNames: ['Baby spinach', 'English spinach'],
    seasonality: ['march', 'april', 'may', 'september', 'october', 'november'],
    origin: 'Persia (Iran)'
  },

  // Fruits
  {
    name: 'Banana',
    description: 'Ripe yellow bananas, naturally sweet and rich in potassium. Great for energy and post-workout recovery.',
    category: 'fruits',
    subcategory: 'tropical',
    nutritionalInfo: {
      calories: 89,
      protein: 1.1,
      carbohydrates: 22.8,
      fat: 0.3,
      fiber: 2.6,
      sugar: 12.2,
      sodium: 1,
      cholesterol: 0,
      saturatedFat: 0.1,
      transFat: 0
    },
    vitaminsAndMinerals: {
      vitaminB6: 0.4,
      vitaminC: 8.7,
      potassium: 358,
      magnesium: 27,
      folate: 20,
      riboflavin: 0.1
    },
    healthProperties: {
      healthBenefits: [
        'High in potassium',
        'Natural energy source',
        'Supports heart health',
        'Good for digestion',
        'May help regulate mood'
      ],
      healthRisks: [],
      dietaryRestrictions: ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'paleo-friendly'],
      allergens: [],
      glycemicIndex: 51,
      antioxidantLevel: 'medium'
    },
    storageInfo: {
      shelfLife: 7,
      storageTemperature: 'room-temperature',
      storageConditions: ['ventilated', 'away-from-light']
    },
    alternativeNames: ['Plantain (when green)'],
    seasonality: ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'],
    origin: 'Southeast Asia'
  },

  // Grains
  {
    name: 'Brown Rice',
    description: 'Whole grain brown rice, unprocessed and nutrient-dense. Higher in fiber and nutrients than white rice.',
    category: 'grains',
    subcategory: 'whole grains',
    nutritionalInfo: {
      calories: 370,
      protein: 7.9,
      carbohydrates: 77.2,
      fat: 2.9,
      fiber: 3.5,
      sugar: 0.7,
      sodium: 7,
      cholesterol: 0,
      saturatedFat: 0.6,
      transFat: 0
    },
    vitaminsAndMinerals: {
      thiamine: 0.4,
      niacin: 5.1,
      vitaminB6: 0.5,
      folate: 20,
      magnesium: 143,
      phosphorus: 333,
      potassium: 223,
      zinc: 2.0,
      iron: 1.5
    },
    healthProperties: {
      healthBenefits: [
        'High in fiber',
        'Complex carbohydrates',
        'Supports digestive health',
        'May help control blood sugar',
        'Rich in minerals'
      ],
      healthRisks: [],
      dietaryRestrictions: ['vegetarian', 'vegan', 'gluten-free', 'dairy-free'],
      allergens: [],
      glycemicIndex: 68,
      antioxidantLevel: 'medium'
    },
    storageInfo: {
      shelfLife: 180,
      storageTemperature: 'cool-dry-place',
      storageConditions: ['dry-place', 'airtight-container', 'away-from-light']
    },
    alternativeNames: ['Whole grain rice', 'Unpolished rice'],
    origin: 'Asia'
  },

  // Proteins
  {
    name: 'Chicken Breast',
    description: 'Lean, skinless chicken breast meat. Excellent source of high-quality protein with minimal fat.',
    category: 'proteins',
    subcategory: 'poultry',
    nutritionalInfo: {
      calories: 165,
      protein: 31.0,
      carbohydrates: 0,
      fat: 3.6,
      fiber: 0,
      sugar: 0,
      sodium: 74,
      cholesterol: 85,
      saturatedFat: 1.0,
      transFat: 0
    },
    vitaminsAndMinerals: {
      niacin: 14.8,
      vitaminB6: 1.0,
      phosphorus: 228,
      potassium: 256,
      zinc: 1.0,
      iron: 0.7,
      magnesium: 29
    },
    healthProperties: {
      healthBenefits: [
        'High quality protein',
        'Supports muscle building',
        'Low in saturated fat',
        'Rich in B vitamins',
        'Supports metabolism'
      ],
      healthRisks: ['Must be cooked thoroughly'],
      dietaryRestrictions: ['gluten-free', 'dairy-free', 'keto-friendly', 'paleo-friendly'],
      allergens: [],
      antioxidantLevel: 'low'
    },
    storageInfo: {
      shelfLife: 2,
      storageTemperature: 'refrigerated',
      storageConditions: ['humidity-controlled']
    },
    alternativeNames: ['Chicken fillet'],
    origin: 'Domestic chicken farms'
  },

  // Spices
  {
    name: 'Turmeric Powder',
    description: 'Ground turmeric root, vibrant yellow spice with anti-inflammatory properties. Essential in curry blends.',
    category: 'spices',
    subcategory: 'ground spices',
    nutritionalInfo: {
      calories: 354,
      protein: 7.8,
      carbohydrates: 64.9,
      fat: 9.9,
      fiber: 21.1,
      sugar: 3.2,
      sodium: 38,
      cholesterol: 0,
      saturatedFat: 3.1,
      transFat: 0
    },
    vitaminsAndMinerals: {
      iron: 41.4,
      potassium: 2525,
      magnesium: 193,
      calcium: 183,
      phosphorus: 268,
      zinc: 4.4,
      vitaminC: 25.9
    },
    healthProperties: {
      healthBenefits: [
        'Powerful anti-inflammatory',
        'Rich in antioxidants',
        'May support joint health',
        'Supports immune system',
        'May help with digestion'
      ],
      healthRisks: ['May interact with blood thinners'],
      dietaryRestrictions: ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'keto-friendly', 'paleo-friendly'],
      allergens: [],
      antioxidantLevel: 'high'
    },
    storageInfo: {
      shelfLife: 730,
      storageTemperature: 'cool-dry-place',
      storageConditions: ['dry-place', 'airtight-container', 'away-from-light']
    },
    alternativeNames: ['Curcuma', 'Indian saffron', 'Haldi'],
    origin: 'Southeast Asia'
  },

  // Nuts and Seeds
  {
    name: 'Almonds',
    description: 'Raw unsalted almonds, rich in healthy fats, protein, and vitamin E. Perfect for snacking or cooking.',
    category: 'nuts-seeds',
    subcategory: 'tree nuts',
    nutritionalInfo: {
      calories: 579,
      protein: 21.2,
      carbohydrates: 21.6,
      fat: 49.9,
      fiber: 12.5,
      sugar: 4.4,
      sodium: 1,
      cholesterol: 0,
      saturatedFat: 3.8,
      transFat: 0
    },
    vitaminsAndMinerals: {
      vitaminE: 25.6,
      magnesium: 270,
      phosphorus: 481,
      potassium: 733,
      calcium: 269,
      iron: 3.7,
      zinc: 3.1,
      riboflavin: 1.1
    },
    healthProperties: {
      healthBenefits: [
        'Heart healthy fats',
        'High in vitamin E',
        'Supports brain health',
        'May help lower cholesterol',
        'Good for skin health'
      ],
      healthRisks: ['High calorie content'],
      dietaryRestrictions: ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'keto-friendly', 'paleo-friendly'],
      allergens: ['tree-nuts'],
      glycemicIndex: 15,
      antioxidantLevel: 'high'
    },
    storageInfo: {
      shelfLife: 365,
      storageTemperature: 'cool-dry-place',
      storageConditions: ['dry-place', 'airtight-container', 'away-from-light']
    },
    alternativeNames: ['Sweet almonds'],
    origin: 'Middle East'
  },

  // Dairy
  {
    name: 'Greek Yogurt',
    description: 'Thick, creamy Greek-style yogurt with live cultures. Higher in protein than regular yogurt.',
    category: 'dairy',
    subcategory: 'cultured dairy',
    nutritionalInfo: {
      calories: 59,
      protein: 10.3,
      carbohydrates: 3.6,
      fat: 0.4,
      fiber: 0,
      sugar: 3.6,
      sodium: 36,
      cholesterol: 5,
      saturatedFat: 0.1,
      transFat: 0
    },
    vitaminsAndMinerals: {
      calcium: 110,
      phosphorus: 135,
      potassium: 141,
      vitaminB12: 0.5,
      riboflavin: 0.3,
      zinc: 0.6
    },
    healthProperties: {
      healthBenefits: [
        'High in probiotics',
        'Excellent protein source',
        'Supports digestive health',
        'Rich in calcium',
        'May boost immune system'
      ],
      healthRisks: [],
      dietaryRestrictions: ['vegetarian', 'gluten-free', 'keto-friendly'],
      allergens: ['dairy'],
      glycemicIndex: 11,
      antioxidantLevel: 'low'
    },
    storageInfo: {
      shelfLife: 14,
      storageTemperature: 'refrigerated',
      storageConditions: ['humidity-controlled']
    },
    alternativeNames: ['Strained yogurt', 'Thick yogurt'],
    origin: 'Greece'
  }
];

async function seedInventory() {
  try {
    console.log(chalk.blue('🌱 Starting inventory seeding...'));

    // Connect to database
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/primrose';
    await mongoose.connect(mongoUri);
    console.log(chalk.green('✅ Connected to MongoDB'));

    // Find admin user
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log(chalk.red('❌ No admin user found. Please run auth seeding first.'));
      process.exit(1);
    }

    // Clear existing inventory items
    const existingCount = await InventoryItem.countDocuments();
    if (existingCount > 0) {
      console.log(chalk.yellow(`🧹 Removing ${existingCount} existing inventory items...`));
      await InventoryItem.deleteMany({});
    }

    // Add admin user references to items
    const itemsWithAdmin = sampleItems.map(item => ({
      ...item,
      addedBy: adminUser._id,
      lastUpdatedBy: adminUser._id
    }));

    // Insert sample items
    console.log(chalk.blue(`📦 Inserting ${itemsWithAdmin.length} inventory items...`));
    const insertedItems = await InventoryItem.insertMany(itemsWithAdmin);

    // Display results
    console.log(chalk.green(`✅ Successfully seeded ${insertedItems.length} inventory items:`));
    
    // Group by category
    const categoryCounts = {};
    insertedItems.forEach(item => {
      categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
    });

    Object.entries(categoryCounts).forEach(([category, count]) => {
      console.log(chalk.cyan(`   ${category}: ${count} items`));
    });

    console.log(chalk.blue('\n📊 Sample API endpoints to try:'));
    console.log(chalk.white('   GET /api/inventory/catalog - Browse all items'));
    console.log(chalk.white('   GET /api/inventory/catalog/categories - Get categories'));
    console.log(chalk.white('   GET /api/inventory/catalog?category=vegetables - Filter by category'));
    console.log(chalk.white('   GET /api/inventory/catalog?search=protein - Search items'));
    console.log(chalk.white('   GET /api/inventory/catalog?dietaryRestrictions=vegan - Filter by diet'));
    console.log(chalk.white('   POST /api/inventory/admin/items - Create new item (admin only)'));

    console.log(chalk.green('\n🎉 Inventory seeding completed successfully!'));

  } catch (error) {
    console.error(chalk.red('❌ Error seeding inventory:'), error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log(chalk.blue('📡 Disconnected from MongoDB'));
  }
}

// Run seeding if called directly
if (require.main === module) {
  seedInventory();
}

module.exports = { seedInventory, sampleItems }; 