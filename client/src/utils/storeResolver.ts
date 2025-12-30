import { lookupApi } from '../api/lookup.api';

// Cache for store names
const storeCache = new Map<string, string>();

export const resolveStoreName = async (storeId: string): Promise<string> => {
  if (storeCache.has(storeId)) {
    return storeCache.get(storeId)!;
  }

  try {
    // Try to find the store by searching (this is a workaround since we don't have a direct get-by-id endpoint)
    // In a real implementation, you might want to add a getStoreById endpoint
    const stores = await lookupApi.lookupStores('', 1000);
    const store = stores.find((s) => s.id === storeId);
    
    if (store) {
      storeCache.set(storeId, store.name);
      return store.name;
    }
    
    return storeId; // Fallback to ID if not found
  } catch (error) {
    console.error('Error resolving store name:', error);
    return storeId; // Fallback to ID on error
  }
};

export const clearStoreCache = () => {
  storeCache.clear();
};

