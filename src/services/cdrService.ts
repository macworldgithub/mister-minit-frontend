import type { CdrRecord } from '../types';
import { API_CONFIG, request } from './apiClient';
import { INITIAL_CDRS } from './mockData';

let mockCdrs: CdrRecord[] = [...INITIAL_CDRS];

export interface CdrFilters {
  did?: string;
  missedOnly?: boolean;
  search?: string;
}

export const cdrService = {
  async getCdrRecords(filters: CdrFilters = {}): Promise<CdrRecord[]> {
    if (API_CONFIG.useMock) {
      await new Promise((r) => setTimeout(r, 100));
      return mockCdrs.filter((cdr) => {
        if (filters.did && filters.did !== 'all' && cdr['dial-no'] !== filters.did) {
          return false;
        }
        if (filters.missedOnly && !cdr.isMissed) {
          return false;
        }
        if (filters.search) {
          const q = filters.search.toLowerCase();
          const matchFrom = cdr['from-no'].toLowerCase().includes(q);
          const matchDial = cdr['dial-no'].toLowerCase().includes(q);
          const matchReason = cdr['reason-terminated'].toLowerCase().includes(q);
          const matchDn = cdr['from-dn']?.toLowerCase().includes(q) ?? false;
          if (!matchFrom && !matchDial && !matchReason && !matchDn) {
            return false;
          }
        }
        return true;
      });
    }

    const params = new URLSearchParams();
    if (filters.did && filters.did !== 'all') params.append('did', filters.did);
    if (filters.missedOnly) params.append('missedOnly', 'true');
    if (filters.search) params.append('search', filters.search);

    return request<CdrRecord[]>(`/cdr?${params.toString()}`);
  },
};
