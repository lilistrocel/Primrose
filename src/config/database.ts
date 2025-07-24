import mongoose from 'mongoose';

export async function connectDatabase(): Promise<void> {
  try {
    // Skip connection if already connected (test mode)
    if (mongoose.connection.readyState === 1) {
      console.log('⚠️  MongoDB already connected (test mode)');
      return;
    }

    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }

    // Allow skipping DB connection for testing
    if (process.env.SKIP_DB === 'true') {
      console.log('⚠️  Skipping MongoDB connection (SKIP_DB=true)');
      return;
    }

    await mongoose.connect(mongoUri);
    
    console.log('✅ Connected to MongoDB');
    
    // Handle connection events
    mongoose.connection.on('error', (error) => {
      console.error('❌ MongoDB connection error:', error);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('🔒 MongoDB connection closed through app termination');
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    
    // In development, allow continuing without DB
    if (process.env.NODE_ENV === 'development' && process.env.ALLOW_NO_DB === 'true') {
      console.log('⚠️  Continuing without MongoDB (development mode)');
      return;
    }
    
    throw error;
  }
} 