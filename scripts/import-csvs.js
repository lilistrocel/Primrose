const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const chalk = require('chalk');
const readline = require('readline');
require('dotenv').config();

// Import the InventoryItem model
const { InventoryItem } = require('../dist/modules/inventory/inventory.model');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// CSV file mapping with metadata
const CSV_FILES = [
  // Fresh & Whole Foods
  { file: 'vegetables_inventory.csv', category: 'vegetables', name: 'Fresh Vegetables', items: 35 },
  { file: 'fruits_inventory.csv', category: 'fruits', name: 'Fresh Fruits', items: 30 },
  { file: 'grains_inventory.csv', category: 'grains', name: 'Whole Grains', items: 20 },
  { file: 'legumes_inventory.csv', category: 'legumes', name: 'Dried Legumes', items: 25 },
  { file: 'proteins_inventory.csv', category: 'proteins', name: 'Fresh Proteins', items: 24 },
  { file: 'dairy_inventory.csv', category: 'dairy', name: 'Dairy Products', items: 30 },
  { file: 'nuts_seeds_inventory.csv', category: 'nuts-seeds', name: 'Nuts & Seeds', items: 27 },
  { file: 'spices_inventory.csv', category: 'spices', name: 'Spices & Herbs', items: 30 },
  { file: 'oils_inventory.csv', category: 'oils', name: 'Oils & Fats', items: 24 },
  { file: 'beverages_inventory.csv', category: 'beverages', name: 'Natural Beverages', items: 23 },
  { file: 'sweeteners_inventory.csv', category: 'sweeteners', name: 'Natural Sweeteners', items: 18 },
  
  // Minimally Processed Foods
  { file: 'fermented_inventory.csv', category: 'fermented', name: 'Fermented Foods', items: 20 },
  { file: 'traditional_processed_inventory.csv', category: 'traditional-processed', name: 'Traditional Processed', items: 19 },
  { file: 'canned_preserved_inventory.csv', category: 'canned-preserved', name: 'Canned & Preserved', items: 24 }
];

const TOTAL_EXPECTED_ITEMS = CSV_FILES.reduce((sum, file) => sum + file.items, 0);

// Helper function to ask user questions
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.toLowerCase().trim());
    });
  });
}

// Helper function to convert seasonality values
function convertSeasonality(seasonalityStr) {
  if (!seasonalityStr) return [];
  
  const seasons = seasonalityStr.split('|').map(s => s.trim()).filter(s => s);
  const months = [];
  
  for (const season of seasons) {
    switch (season.toLowerCase()) {
      case 'year-round':
        return ['january', 'february', 'march', 'april', 'may', 'june', 
                'july', 'august', 'september', 'october', 'november', 'december'];
      case 'spring':
        months.push('march', 'april', 'may');
        break;
      case 'summer':
        months.push('june', 'july', 'august');
        break;
      case 'fall':
      case 'autumn':
        months.push('september', 'october', 'november');
        break;
      case 'winter':
        months.push('december', 'january', 'february');
        break;
      case 'spring harvest':
        months.push('march', 'april', 'may');
        break;
      case 'summer harvest':
        months.push('june', 'july', 'august');
        break;
      case 'fall harvest':
        months.push('september', 'october', 'november');
        break;
      default:
        // Check if it's already a month name
        const monthNames = ['january', 'february', 'march', 'april', 'may', 'june', 
                           'july', 'august', 'september', 'october', 'november', 'december'];
        if (monthNames.includes(season.toLowerCase())) {
          months.push(season.toLowerCase());
        }
        break;
    }
  }
  
  // Remove duplicates and return
  return [...new Set(months)];
}

// Helper function to convert storage conditions
function convertStorageConditions(conditionsStr) {
  if (!conditionsStr) return [];
  
  const conditions = conditionsStr.split('|').map(s => s.trim()).filter(s => s);
  const converted = [];
  
  for (const condition of conditions) {
    switch (condition.toLowerCase()) {
      case 'cool-dry-place':
        converted.push('cool-dry-place');
        break;
      case 'perforated bag':
        converted.push('perforated-bag');
        break;
      case 'freezer-safe':
        converted.push('freezer-safe');
        break;
      case 'original packaging':
        converted.push('original-packaging');
        break;
      default:
        // Use as-is if it matches our enum
        const validConditions = ['dry-place', 'away-from-light', 'airtight-container', 
                                'ventilated', 'humidity-controlled', 'cool-dry-place', 
                                'freezer-safe', 'perforated-bag', 'original-packaging'];
        if (validConditions.includes(condition.toLowerCase().replace(/\s+/g, '-'))) {
          converted.push(condition.toLowerCase().replace(/\s+/g, '-'));
        }
        break;
    }
  }
  
  return converted;
}

