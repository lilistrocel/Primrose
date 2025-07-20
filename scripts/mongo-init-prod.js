// Production MongoDB initialization script
print('🔧 Starting production MongoDB initialization...');

// Switch to the primrose database
db = db.getSiblingDB('primrose');

// Create application user with strong password from environment
const username = 'primrose_user';
const password = process.env.MONGODB_PASSWORD || 'change-this-password';

print(`📝 Creating application user: ${username}`);

db.createUser({
  user: username,
  pwd: password,
  roles: [
    {
      role: 'readWrite',
      db: 'primrose'
    }
  ]
});

// Create optimized indexes for production
print('📊 Creating production indexes...');

// Users collection indexes
db.createCollection('users');
db.users.createIndex({ email: 1 }, { unique: true, background: true });
db.users.createIndex({ createdAt: 1 }, { background: true });
db.users.createIndex({ role: 1 }, { background: true });
db.users.createIndex({ isEmailVerified: 1 }, { background: true });

// Compound indexes for common queries
db.users.createIndex({ email: 1, role: 1 }, { background: true });
db.users.createIndex({ isEmailVerified: 1, createdAt: -1 }, { background: true });

// Create sessions collection for future session management
db.createCollection('sessions');
db.sessions.createIndex({ userId: 1 }, { background: true });
db.sessions.createIndex({ createdAt: 1 }, { expireAfterSeconds: 86400 }); // 24 hours TTL

// Create logs collection for application logging
db.createCollection('logs');
db.logs.createIndex({ timestamp: 1 }, { background: true });
db.logs.createIndex({ level: 1, timestamp: -1 }, { background: true });
db.logs.createIndex({ createdAt: 1 }, { expireAfterSeconds: 2592000 }); // 30 days TTL

print('✅ Production MongoDB initialization completed successfully!');
print('📋 Collections created: users, sessions, logs');
print('🔐 Indexes optimized for production queries');
print('⏰ TTL indexes configured for automatic cleanup'); 