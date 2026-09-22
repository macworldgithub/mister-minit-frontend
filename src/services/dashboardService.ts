import type {
  DashboardMetrics,
  PaginatedResult,
  RecentLog,
  StatsStore,
  StoreComparison,
  TimeRangeFilter,
} from "../types";
import { API_CONFIG, request } from "./apiClient";
import { TREND_DATA_7D } from "./mockData";
import { smsThreadService } from "./smsThreadService";
import { cdrService } from "./cdrService";
import { suppressedService } from "./suppressedService";
import { storeConfigService } from "./storeConfigService";

interface StatsResponse {
  telephony?: {
    totalInboundCallVolume?: number;
    missedCalls?: number;
    storeMissedCallRate?: number;
  };
  conversions?: {
    recoveredInquiries?: number;
    customerReplies?: number;
    customerEngagementRate?: number;
    bookingsCaptured?: number;
    bookingConversionRate?: number;
    footTrafficConversions?: number;
    serviceDemandBreakdown?: Record<string, number>;
    threadStatusDistribution?: Record<string, number>;
  };
  aiSafetyQualityControl?: {
    totalCallsFiltered?: number;
    deduplicationPrevented?: number;
    landlineFiltering?: number;
    answeredCallsFiltered?: number;
  };
  complianceAndRetention?: {
    totalOptOuts?: number;
    optOutRate?: number;
  };
}

function getDateRange(timeRange?: TimeRangeFilter) {
  if (!timeRange || timeRange === "all") return {};

  const endDate = new Date();
  const startDate = new Date(endDate);
  if (timeRange === "today") {
    startDate.setHours(0, 0, 0, 0);
  } else {
    startDate.setDate(endDate.getDate() - (timeRange === "30d" ? 29 : 6));
  }

  return {
    startDate: startDate.toISOString().slice(0, 10),
    endDate: endDate.toISOString().slice(0, 10),
  };
}

function paginate<T>(
  items: T[],
  page: number,
  pageSize: number,
): PaginatedResult<T> {
  const safePageSize = Math.max(1, pageSize);
  const totalPages = Math.max(1, Math.ceil(items.length / safePageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * safePageSize;

  return {
    items: items.slice(start, start + safePageSize),
    pagination: {
      page: safePage,
      pageSize: safePageSize,
      total: items.length,
      totalPages,
    },
  };
}

export const dashboardService = {
  async getMetrics(filters?: {
    storeId?: string;
    timeRange?: TimeRangeFilter;
  }): Promise<DashboardMetrics> {
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
      const bookingsCaptured =
        threads.filter((t) => t.bookingCaptured).length * 3 + 4;
      const replyRate = smsSent > 0 ? Math.round((replies / smsSent) * 100) : 0;
      const conversionRate =
        missedCalls > 0
          ? Math.round((bookingsCaptured / missedCalls) * 100)
          : 0;

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
        missedRatePercentage:
          totalCalls > 0 ? (missedCalls / totalCalls) * 100 : 0,
        footTrafficConversions: bookingsCaptured,
        serviceDemandBreakdown: {},
        threadStatusDistribution: {},
        deduplicationPrevented: 0,
        landlineFiltering: 0,
        answeredCallsFiltered: 0,
        optOutRatePercentage: 0,
      };
    }

    const params = new URLSearchParams();
    if (filters?.storeId && filters.storeId !== "all")
      params.append("storeId", filters.storeId);
    const dateRange = getDateRange(filters?.timeRange);
    if (dateRange.startDate) params.append("startDate", dateRange.startDate);
    if (dateRange.endDate) params.append("endDate", dateRange.endDate);

    const stats = await request<StatsResponse>(
      `/stats${params.toString() ? `?${params.toString()}` : ""}`,
    );
    const telephony = stats.telephony ?? {};
    const conversions = stats.conversions ?? {};
    return {
      totalCalls: telephony.totalInboundCallVolume ?? 0,
      missedCalls: telephony.missedCalls ?? 0,
      smsSent: conversions.recoveredInquiries ?? 0,
      replies: conversions.customerReplies ?? 0,
      replyRatePercentage: conversions.customerEngagementRate ?? 0,
      bookingsCaptured: conversions.bookingsCaptured ?? 0,
      conversionRatePercentage: conversions.bookingConversionRate ?? 0,
      suppressedCount: stats.aiSafetyQualityControl?.totalCallsFiltered ?? 0,
      optOutCount: stats.complianceAndRetention?.totalOptOuts ?? 0,
      trends: [],
      missedRatePercentage: telephony.storeMissedCallRate ?? 0,
      footTrafficConversions: conversions.footTrafficConversions ?? 0,
      serviceDemandBreakdown: conversions.serviceDemandBreakdown ?? {},
      threadStatusDistribution: conversions.threadStatusDistribution ?? {},
      deduplicationPrevented:
        stats.aiSafetyQualityControl?.deduplicationPrevented ?? 0,
      landlineFiltering: stats.aiSafetyQualityControl?.landlineFiltering ?? 0,
      answeredCallsFiltered:
        stats.aiSafetyQualityControl?.answeredCallsFiltered ?? 0,
      optOutRatePercentage: stats.complianceAndRetention?.optOutRate ?? 0,
    } satisfies DashboardMetrics;
  },

  async getStatsStores(): Promise<StatsStore[]> {
    if (API_CONFIG.useMock) {
      const stores = await storeConfigService.getStores();
      return stores.map((store) => ({
        storeId: store._id || store.did,
        storeName: store.storeName,
        did: store.did,
        isActive: store.isActive,
      }));
    }

    const response = await request<StatsStore[] | { data?: StatsStore[] }>(
      "/stats/stores",
    );
    return Array.isArray(response) ? response : (response.data ?? []);
  },

  async getStoreComparison(
    page = 1,
    pageSize = 5,
  ): Promise<PaginatedResult<StoreComparison>> {
    if (API_CONFIG.useMock) return paginate([], page, pageSize);

    const response = await request<
      StoreComparison[] | { data?: StoreComparison[] }
    >("/stats/by-store");
    const stores = Array.isArray(response) ? response : (response.data ?? []);
    return paginate(stores, page, pageSize);
  },

  async getRecentLogs(
    page = 1,
    pageSize = 8,
  ): Promise<PaginatedResult<RecentLog>> {
    if (API_CONFIG.useMock) return paginate([], page, pageSize);

    // The deployed endpoint supports limit but currently ignores page/skip.
    // Fetch the available collection once, then paginate it in the UI.
    const response = await request<{
      total: number;
      limit: number;
      skip: number;
      logs: RecentLog[];
    }>("/logs/recent?limit=1000");
    return paginate(response.logs ?? [], page, pageSize);
  },
};
