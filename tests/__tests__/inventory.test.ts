import request from 'supertest';
import { app } from '../../src/index';
import { InventoryItem } from '../../src/modules/inventory/inventory.model';
import { User } from '../../src/modules/auth/auth.model';
import jwt from 'jsonwebtoken';

describe('Inventory Module', () => {
  let adminToken: string;
  let userToken: string;
  let adminUser: any;
  let regularUser: any;
  let sampleItemId: string;

  beforeEach(async () => {
    // Create admin user
    adminUser = new User({
      email: 'admin@test.com',
      password: 'Admin123!',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin'
    });
    await adminUser.save();

    // Create regular user
    regularUser = new User({
      email: 'user@test.com',
      password: 'User123!',
      firstName: 'Regular',
      lastName: 'User',
      role: 'user'
    });
    await regularUser.save();

    // Generate tokens
    adminToken = jwt.sign(
      { userId: adminUser._id.toString() },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    userToken = jwt.sign(
      { userId: regularUser._id.toString() },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    // Create a sample item for testing
    const sampleItem = new InventoryItem({
      name: 'Test Broccoli',
      description: 'Fresh green broccoli for testing purposes',
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
      healthProperties: {
        healthBenefits: ['Rich in vitamins'],
        healthRisks: [],
        dietaryRestrictions: ['vegetarian', 'vegan'],
        allergens: []
      },
      storageInfo: {
        shelfLife: 7,
        storageTemperature: 'refrigerated',
        storageConditions: ['humidity-controlled']
      },
      addedBy: adminUser._id,
      lastUpdatedBy: adminUser._id
    });
    await sampleItem.save();
    sampleItemId = (sampleItem._id as any).toString();
  });

  afterEach(async () => {
    await InventoryItem.deleteMany({});
    await User.deleteMany({});
  });

  describe('Admin Item Management', () => {
    describe('POST /api/inventory/admin/items', () => {
      it('should create a new inventory item with admin token', async () => {
        const newItem = {
          name: 'Fresh Spinach',
          description: 'Organic baby spinach leaves',
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
          healthProperties: {
            healthBenefits: ['High in iron', 'Rich in antioxidants'],
            healthRisks: ['Contains oxalates'],
            dietaryRestrictions: ['vegetarian', 'vegan', 'gluten-free'],
            allergens: []
          },
          storageInfo: {
            shelfLife: 5,
            storageTemperature: 'refrigerated',
            storageConditions: ['humidity-controlled']
          }
        };

        const response = await request(app)
          .post('/api/inventory/admin/items')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(newItem)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.item.name).toBe('Fresh Spinach');
        expect(response.body.data.item.category).toBe('vegetables');
        expect(response.body.data.item.nutritionalInfo.calories).toBe(23);
      });

      it('should reject item creation with non-admin token', async () => {
        const newItem = {
          name: 'Test Item',
          description: 'Test description',
          category: 'vegetables'
        };

        await request(app)
          .post('/api/inventory/admin/items')
          .set('Authorization', `Bearer ${userToken}`)
          .send(newItem)
          .expect(403);
      });

      it('should reject item creation without token', async () => {
        const newItem = {
          name: 'Test Item',
          description: 'Test description',
          category: 'vegetables'
        };

        await request(app)
          .post('/api/inventory/admin/items')
          .send(newItem)
          .expect(401);
      });

      it('should reject item with duplicate name', async () => {
        const duplicateItem = {
          name: 'Test Broccoli', // Same as existing item
          description: 'Another broccoli item',
          category: 'vegetables',
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
          healthProperties: {
            healthBenefits: ['Rich in vitamins'],
            healthRisks: [],
            dietaryRestrictions: ['vegetarian'],
            allergens: []
          },
          storageInfo: {
            shelfLife: 7,
            storageTemperature: 'refrigerated',
            storageConditions: ['humidity-controlled']
          }
        };

        await request(app)
          .post('/api/inventory/admin/items')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(duplicateItem)
          .expect(409);
      });
    });

    describe('PUT /api/inventory/admin/items/:id', () => {
      it('should update an existing item with admin token', async () => {
        const updates = {
          description: 'Updated description for broccoli',
          nutritionalInfo: {
            calories: 35, // Updated value
            protein: 2.8,
            carbohydrates: 6.6,
            fat: 0.4,
            fiber: 2.6,
            sugar: 1.5,
            sodium: 33,
            cholesterol: 0,
            saturatedFat: 0.1,
            transFat: 0
          }
        };

        const response = await request(app)
          .put(`/api/inventory/admin/items/${sampleItemId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send(updates)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.item.description).toBe('Updated description for broccoli');
        expect(response.body.data.item.nutritionalInfo.calories).toBe(35);
      });

      it('should reject update with non-admin token', async () => {
        const updates = { description: 'Unauthorized update' };

        await request(app)
          .put(`/api/inventory/admin/items/${sampleItemId}`)
          .set('Authorization', `Bearer ${userToken}`)
          .send(updates)
          .expect(403);
      });
    });

    describe('DELETE /api/inventory/admin/items/:id', () => {
      it('should soft delete an item (set isAvailable to false)', async () => {
        const response = await request(app)
          .delete(`/api/inventory/admin/items/${sampleItemId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.item.isAvailable).toBe(false);

        // Verify item is no longer available in catalog
        const catalogResponse = await request(app)
          .get('/api/inventory/catalog')
          .expect(200);

        const items = catalogResponse.body.data.items;
        const deletedItem = items.find((item: any) => item.id === sampleItemId);
        expect(deletedItem).toBeUndefined();
      });
    });

    describe('GET /api/inventory/admin/items', () => {
      it('should get all items (including unavailable) for admin', async () => {
        // Create an unavailable item
        const unavailableItem = new InventoryItem({
          name: 'Unavailable Item',
          description: 'This item is not available',
          category: 'vegetables',
          isAvailable: false,
          nutritionalInfo: {
            calories: 10,
            protein: 1,
            carbohydrates: 2,
            fat: 0.1,
            fiber: 0.5,
            sugar: 0.2,
            sodium: 5,
            cholesterol: 0,
            saturatedFat: 0,
            transFat: 0
          },
          healthProperties: {
            healthBenefits: [],
            healthRisks: [],
            dietaryRestrictions: [],
            allergens: []
          },
          storageInfo: {
            shelfLife: 1,
            storageTemperature: 'refrigerated',
            storageConditions: []
          },
          addedBy: adminUser._id,
          lastUpdatedBy: adminUser._id
        });
        await unavailableItem.save();

        const response = await request(app)
          .get('/api/inventory/admin/items')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.items).toHaveLength(2); // Both available and unavailable
        expect(response.body.data.pagination).toBeDefined();
      });
    });
  });

  describe('Public Catalog Access', () => {
    describe('GET /api/inventory/catalog', () => {
      it('should get available items without authentication', async () => {
        const response = await request(app)
          .get('/api/inventory/catalog')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.items).toHaveLength(1);
        expect(response.body.data.items[0].name).toBe('Test Broccoli');
        expect(response.body.data.pagination).toBeDefined();
      });

      it('should filter items by category', async () => {
        // Create an item in a different category
        const fruitItem = new InventoryItem({
          name: 'Test Apple',
          description: 'Red apple for testing',
          category: 'fruits',
          nutritionalInfo: {
            calories: 52,
            protein: 0.3,
            carbohydrates: 14,
            fat: 0.2,
            fiber: 2.4,
            sugar: 10,
            sodium: 1,
            cholesterol: 0,
            saturatedFat: 0,
            transFat: 0
          },
          healthProperties: {
            healthBenefits: ['High in fiber'],
            healthRisks: [],
            dietaryRestrictions: ['vegetarian', 'vegan'],
            allergens: []
          },
          storageInfo: {
            shelfLife: 30,
            storageTemperature: 'refrigerated',
            storageConditions: []
          },
          addedBy: adminUser._id,
          lastUpdatedBy: adminUser._id
        });
        await fruitItem.save();

        const response = await request(app)
          .get('/api/inventory/catalog?category=vegetables')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.items).toHaveLength(1);
        expect(response.body.data.items[0].category).toBe('vegetables');
      });

      it('should search items by name', async () => {
        const response = await request(app)
          .get('/api/inventory/catalog?search=broccoli')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.items).toHaveLength(1);
        expect(response.body.data.items[0].name).toContain('Broccoli');
      });

      it('should filter by dietary restrictions', async () => {
        const response = await request(app)
          .get('/api/inventory/catalog?dietaryRestrictions=vegan')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.items).toHaveLength(1);
        expect(response.body.data.items[0].healthProperties.dietaryRestrictions).toContain('vegan');
      });
    });

    describe('GET /api/inventory/catalog/categories', () => {
      it('should get categories with item counts', async () => {
        const response = await request(app)
          .get('/api/inventory/catalog/categories')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.categories).toHaveLength(1);
        expect(response.body.data.categories[0].category).toBe('vegetables');
        expect(response.body.data.categories[0].count).toBe(1);
      });
    });

    describe('GET /api/inventory/catalog/items/:id', () => {
      it('should get a single item from catalog', async () => {
        const response = await request(app)
          .get(`/api/inventory/catalog/items/${sampleItemId}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.item.name).toBe('Test Broccoli');
        expect(response.body.data.item.addedBy).toBeUndefined(); // Admin fields should be excluded
      });

      it('should return 404 for non-existent item', async () => {
        const fakeId = '507f1f77bcf86cd799439011';
        await request(app)
          .get(`/api/inventory/catalog/items/${fakeId}`)
          .expect(404);
      });
    });

    describe('POST /api/inventory/catalog/compare', () => {
      it('should compare nutrition for multiple items', async () => {
        // Create another item for comparison
        const secondItem = new InventoryItem({
          name: 'Test Carrot',
          description: 'Orange carrot for testing',
          category: 'vegetables',
          nutritionalInfo: {
            calories: 41,
            protein: 0.9,
            carbohydrates: 10,
            fat: 0.2,
            fiber: 2.8,
            sugar: 4.7,
            sodium: 69,
            cholesterol: 0,
            saturatedFat: 0,
            transFat: 0
          },
          healthProperties: {
            healthBenefits: ['High in beta-carotene'],
            healthRisks: [],
            dietaryRestrictions: ['vegetarian', 'vegan'],
            allergens: []
          },
          storageInfo: {
            shelfLife: 14,
            storageTemperature: 'refrigerated',
            storageConditions: []
          },
          addedBy: adminUser._id,
          lastUpdatedBy: adminUser._id
        });
        await secondItem.save();

        const response = await request(app)
          .post('/api/inventory/catalog/compare')
          .send({ itemIds: [sampleItemId, (secondItem._id as any).toString()] })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.comparison).toHaveLength(2);
        expect(response.body.data.comparison[0].nutritionalInfo).toBeDefined();
        expect(response.body.data.comparison[1].nutritionalInfo).toBeDefined();
      });

      it('should reject comparison with invalid item IDs', async () => {
        await request(app)
          .post('/api/inventory/catalog/compare')
          .send({ itemIds: ['invalid-id'] })
          .expect(400);
      });

      it('should reject comparison with too many items', async () => {
        const manyIds = new Array(11).fill(sampleItemId); // More than 10 items
        await request(app)
          .post('/api/inventory/catalog/compare')
          .send({ itemIds: manyIds })
          .expect(400);
      });
    });
  });
}); 