import type {
  OptOutRecord,
  SuppressedEvent,
  SuppressionSummary,
} from "../types";
import { API_CONFIG, request } from "./apiClient";
import { INITIAL_SUPPRESSED, INITIAL_OPTOUTS } from "./mockData";

let mockSuppressed: SuppressedEvent[] = [...INITIAL_SUPPRESSED];
let mockOptOuts: OptOutRecord[] = [...INITIAL_OPTOUTS];

export const suppressedService = {
  async getSuppressedEvents(filters?: {
    reason?: string;
    storeId?: string;
    search?: string;
    limit?: number;
    skip?: number;
  }): Promise<SuppressedEvent[]> {
    if (API_CONFIG.useMock) {
      await new Promise((r) => setTimeout(r, 100));
      return mockSuppressed.filter((ev) => {
        if (
          filters?.reason &&
          filters.reason !== "all" &&
          ev.suppressedReason !== filters.reason
        ) {
          return false;
        }
        if (
          filters?.storeId &&
          filters.storeId !== "all" &&
          ev.storeId !== filters.storeId
        ) {
          return false;
        }
        return true;
      });
    }

    const params = new URLSearchParams();
    if (filters?.reason && filters.reason !== "all")
      params.append("reason", filters.reason);
    if (filters?.storeId && filters.storeId !== "all")
      params.append("storeId", filters.storeId);
    if (filters?.search) params.append("search", filters.search);
    params.append("limit", String(filters?.limit ?? 50));
    params.append("skip", String(filters?.skip ?? 0));
    const response = await request<
      | SuppressedEvent[]
      | { items?: SuppressedEvent[]; data?: SuppressedEvent[] }
    >(`/suppressions?${params.toString()}`);
    return Array.isArray(response)
      ? response
      : (response.items ?? response.data ?? []);
  },

  async getOptOutRecords(filters?: {
    search?: string;
    source?: string;
    limit?: number;
    skip?: number;
  }): Promise<OptOutRecord[]> {
    if (API_CONFIG.useMock) {
      await new Promise((r) => setTimeout(r, 80));
      return [...mockOptOuts];
    }
    const params = new URLSearchParams();
    if (filters?.search) params.append("search", filters.search);
    if (filters?.source && filters.source !== "all")
      params.append("source", filters.source);
    params.append("limit", String(filters?.limit ?? 50));
    params.append("skip", String(filters?.skip ?? 0));
    const response = await request<
      OptOutRecord[] | { items?: OptOutRecord[]; data?: OptOutRecord[] }
    >(`/suppressions/opt-outs?${params.toString()}`);
    return Array.isArray(response)
      ? response
      : (response.items ?? response.data ?? []);
  },

  async getSummary(): Promise<SuppressionSummary> {
    if (API_CONFIG.useMock)
      return {
        totalSuppressed: mockSuppressed.length,
        byReason: {},
        totalOptOuts: mockOptOuts.length,
      };
    return request<SuppressionSummary>("/suppressions/summary");
  },

  async removeOptOut(callerNumber: string): Promise<{ success: boolean }> {
    if (API_CONFIG.useMock) {
      mockOptOuts = mockOptOuts.filter((o) => o.callerNumber !== callerNumber);
      return { success: true };
    }
    return request<{ success: boolean }>(
      `/opt-out/${encodeURIComponent(callerNumber)}`,
      {
        method: "DELETE",
      },
    );
  },
};