// Helper function to parse CSV data
function parseCSVFile(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    const stream = fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => {
        try {
          // Transform CSV data to match our schema
          const item = transformCSVToItem(data);
          results.push(item);
        } catch (error) {
          console.error(chalk.red(`Error parsing row in ${filePath}:`), error.message);
        }
      })
      .on('end', () => {
        resolve(results);
      })
      .on('error', reject);
  });
}

// Transform CSV data to InventoryItem format
function transformCSVToItem(csvRow) {
  // Parse arrays and objects from pipe-separated strings
  const parseArray = (str) => str ? str.split('|').map(s => s.trim()).filter(s => s) : [];
  const parseAllergens = (str) => str ? str.split(',').map(s => s.trim()).filter(s => s) : [];
  
  // Parse vitamins and minerals (only include if they exist)
  const vitaminsAndMinerals = {};
  if (csvRow.vitaminA && parseFloat(csvRow.vitaminA) > 0) vitaminsAndMinerals.vitaminA = parseFloat(csvRow.vitaminA);
  if (csvRow.vitaminC && parseFloat(csvRow.vitaminC) > 0) vitaminsAndMinerals.vitaminC = parseFloat(csvRow.vitaminC);
  if (csvRow.vitaminK && parseFloat(csvRow.vitaminK) > 0) vitaminsAndMinerals.vitaminK = parseFloat(csvRow.vitaminK);
  if (csvRow.vitaminE && parseFloat(csvRow.vitaminE) > 0) vitaminsAndMinerals.vitaminE = parseFloat(csvRow.vitaminE);
  if (csvRow.folate && parseFloat(csvRow.folate) > 0) vitaminsAndMinerals.folate = parseFloat(csvRow.folate);
  if (csvRow.iron && parseFloat(csvRow.iron) > 0) vitaminsAndMinerals.iron = parseFloat(csvRow.iron);
  if (csvRow.calcium && parseFloat(csvRow.calcium) > 0) vitaminsAndMinerals.calcium = parseFloat(csvRow.calcium);
  if (csvRow.potassium && parseFloat(csvRow.potassium) > 0) vitaminsAndMinerals.potassium = parseFloat(csvRow.potassium);
  if (csvRow.magnesium && parseFloat(csvRow.magnesium) > 0) vitaminsAndMinerals.magnesium = parseFloat(csvRow.magnesium);

  return {
    name: csvRow.name,
    description: csvRow.description,
    category: csvRow.category,
    subcategory: csvRow.subcategory || undefined,
    baseUnit: csvRow.baseUnit || 'grams',
    minimumQuantity: parseInt(csvRow.minimumQuantity) || 1,
    isAvailable: csvRow.isAvailable === 'true',
    
    nutritionalInfo: {
      calories: parseFloat(csvRow.calories) || 0,
      protein: parseFloat(csvRow.protein) || 0,
      carbohydrates: parseFloat(csvRow.carbohydrates) || 0,
      fat: parseFloat(csvRow.fat) || 0,
      fiber: parseFloat(csvRow.fiber) || 0,
      sugar: parseFloat(csvRow.sugar) || 0,
      sodium: parseFloat(csvRow.sodium) || 0,
      cholesterol: parseFloat(csvRow.cholesterol) || 0,
      saturatedFat: parseFloat(csvRow.saturatedFat) || 0,
      transFat: parseFloat(csvRow.transFat) || 0
    },
    
    vitaminsAndMinerals: Object.keys(vitaminsAndMinerals).length > 0 ? vitaminsAndMinerals : undefined,
    
    healthProperties: {
      healthBenefits: parseArray(csvRow.healthBenefits),
      healthRisks: parseArray(csvRow.healthRisks),
      dietaryRestrictions: parseArray(csvRow.dietaryRestrictions),
      allergens: parseAllergens(csvRow.allergens),
      glycemicIndex: csvRow.glycemicIndex ? parseInt(csvRow.glycemicIndex) : undefined,
      antioxidantLevel: csvRow.antioxidantLevel || undefined
    },
    
    storageInfo: {
      shelfLife: parseInt(csvRow.shelfLife) || 1,
      storageTemperature: csvRow.storageTemperature || 'room-temperature',
      storageConditions: convertStorageConditions(csvRow.storageConditions)
    },
    
    alternativeNames: parseArray(csvRow.alternativeNames),
    seasonality: convertSeasonality(csvRow.seasonality),
    origin: csvRow.origin || undefined,
    
    // We'll set these to a default admin user ID that should exist
    addedBy: null, // Will be set after finding admin user
    lastUpdatedBy: null // Will be set after finding admin user
  };
}

