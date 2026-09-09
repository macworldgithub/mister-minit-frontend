import type { DashboardMetrics, TimeRangeFilter } from '../types';
import { API_CONFIG, request } from './apiClient';
import { TREND_DATA_7D } from './mockData';
import { smsThreadService } from './smsThreadService';
import { cdrService } from './cdrService';
import { suppressedService } from './suppressedService';

export const dashboardService = {
  async getMetrics(filters?: { storeId?: string; timeRange?: TimeRangeFilter }): Promise<DashboardMetrics> {
    if (API_CONFIG.useMock) {
      const [threads, cdrs, suppressed, optouts] = await Promise.all([
        smsThreadService.getThreads({ storeId: filters?.storeId }),
        cdrService.getCdrRecords(),
        suppressedService.getSuppressedEvents({ storeId: filters?.storeId }),
        suppressedService.getOptOutRecords(),
      ]);

      const totalCalls = cdrs.length * 9 + 18; // scaled for realistic dashboard volume
      const missedCalls = cdrs.filter((c) => c.isMissed).length * 8 + 9;
      const smsSent = threads.length * 6 + 11;
      const replies = threads.filter((t) => t.customerReplied).length * 6 + 7;
      const bookingsCaptured = threads.filter((t) => t.bookingCaptured).length * 3 + 4;
      const replyRate = smsSent > 0 ? Math.round((replies / smsSent) * 100) : 0;
      const conversionRate = missedCalls > 0 ? Math.round((bookingsCaptured / missedCalls) * 100) : 0;

      return {
        totalCalls,
        missedCalls,
        smsSent,
        replies,
        replyRatePercentage: replyRate,
        bookingsCaptured,
        conversionRatePercentage: conversionRate,
        suppressedCount: suppressed.length * 3 + 2,
        optOutCount: optouts.length,
        trends: TREND_DATA_7D,
      };
    }

    const params = new URLSearchParams();
    if (filters?.storeId && filters.storeId !== 'all') params.append('storeId', filters.storeId);
    if (filters?.timeRange) params.append('timeRange', filters.timeRange);

    return request<DashboardMetrics>(`/dashboard/metrics?${params.toString()}`);
  },
};
