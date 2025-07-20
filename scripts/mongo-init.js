// MongoDB initialization script for Docker
print('Starting MongoDB initialization...');

// Switch to the primrose database
db = db.getSiblingDB('primrose');

// Create a user for the application
db.createUser({
  user: 'primrose_user',
  pwd: 'primrose_password',
  roles: [
    {
      role: 'readWrite',
      db: 'primrose'
    }
  ]
});

// Create some initial collections with indexes
db.createCollection('users');
db.users.createIndex({ email: 1 }, { unique: true });

print('MongoDB initialization completed successfully!'); 