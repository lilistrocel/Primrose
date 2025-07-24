import { Request, Response, NextFunction } from 'express';
import { InventoryItem } from './inventory.model';
import { createError } from '../../middleware/errorHandler';
import { 
  createItemSchema, 
  updateItemSchema, 
  catalogQuerySchema, 
  itemIdSchema 
} from './inventory.validation';
import { Types } from 'mongoose';

export class InventoryController {
  // Admin: Create new inventory item
  static async createItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate request body
      const { error, value } = createItemSchema.validate(req.body);
      if (error) {
        return next(createError(error.details[0]?.message || 'Validation error', 400));
      }

      // Check if user is admin
      const user = (req as any).user;
      if (!user || user.role !== 'admin') {
        return next(createError('Admin access required', 403));
      }

      // Check if item with same name already exists
      const existingItem = await InventoryItem.findOne({ 
        name: { $regex: new RegExp(`^${value.name}$`, 'i') } 
      });
      if (existingItem) {
        return next(createError('An item with this name already exists', 409));
      }

      // Create new item
      const itemData = {
        ...value,
        addedBy: new Types.ObjectId(user.userId),
        lastUpdatedBy: new Types.ObjectId(user.userId)
      };

      const item = new InventoryItem(itemData);
      await item.save();

      res.status(201).json({
        success: true,
        message: 'Inventory item created successfully',
        data: {
          item: item.toJSON()
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Admin: Update inventory item
  static async updateItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate item ID
      const { error: idError, value: idValue } = itemIdSchema.validate(req.params);
      if (idError) {
        return next(createError('Invalid item ID', 400));
      }

      // Validate request body
      const { error, value } = updateItemSchema.validate(req.body);
      if (error) {
        return next(createError(error.details[0]?.message || 'Validation error', 400));
      }

      // Check if user is admin
      const user = (req as any).user;
      if (!user || user.role !== 'admin') {
        return next(createError('Admin access required', 403));
      }

      // Find item
      const item = await InventoryItem.findById(idValue.id);
      if (!item) {
        return next(createError('Item not found', 404));
      }

      // Check for name conflicts (if name is being updated)
      if (value.name && value.name !== item.name) {
        const existingItem = await InventoryItem.findOne({ 
          name: { $regex: new RegExp(`^${value.name}$`, 'i') },
          _id: { $ne: item._id }
        });
        if (existingItem) {
          return next(createError('An item with this name already exists', 409));
        }
      }

      // Update item
      const updateData = {
        ...value,
        lastUpdatedBy: new Types.ObjectId(user.userId)
      };

      const updatedItem = await InventoryItem.findByIdAndUpdate(
        idValue.id,
        updateData,
        { new: true, runValidators: true }
      );

      res.status(200).json({
        success: true,
        message: 'Inventory item updated successfully',
        data: {
          item: updatedItem?.toJSON()
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Admin: Delete inventory item (soft delete by setting isAvailable to false)
  static async deleteItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate item ID
      const { error: idError, value: idValue } = itemIdSchema.validate(req.params);
      if (idError) {
        return next(createError('Invalid item ID', 400));
      }

      // Check if user is admin
      const user = (req as any).user;
      if (!user || user.role !== 'admin') {
        return next(createError('Admin access required', 403));
      }

      // Find and soft delete item
      const item = await InventoryItem.findByIdAndUpdate(
        idValue.id,
        { 
          isAvailable: false,
          lastUpdatedBy: new Types.ObjectId(user.userId)
        },
        { new: true }
      );

      if (!item) {
        return next(createError('Item not found', 404));
      }

      res.status(200).json({
        success: true,
        message: 'Inventory item deleted successfully',
        data: {
          item: item.toJSON()
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Admin: Get single item with full details
  static async getItemById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate item ID
      const { error: idError, value: idValue } = itemIdSchema.validate(req.params);
      if (idError) {
        return next(createError('Invalid item ID', 400));
      }

      // Check if user is admin
      const user = (req as any).user;
      if (!user || user.role !== 'admin') {
        return next(createError('Admin access required', 403));
      }

      // Find item with admin details
      const item = await InventoryItem.findById(idValue.id)
        .populate('addedBy', 'firstName lastName email')
        .populate('lastUpdatedBy', 'firstName lastName email');

      if (!item) {
        return next(createError('Item not found', 404));
      }

      res.status(200).json({
        success: true,
        data: {
          item: item.toJSON()
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Admin: Get all items (including unavailable ones) with pagination
  static async getAllItems(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Check if user is admin
      const user = (req as any).user;
      if (!user || user.role !== 'admin') {
        return next(createError('Admin access required', 403));
      }

      // Validate query parameters
      const { error, value } = catalogQuerySchema.validate(req.query);
      if (error) {
        return next(createError(error.details[0]?.message || 'Invalid query parameters', 400));
      }

      const { page, limit, sortBy, sortOrder, search, category } = value;
      const skip = (page - 1) * limit;

      // Build query
      const query: any = {};
      
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { alternativeNames: { $regex: search, $options: 'i' } }
        ];
      }

      if (category) {
        query.category = category;
      }

      // Build sort object
      const sort: any = {};
      if (sortBy === 'calories') {
        sort['nutritionalInfo.calories'] = sortOrder === 'desc' ? -1 : 1;
      } else if (sortBy === 'protein') {
        sort['nutritionalInfo.protein'] = sortOrder === 'desc' ? -1 : 1;
      } else {
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
      }

      // Get items with pagination
      const [items, total] = await Promise.all([
        InventoryItem.find(query)
          .populate('addedBy', 'firstName lastName email')
          .populate('lastUpdatedBy', 'firstName lastName email')
          .sort(sort)
          .skip(skip)
          .limit(limit),
        InventoryItem.countDocuments(query)
      ]);

      const totalPages = Math.ceil(total / limit);

      res.status(200).json({
        success: true,
        data: {
          items: items.map(item => item.toJSON()),
          pagination: {
            currentPage: page,
            totalPages,
            totalItems: total,
            itemsPerPage: limit,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Public: Get catalog of available items (users can access this)
  static async getCatalog(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate query parameters
      const { error, value } = catalogQuerySchema.validate(req.query);
      if (error) {
        return next(createError(error.details[0]?.message || 'Invalid query parameters', 400));
      }

      const { 
        page, 
        limit, 
        sortBy, 
        sortOrder, 
        search, 
        category, 
        dietaryRestrictions,
        excludeAllergens 
      } = value;
      const skip = (page - 1) * limit;

      // Build query for available items only
      const query: any = { isAvailable: true };
      
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { alternativeNames: { $regex: search, $options: 'i' } }
        ];
      }

      if (category) {
        query.category = category;
      }

      if (dietaryRestrictions) {
        const restrictions = Array.isArray(dietaryRestrictions) ? dietaryRestrictions : [dietaryRestrictions];
        query['healthProperties.dietaryRestrictions'] = { $in: restrictions };
      }

      if (excludeAllergens) {
        const allergens = Array.isArray(excludeAllergens) ? excludeAllergens : [excludeAllergens];
        query['healthProperties.allergens'] = { $nin: allergens };
      }

      // Build sort object
      const sort: any = {};
      if (sortBy === 'calories') {
        sort['nutritionalInfo.calories'] = sortOrder === 'desc' ? -1 : 1;
      } else if (sortBy === 'protein') {
        sort['nutritionalInfo.protein'] = sortOrder === 'desc' ? -1 : 1;
      } else {
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
      }

      // Get items with pagination (exclude admin fields)
      const [items, total] = await Promise.all([
        InventoryItem.find(query)
          .select('-addedBy -lastUpdatedBy')
          .sort(sort)
          .skip(skip)
          .limit(limit),
        InventoryItem.countDocuments(query)
      ]);

      const totalPages = Math.ceil(total / limit);

      res.status(200).json({
        success: true,
        data: {
          items: items.map(item => item.toJSON()),
          pagination: {
            currentPage: page,
            totalPages,
            totalItems: total,
            itemsPerPage: limit,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1
          },
          filters: {
            category,
            dietaryRestrictions,
            excludeAllergens,
            search
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Public: Get single item from catalog (users can access this)
  static async getCatalogItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate item ID
      const { error: idError, value: idValue } = itemIdSchema.validate(req.params);
      if (idError) {
        return next(createError('Invalid item ID', 400));
      }

      // Find available item (exclude admin fields)
      const item = await InventoryItem.findOne({ 
        _id: idValue.id, 
        isAvailable: true 
      }).select('-addedBy -lastUpdatedBy');

      if (!item) {
        return next(createError('Item not found', 404));
      }

      res.status(200).json({
        success: true,
        data: {
          item: item.toJSON()
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Public: Get categories with item counts
  static async getCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await InventoryItem.aggregate([
        { $match: { isAvailable: true } },
        { 
          $group: { 
            _id: '$category', 
            count: { $sum: 1 },
            subcategories: { $addToSet: '$subcategory' }
          } 
        },
        { $sort: { _id: 1 } },
        {
          $project: {
            category: '$_id',
            count: 1,
            subcategories: {
              $filter: {
                input: '$subcategories',
                cond: { $ne: ['$$this', null] }
              }
            },
            _id: 0
          }
        }
      ]);

      res.status(200).json({
        success: true,
        data: {
          categories
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Public: Get nutrition comparison for multiple items
  static async compareNutrition(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { itemIds } = req.body;

      if (!itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
        return next(createError('Please provide an array of item IDs', 400));
      }

      if (itemIds.length > 10) {
        return next(createError('Cannot compare more than 10 items at once', 400));
      }

      // Validate all item IDs
      const validItemIds = itemIds.filter(id => Types.ObjectId.isValid(id));
      if (validItemIds.length !== itemIds.length) {
        return next(createError('One or more item IDs are invalid', 400));
      }

      // Find items
      const items = await InventoryItem.find({ 
        _id: { $in: validItemIds }, 
        isAvailable: true 
      }).select('name nutritionalInfo vitaminsAndMinerals healthProperties');

      if (items.length === 0) {
        return next(createError('No items found', 404));
      }

      res.status(200).json({
        success: true,
        data: {
          comparison: items.map(item => ({
            id: item._id,
            name: item.name,
            nutritionalInfo: item.nutritionalInfo,
            vitaminsAndMinerals: item.vitaminsAndMinerals,
            healthProperties: item.healthProperties
          }))
        }
      });
    } catch (error) {
      next(error);
    }
  }
} 