// Connect to database
async function connectToDatabase() {
  try {
    console.log(chalk.blue('🔌 Connecting to MongoDB...'));
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(chalk.green('✅ Connected to MongoDB successfully'));
  } catch (error) {
    console.error(chalk.red('❌ Failed to connect to MongoDB:'), error.message);
    process.exit(1);
  }
}

// Find or create admin user for import attribution
async function findAdminUser() {
  try {
    const { User } = require('../dist/modules/auth/auth.model');
    let adminUser = await User.findOne({ role: 'admin' });
    
    if (!adminUser) {
      console.log(chalk.yellow('⚠️  No admin user found. Creating default admin for imports...'));
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('Admin123!', 12);
      
      adminUser = await User.create({
        firstName: 'System',
        lastName: 'Admin',
        email: 'system.admin@primrose.com',
        password: hashedPassword,
        role: 'admin'
      });
      
      console.log(chalk.green('✅ Created system admin user for imports'));
    }
    
    return adminUser._id;
  } catch (error) {
    console.error(chalk.red('❌ Error handling admin user:'), error.message);
    throw error;
  }
}

// Clear existing inventory
async function clearInventory() {
  try {
    const count = await InventoryItem.countDocuments();
    if (count > 0) {
      console.log(chalk.yellow(`🗑️  Clearing ${count} existing items...`));
      await InventoryItem.deleteMany({});
      console.log(chalk.green('✅ Database cleared successfully'));
    } else {
      console.log(chalk.blue('ℹ️  Database is already empty'));
    }
  } catch (error) {
    console.error(chalk.red('❌ Error clearing database:'), error.message);
    throw error;
  }
}

// Import single CSV file
async function importCSVFile(fileInfo, adminUserId) {
  const csvPath = path.join(__dirname, '..', 'import-data', fileInfo.file);
  
  // Check if file exists
  if (!fs.existsSync(csvPath)) {
    console.log(chalk.red(`❌ File not found: ${fileInfo.file}`));
    return { success: false, imported: 0, errors: [`File not found: ${fileInfo.file}`] };
  }
  
  try {
    console.log(chalk.blue(`\n📂 Processing ${fileInfo.name} (${fileInfo.file})...`));
    
    const items = await parseCSVFile(csvPath);
    console.log(chalk.blue(`   📊 Parsed ${items.length} items from CSV`));
    
    let imported = 0;
    const errors = [];
    
    for (const itemData of items) {
      try {
        // Set admin user for attribution
        itemData.addedBy = adminUserId;
        itemData.lastUpdatedBy = adminUserId;
        
        // Create the item
        await InventoryItem.create(itemData);
        imported++;
        
        // Show progress for larger files
        if (items.length > 10 && imported % 5 === 0) {
          process.stdout.write(chalk.green(`   ✅ ${imported}/${items.length} imported...\r`));
        }
      } catch (error) {
        errors.push(`${itemData.name}: ${error.message}`);
      }
    }
    
    if (imported > 0) {
      console.log(chalk.green(`   ✅ Successfully imported ${imported}/${items.length} items`));
    }
    
    if (errors.length > 0) {
      console.log(chalk.yellow(`   ⚠️  ${errors.length} errors occurred`));
      errors.slice(0, 3).forEach(error => {
        console.log(chalk.yellow(`      • ${error}`));
      });
      if (errors.length > 3) {
        console.log(chalk.yellow(`      ... and ${errors.length - 3} more errors`));
      }
    }
    
    return { success: imported > 0, imported, errors };
  } catch (error) {
    console.error(chalk.red(`❌ Error processing ${fileInfo.file}:`), error.message);
    return { success: false, imported: 0, errors: [error.message] };
  }
}

