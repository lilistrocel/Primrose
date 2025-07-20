const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const chalk = require('chalk');
require('dotenv').config();

// User schema (simplified version for seeding)
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isEmailVerified: { type: Boolean, default: false }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

const seedData = {
  users: [
    {
      email: 'admin@primrose.com',
      password: 'Admin123!',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      isEmailVerified: true
    },
    {
      email: 'john.doe@example.com',
      password: 'User123!',
      firstName: 'John',
      lastName: 'Doe',
      role: 'user',
      isEmailVerified: true
    },
    {
      email: 'jane.smith@example.com',
      password: 'User123!',
      firstName: 'Jane',
      lastName: 'Smith',
      role: 'user',
      isEmailVerified: false
    },
    {
      email: 'test@example.com',
      password: 'Test123!',
      firstName: 'Test',
      lastName: 'User',
      role: 'user',
      isEmailVerified: true
    }
  ]
};

async function hashPassword(password) {
  const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
  return bcrypt.hash(password, saltRounds);
}

async function seedUsers() {
  console.log(chalk.blue('🌱 Seeding users...'));
  
  for (const userData of seedData.users) {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        console.log(chalk.yellow(`⚠️  User ${userData.email} already exists, skipping`));
        continue;
      }
      
      // Hash password
      const hashedPassword = await hashPassword(userData.password);
      
      // Create user
      const user = new User({
        ...userData,
        password: hashedPassword
      });
      
      await user.save();
      console.log(chalk.green(`✅ Created user: ${userData.email} (${userData.role})`));
    } catch (error) {
      console.error(chalk.red(`❌ Error creating user ${userData.email}:`), error.message);
    }
  }
}

async function clearDatabase() {
  console.log(chalk.yellow('🗑️  Clearing existing data...'));
  await User.deleteMany({});
  console.log(chalk.green('✅ Database cleared'));
}

async function connectDatabase() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }
    
    await mongoose.connect(mongoUri);
    console.log(chalk.green('✅ Connected to MongoDB'));
  } catch (error) {
    console.error(chalk.red('❌ Failed to connect to MongoDB:'), error.message);
    process.exit(1);
  }
}

async function runSeeder() {
  try {
    await connectDatabase();
    
    const shouldClear = process.argv.includes('--clear');
    
    if (shouldClear) {
      await clearDatabase();
    }
    
    await seedUsers();
    
    console.log(chalk.blue('\n📋 Seed Summary:'));
    const userCount = await User.countDocuments();
    console.log(chalk.green(`Total users: ${userCount}`));
    
    console.log(chalk.blue('\n🔑 Test Credentials:'));
    console.log('Admin: admin@primrose.com / Admin123!');
    console.log('User: john.doe@example.com / User123!');
    console.log('Test: test@example.com / Test123!');
    
  } catch (error) {
    console.error(chalk.red('❌ Seeding failed:'), error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log(chalk.blue('\n🔒 Database connection closed'));
  }
}

runSeeder(); 