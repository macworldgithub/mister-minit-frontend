import type { SmsThread } from "../types";
import { ThreadStatus } from "../types";
import { API_CONFIG, request } from "./apiClient";
import { INITIAL_THREADS } from "./mockData";
import type { PaginatedResult } from "../types";

let mockThreads: SmsThread[] = [...INITIAL_THREADS];

export interface ThreadFilters {
  storeId?: string;
  status?: string;
  search?: string;
  limit?: number;
  skip?: number;
}

export const smsThreadService = {
  async getThreads(filters: ThreadFilters = {}): Promise<SmsThread[]> {
    if (API_CONFIG.useMock) {
      await new Promise((r) => setTimeout(r, 120));
      return mockThreads.filter((thread) => {
        if (
          filters.storeId &&
          filters.storeId !== "all" &&
          thread.storeId !== filters.storeId
        ) {
          return false;
        }
        if (
          filters.status &&
          filters.status !== "all" &&
          thread.status !== filters.status
        ) {
          return false;
        }
        if (filters.search) {
          const q = filters.search.toLowerCase();
          const matchCaller = thread.callerNumber.toLowerCase().includes(q);
          const matchStore =
            thread.storeName?.toLowerCase().includes(q) ?? false;
          const matchCustomer =
            thread.bookingDetails?.customerName?.toLowerCase().includes(q) ??
            false;
          const matchContent = thread.conversationHistory.some((c) =>
            c.content.toLowerCase().includes(q),
          );
          if (!matchCaller && !matchStore && !matchCustomer && !matchContent) {
            return false;
          }
        }
        return true;
      });
    }

    const params = new URLSearchParams();
    if (filters.storeId && filters.storeId !== "all")
      params.append("storeId", filters.storeId);
    if (filters.status && filters.status !== "all")
      params.append("status", filters.status);
    if (filters.search) params.append("search", filters.search);
    params.append("limit", String(filters.limit ?? 50));
    params.append("skip", String(filters.skip ?? 0));

    const response = await request<
      SmsThread[] | { items?: SmsThread[]; data?: SmsThread[] }
    >(`/sms-threads/live?${params.toString()}`);
    return Array.isArray(response)
      ? response
      : (response.items ?? response.data ?? []);
  },

  async getThreadById(threadId: string): Promise<SmsThread | null> {
    if (API_CONFIG.useMock) {
      return mockThreads.find((t) => t._id === threadId) || null;
    }
    return request<SmsThread>(`/sms-threads/${threadId}`);
  },

  async updateThreadStatus(
    threadId: string,
    status: string,
    closedReason?: string,
  ): Promise<SmsThread> {
    if (API_CONFIG.useMock) {
      mockThreads = mockThreads.map((t) => {
        if (t._id === threadId) {
          const isClosed = status.startsWith("closed_");
          return {
            ...t,
            status: status as (typeof ThreadStatus)[keyof typeof ThreadStatus],
            closedReason: isClosed ? closedReason || status : t.closedReason,
            closedAt: isClosed ? new Date().toISOString() : t.closedAt,
            updatedAt: new Date().toISOString(),
          };
        }
        return t;
      });
      const updated = mockThreads.find((t) => t._id === threadId);
      if (!updated) throw new Error("Thread not found");
      return updated;
    }

    return request<SmsThread>(`/sms-threads/${threadId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status, closedReason }),
    });
  },

  async appendMessage(
    threadId: string,
    content: string,
    role: "user" | "assistant" = "assistant",
  ): Promise<SmsThread> {
    if (API_CONFIG.useMock) {
      mockThreads = mockThreads.map((t) => {
        if (t._id === threadId) {
          const newEntry = { role, content, sentAt: new Date().toISOString() };
          return {
            ...t,
            conversationHistory: [...t.conversationHistory, newEntry],
            messageCount: t.messageCount + 1,
            lastInteractionAt: new Date().toISOString(),
            status: ThreadStatus.ACTIVE,
          };
        }
        return t;
      });
      const updated = mockThreads.find((t) => t._id === threadId);
      if (!updated) throw new Error("Thread not found");
      return updated;
    }

    return request<SmsThread>(`/sms-threads/${threadId}/messages`, {
      method: "POST",
      body: JSON.stringify({ content, role }),
    });
  },
};
