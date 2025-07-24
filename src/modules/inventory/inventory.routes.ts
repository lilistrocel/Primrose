import { Router } from 'express';
import { InventoryController } from './inventory.controller';
import { authenticate, authorize } from '../auth/auth.middleware';

const router = Router();

// Admin routes (require authentication and admin role)
router.post(
  '/admin/items',
  authenticate,
  authorize('admin'),
  InventoryController.createItem
);

router.put(
  '/admin/items/:id',
  authenticate,
  authorize('admin'),
  InventoryController.updateItem
);

router.delete(
  '/admin/items/:id',
  authenticate,
  authorize('admin'),
  InventoryController.deleteItem
);

router.get(
  '/admin/items/:id',
  authenticate,
  authorize('admin'),
  InventoryController.getItemById
);

router.get(
  '/admin/items',
  authenticate,
  authorize('admin'),
  InventoryController.getAllItems
);

// Public routes (no authentication required - users can browse catalog)
router.get(
  '/catalog',
  InventoryController.getCatalog
);

router.get(
  '/catalog/categories',
  InventoryController.getCategories
);

router.get(
  '/catalog/items/:id',
  InventoryController.getCatalogItem
);

router.post(
  '/catalog/compare',
  InventoryController.compareNutrition
);

export default router; 