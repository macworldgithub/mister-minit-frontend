import type { StoreConfig } from '../types';
import { API_CONFIG, request } from './apiClient';
import { INITIAL_STORES } from './mockData';

// Dynamic in-memory store for mock mode
let mockStores: StoreConfig[] = [...INITIAL_STORES];

// In-flight promise deduplication to guarantee only 1 network request at a time
let inFlightStoresPromise: Promise<StoreConfig[]> | null = null;

export const storeConfigService = {
  async getStores(): Promise<StoreConfig[]> {
    if (API_CONFIG.useMock) {
      await new Promise((r) => setTimeout(r, 100));
      return [...mockStores];
    }
    if (inFlightStoresPromise) {
      return inFlightStoresPromise;
    }
    inFlightStoresPromise = (async () => {
      try {
        const res = await request<any>('/store-config');
        if (Array.isArray(res)) {
          return res;
        }
        if (res && Array.isArray(res.data)) {
          return res.data;
        }
        return [];
      } finally {
        inFlightStoresPromise = null;
      }
    })();
    return inFlightStoresPromise;
  },

  async getStoreByDid(did: string): Promise<StoreConfig | null> {
    if (API_CONFIG.useMock) {
      return mockStores.find((s) => s.did === did) || null;
    }
    return request<StoreConfig>(`/store-config/${did}`);
  },

  async createStore(payload: Omit<StoreConfig, '_id'>): Promise<StoreConfig> {
    if (API_CONFIG.useMock) {
      const newStore: StoreConfig = {
        ...payload,
        _id: `store-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      mockStores = [newStore, ...mockStores];
      return newStore;
    }
    return request<StoreConfig>('/store-config', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateStore(did: string, payload: Partial<StoreConfig>): Promise<StoreConfig> {
    if (API_CONFIG.useMock) {
      mockStores = mockStores.map((s) => (s.did === did ? { ...s, ...payload, updatedAt: new Date().toISOString() } : s));
      const updated = mockStores.find((s) => s.did === did);
      if (!updated) throw new Error('Store not found');
      return updated;
    }
    // Clean payload for NestJS DTO (remove immutable/internal mongoose fields)
    const { _id, did: _, createdAt, updatedAt, __v, ...updateDto } = payload as any;
    return request<StoreConfig>(`/store-config/${did}`, {
      method: 'PATCH',
      body: JSON.stringify(updateDto),
    });
  },

  async toggleStoreActive(did: string, currentActive?: boolean): Promise<StoreConfig> {
    if (API_CONFIG.useMock) {
      const store = mockStores.find((s) => s.did === did);
      const nextActive = currentActive !== undefined ? !currentActive : !store?.isActive;
      return this.updateStore(did, { isActive: nextActive });
    }
    const nextActive = currentActive !== undefined ? !currentActive : true;
    return this.updateStore(did, { isActive: nextActive });
  },

  async deleteStore(did: string): Promise<{ success: boolean }> {
    if (API_CONFIG.useMock) {
      mockStores = mockStores.filter((s) => s.did !== did);
      return { success: true };
    }
    return request<{ success: boolean }>(`/store-config/${did}`, { method: 'DELETE' });
  },
};
