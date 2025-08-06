const mongoose = require('mongoose');
const chalk = require('chalk');
const readline = require('readline');
require('dotenv').config();

const { InventoryItem } = require('../dist/modules/inventory/inventory.model');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.toLowerCase().trim());
    });
  });
}

async function clearInventory() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/primrose');
    console.log(chalk.green('🔌 Connecting to MongoDB...'));
    
    // Get current count
    const currentCount = await InventoryItem.countDocuments();
    
    console.log(`\n${chalk.blue('🗑️  CLEAR INVENTORY DATABASE')}`);
    console.log(chalk.blue('============================='));
    console.log(`\n📊 Current database contains: ${chalk.cyan(currentCount)} items`);
    
    if (currentCount === 0) {
      console.log(chalk.yellow('ℹ️  Database is already empty - nothing to clear'));
      return;
    }
    
    // Check for --force flag
    const hasForceFlag = process.argv.includes('--force');
    
    if (!hasForceFlag) {
      const answer = await askQuestion(`⚠️  Are you sure you want to delete ALL ${currentCount} inventory items? (type 'yes' to confirm): `);
      
      if (answer.toLowerCase() !== 'yes') {
        console.log(chalk.yellow('ℹ️  Operation cancelled - no items were deleted'));
        return;
      }
      
      const doubleConfirm = await askQuestion(`🚨 FINAL CONFIRMATION: Type 'DELETE' to permanently remove all ${currentCount} items: `);
      
      if (doubleConfirm !== 'DELETE') {
        console.log(chalk.yellow('ℹ️  Operation cancelled - no items were deleted'));
        return;
      }
    }
    
    console.log(chalk.yellow('\n🗑️  Deleting all inventory items...'));
    await InventoryItem.deleteMany({});
    
    const finalCount = await InventoryItem.countDocuments();
    console.log(chalk.green(`✅ Successfully deleted ${currentCount} items`));
    console.log(chalk.green(`📊 Final count: ${finalCount} items`));
    
  } catch (error) {
    console.error(chalk.red('❌ Error:'), error.message);
  } finally {
    rl.close();
    await mongoose.disconnect();
  }
}

process.on('SIGINT', async () => {
  console.log(chalk.yellow('\n\n⚠️  Operation cancelled by user'));
  rl.close();
  await mongoose.disconnect();
  process.exit(0);
});

clearInventory(); 