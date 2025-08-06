const mongoose = require('mongoose');
const chalk = require('chalk');
require('dotenv').config();

const { InventoryItem } = require('../dist/modules/inventory/inventory.model');

async function countInventory() {
  try {
    console.log(chalk.blue('🔌 Connecting to MongoDB...'));
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log(chalk.cyan.bold('\n📊 INVENTORY COUNT REPORT'));
    console.log(chalk.cyan('==========================\n'));
    
    // Total count
    const totalCount = await InventoryItem.countDocuments();
    console.log(chalk.green(`📦 Total Items: ${totalCount}\n`));
    
    // Count by category
    const categories = await InventoryItem.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    console.log(chalk.blue('📋 Breakdown by Category:'));
    categories.forEach(cat => {
      console.log(chalk.blue(`   • ${cat._id}: ${cat.count} items`));
    });
    
    // Count by availability
    const availableCount = await InventoryItem.countDocuments({ isAvailable: true });
    const unavailableCount = totalCount - availableCount;
    
    console.log(chalk.green(`\n✅ Available: ${availableCount} items`));
    console.log(chalk.yellow(`⚠️  Unavailable: ${unavailableCount} items`));
    
    console.log(chalk.green('\n✅ Count complete!'));
    
  } catch (error) {
    console.error(chalk.red('❌ Error:'), error.message);
  } finally {
    await mongoose.disconnect();
  }
}

countInventory(); 