// Main import function
async function importAllCSVs() {
  console.log(chalk.cyan.bold('\n🚀 PRIMROSE CSV IMPORT TOOL'));
  console.log(chalk.cyan('=====================================\n'));
  
  try {
    // Connect to database
    await connectToDatabase();
    
    // Get admin user
    const adminUserId = await findAdminUser();
    
    // Check current database state
    const currentCount = await InventoryItem.countDocuments();
    console.log(chalk.blue(`📊 Current database contains: ${currentCount} items`));
    console.log(chalk.blue(`📋 Ready to import: ${TOTAL_EXPECTED_ITEMS} items from ${CSV_FILES.length} categories\n`));
    
    // Ask user about clearing database
    let shouldClear = false;
    if (currentCount > 0) {
      const clearAnswer = await askQuestion(
        chalk.yellow(`⚠️  Database contains ${currentCount} items. Clear before import? (y/N): `)
      );
      shouldClear = clearAnswer === 'y' || clearAnswer === 'yes';
      
      if (shouldClear) {
        await clearInventory();
      } else {
        console.log(chalk.blue('ℹ️  Proceeding with existing data (duplicates may occur)\n'));
      }
    }
    
    // Ask for confirmation
    const confirmAnswer = await askQuestion(
      chalk.green(`🚀 Ready to import ${TOTAL_EXPECTED_ITEMS} items. Continue? (Y/n): `)
    );
    
    if (confirmAnswer === 'n' || confirmAnswer === 'no') {
      console.log(chalk.yellow('❌ Import cancelled by user'));
      return;
    }
    
    // Start import process
    console.log(chalk.green.bold('\n🎯 Starting import process...\n'));
    
    let totalImported = 0;
    let totalErrors = 0;
    const failedFiles = [];
    
    const startTime = Date.now();
    
    // Import each CSV file
    for (let i = 0; i < CSV_FILES.length; i++) {
      const fileInfo = CSV_FILES[i];
      const result = await importCSVFile(fileInfo, adminUserId);
      
      totalImported += result.imported;
      totalErrors += result.errors.length;
      
      if (!result.success) {
        failedFiles.push(fileInfo.file);
      }
      
      // Show overall progress
      console.log(chalk.blue(`   📈 Overall progress: ${i + 1}/${CSV_FILES.length} files processed`));
    }
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    // Final report
    console.log(chalk.green.bold('\n🎉 IMPORT COMPLETE!'));
    console.log(chalk.green('===================\n'));
    
    console.log(chalk.green(`✅ Successfully imported: ${totalImported} items`));
    console.log(chalk.blue(`⏱️  Import duration: ${duration} seconds`));
    console.log(chalk.blue(`📊 Expected items: ${CSV_FILES.reduce((sum, file) => sum + (file.expectedItems || 0), 0)}`));
    console.log(chalk.blue(`🎯 Success rate: ${((totalImported / (totalImported + totalErrors)) * 100).toFixed(1)}%`));
    
    if (totalErrors > 0) {
      console.log(chalk.yellow(`⚠️  Total errors: ${totalErrors}`));
    }
    
    if (failedFiles.length > 0) {
      console.log(chalk.red(`❌ Failed files: ${failedFiles.join(', ')}`));
    }
    
    // Final count
    const finalCount = await InventoryItem.countDocuments();
    console.log(chalk.cyan(`\n📊 Final database count: ${finalCount} items`));
    
    console.log(chalk.blue('\n📋 Import breakdown by category:'));
    const categories = await InventoryItem.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    for (const cat of categories) {
      const icon = totalErrors > 0 ? '⚠️ ' : '✅';
      console.log(chalk.cyan(`   ${icon} ${cat._id}: ${cat.count} items`));
    }
    
    console.log(chalk.green.bold('\n🚀 Database is ready for use!\n'));
    
  } catch (error) {
    console.log(chalk.red.bold('\n💥 IMPORT FAILED!'));
    console.log(chalk.red(`Error: ${error.message}`));
    console.log(chalk.gray(`Stack: ${error.stack}`));
  } finally {
    // Close database connection
    await mongoose.disconnect();
    console.log(chalk.blue('👋 Disconnected from database. Goodbye!'));
    rl.close();
  }
}

// Export the function to be called from the command line
module.exports = importAllCSVs;

// Run import if called directly
if (require.main === module) {
  importAllCSVs().catch(console.error);
}