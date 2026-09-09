import type { SuppressedEvent, OptOutRecord } from '../types';
import { API_CONFIG, request } from './apiClient';
import { INITIAL_SUPPRESSED, INITIAL_OPTOUTS } from './mockData';

let mockSuppressed: SuppressedEvent[] = [...INITIAL_SUPPRESSED];
let mockOptOuts: OptOutRecord[] = [...INITIAL_OPTOUTS];

export const suppressedService = {
  async getSuppressedEvents(filters?: { reason?: string; storeId?: string }): Promise<SuppressedEvent[]> {
    if (API_CONFIG.useMock) {
      await new Promise((r) => setTimeout(r, 100));
      return mockSuppressed.filter((ev) => {
        if (filters?.reason && filters.reason !== 'all' && ev.suppressedReason !== filters.reason) {
          return false;
        }
        if (filters?.storeId && filters.storeId !== 'all' && ev.storeId !== filters.storeId) {
          return false;
        }
        return true;
      });
    }

    const params = new URLSearchParams();
    if (filters?.reason && filters.reason !== 'all') params.append('reason', filters.reason);
    if (filters?.storeId && filters.storeId !== 'all') params.append('storeId', filters.storeId);
    return request<SuppressedEvent[]>(`/suppressed-events?${params.toString()}`);
  },

  async getOptOutRecords(): Promise<OptOutRecord[]> {
    if (API_CONFIG.useMock) {
      await new Promise((r) => setTimeout(r, 80));
      return [...mockOptOuts];
    }
    return request<OptOutRecord[]>('/opt-out');
  },

  async removeOptOut(callerNumber: string): Promise<{ success: boolean }> {
    if (API_CONFIG.useMock) {
      mockOptOuts = mockOptOuts.filter((o) => o.callerNumber !== callerNumber);
      return { success: true };
    }
    return request<{ success: boolean }>(`/opt-out/${encodeURIComponent(callerNumber)}`, {
      method: 'DELETE',
    });
  },
};
