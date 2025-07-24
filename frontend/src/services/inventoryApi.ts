import axios, { type AxiosResponse } from 'axios';
import type { 
  InventoryItem,
  InventoryApiResponse,
  InventoryListResponse,
  CategoriesResponse,
  ComparisonResponse,
  CreateItemData,
  UpdateItemData,
  CatalogFilters
} from '../types/inventory';

class InventoryApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  }

  // Helper method to get auth headers
  private getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // ADMIN ENDPOINTS (require admin authentication)

  /**
   * Create a new inventory item (admin only)
   */
  async createItem(itemData: CreateItemData): Promise<InventoryItem> {
    const response: AxiosResponse<InventoryApiResponse> = await axios.post(
      `${this.baseURL}/inventory/admin/items`,
      itemData,
      { headers: this.getAuthHeaders() }
    );
    return response.data.data.item;
  }

  /**
   * Update an existing inventory item (admin only)
   */
  async updateItem(id: string, itemData: UpdateItemData): Promise<InventoryItem> {
    const response: AxiosResponse<InventoryApiResponse> = await axios.put(
      `${this.baseURL}/inventory/admin/items/${id}`,
      itemData,
      { headers: this.getAuthHeaders() }
    );
    return response.data.data.item;
  }

  /**
   * Delete an inventory item (admin only - soft delete)
   */
  async deleteItem(id: string): Promise<InventoryItem> {
    const response: AxiosResponse<InventoryApiResponse> = await axios.delete(
      `${this.baseURL}/inventory/admin/items/${id}`,
      { headers: this.getAuthHeaders() }
    );
    return response.data.data.item;
  }

  /**
   * Get single item with admin details (admin only)
   */
  async getAdminItem(id: string): Promise<InventoryItem> {
    const response: AxiosResponse<InventoryApiResponse> = await axios.get(
      `${this.baseURL}/inventory/admin/items/${id}`,
      { headers: this.getAuthHeaders() }
    );
    return response.data.data.item;
  }

  /**
   * Get all items including unavailable ones (admin only)
   */
  async getAdminItems(filters: CatalogFilters = {}): Promise<InventoryListResponse['data']> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v));
        } else {
          params.append(key, value.toString());
        }
      }
    });

    const response: AxiosResponse<InventoryListResponse> = await axios.get(
      `${this.baseURL}/inventory/admin/items?${params.toString()}`,
      { headers: this.getAuthHeaders() }
    );
    return response.data.data;
  }

  // PUBLIC ENDPOINTS (no authentication required)

  /**
   * Browse available items in catalog
   */
  async getCatalog(filters: CatalogFilters = {}): Promise<InventoryListResponse['data']> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v));
        } else {
          params.append(key, value.toString());
        }
      }
    });

    const response: AxiosResponse<InventoryListResponse> = await axios.get(
      `${this.baseURL}/inventory/catalog?${params.toString()}`
    );
    return response.data.data;
  }

  /**
   * Get single item from catalog
   */
  async getCatalogItem(id: string): Promise<InventoryItem> {
    const response: AxiosResponse<InventoryApiResponse> = await axios.get(
      `${this.baseURL}/inventory/catalog/items/${id}`
    );
    return response.data.data.item;
  }

  /**
   * Get all categories with item counts
   */
  async getCategories(): Promise<CategoriesResponse['data']['categories']> {
    const response: AxiosResponse<CategoriesResponse> = await axios.get(
      `${this.baseURL}/inventory/catalog/categories`
    );
    return response.data.data.categories;
  }

  /**
   * Compare nutrition of multiple items
   */
  async compareItems(itemIds: string[]): Promise<ComparisonResponse['data']['comparison']> {
    const response: AxiosResponse<ComparisonResponse> = await axios.post(
      `${this.baseURL}/inventory/catalog/compare`,
      { itemIds }
    );
    return response.data.data.comparison;
  }

  // UTILITY METHODS

  /**
   * Search items with text query
   */
  async searchItems(query: string, filters: Omit<CatalogFilters, 'search'> = {}): Promise<InventoryListResponse['data']> {
    return this.getCatalog({ ...filters, search: query });
  }

  /**
   * Get items by category
   */
  async getItemsByCategory(category: string, filters: Omit<CatalogFilters, 'category'> = {}): Promise<InventoryListResponse['data']> {
    return this.getCatalog({ ...filters, category });
  }

  /**
   * Get items by dietary restrictions
   */
  async getItemsByDiet(dietaryRestrictions: string[], filters: Omit<CatalogFilters, 'dietaryRestrictions'> = {}): Promise<InventoryListResponse['data']> {
    return this.getCatalog({ ...filters, dietaryRestrictions });
  }

  /**
   * Get items excluding allergens
   */
  async getItemsWithoutAllergens(excludeAllergens: string[], filters: Omit<CatalogFilters, 'excludeAllergens'> = {}): Promise<InventoryListResponse['data']> {
    return this.getCatalog({ ...filters, excludeAllergens });
  }

  /**
   * Get high protein items
   */
  async getHighProteinItems(minProtein: number = 10): Promise<InventoryListResponse['data']> {
    const allItems = await this.getCatalog({ sortBy: 'protein', sortOrder: 'desc' });
    return {
      ...allItems,
      items: allItems.items.filter(item => item.nutritionalInfo.protein >= minProtein)
    };
  }

  /**
   * Get low calorie items
   */
  async getLowCalorieItems(maxCalories: number = 100): Promise<InventoryListResponse['data']> {
    const allItems = await this.getCatalog({ sortBy: 'calories', sortOrder: 'asc' });
    return {
      ...allItems,
      items: allItems.items.filter(item => item.nutritionalInfo.calories <= maxCalories)
    };
  }

  /**
   * Get items by antioxidant level
   */
  async getItemsByAntioxidants(level: 'low' | 'medium' | 'high'): Promise<InventoryListResponse['data']> {
    const allItems = await this.getCatalog();
    return {
      ...allItems,
      items: allItems.items.filter(item => item.healthProperties.antioxidantLevel === level)
    };
  }

  /**
   * Get seasonal items for current month
   */
  async getSeasonalItems(): Promise<InventoryListResponse['data']> {
    const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long' }).toLowerCase();
    const allItems = await this.getCatalog();
    return {
      ...allItems,
      items: allItems.items.filter(item => 
        item.seasonality && item.seasonality.includes(currentMonth)
      )
    };
  }
}

// Export singleton instance
export const inventoryApi = new InventoryApiService();
export default inventoryApi; 