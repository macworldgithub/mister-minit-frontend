// Match backend ThreadStatus enum from sms-thread.schema.ts using erasable const object
export const ThreadStatus = {
  PENDING: "pending",
  SMS_SENT: "sms_sent",
  ACTIVE: "active",
  BOOKING_REQUESTED: "booking_requested",
  CLOSED_VISITED: "closed_visited",
  CLOSED_NO_RESPONSE: "closed_no_response",
  CLOSED_OPTED_OUT: "closed_opted_out",
  CLOSED_ANSWERED: "closed_answered",
} as const;

export type ThreadStatus = (typeof ThreadStatus)[keyof typeof ThreadStatus];

export interface ConversationEntry {
  role: "user" | "assistant";
  content: string;
  sentAt: string;
}

export interface BookingDetails {
  customerName: string | null;
  preferredTime: string | null;
  serviceType: string | null;
}

export interface SmsThread {
  _id: string;
  callId: string;
  callerNumber: string;
  did: string;
  storeId: string;
  storeName?: string;
  status: ThreadStatus;
  conversationHistory: ConversationEntry[];
  messageCount: number;
  customerReplied: boolean;
  openingSentAt: string | null;
  lastInteractionAt: string | null;
  followUpSentAt: string | null;
  bookingCaptured: boolean;
  bookingDetails: BookingDetails | null;
  optedOut: boolean;
  optOutKeyword?: string | null;
  optOutAt?: string | null;
  closedAt?: string | null;
  closedReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StaffContact {
  name: string;
  mobile: string;
  email: string;
}

export interface StoreConfig {
  _id?: string;
  did: string;
  storeName: string;
  address: string;
  tradingHours: string;
  googleMapsLink?: string;
  contactPhoneNumber?: string;
  actionNotes?: string;
  bookingLink?: string;
  staffContacts: StaffContact[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CdrRecord {
  callid: string;
  timestamp: string;
  duration: string;
  "time-start": string;
  "time-answered": string;
  "time-end": string;
  "reason-terminated": string;
  "from-no": string;
  "from-dn"?: string;
  "dial-no": string;
  isMissed?: boolean;
}

export const SuppressedReason = {
  NOT_A_PILOT_STORE: "not_a_pilot_store",
  NOT_MISSED_CALL: "not_missed_call",
  NOT_MOBILE: "not_mobile",
  INTERNAL_EXTENSION: "internal_extension",
  OPTED_OUT: "opted_out",
  DEDUP: "dedup",
} as const;

export type SuppressedReason =
  (typeof SuppressedReason)[keyof typeof SuppressedReason];

export interface SuppressedEvent {
  _id: string;
  callerNumber: string;
  did: string;
  storeId?: string;
  storeName?: string;
  callId: string;
  suppressedReason: SuppressedReason;
  createdAt: string;
}

export interface OptOutRecord {
  _id: string;
  callerNumber: string;
  keyword: string;
  optOutAt: string;
  source: "keyword" | "llm_detected";
  threadId: string;
  createdAt: string;
}

export interface DailyTrendPoint {
  date: string;
  totalCalls: number;
  missedCalls: number;
  smsSent: number;
  replies: number;
  bookings: number;
}

export interface DashboardMetrics {
  totalCalls: number;
  missedCalls: number;
  smsSent: number;
  replies: number;
  replyRatePercentage: number;
  bookingsCaptured: number;
  conversionRatePercentage: number;
  suppressedCount: number;
  optOutCount: number;
  trends: DailyTrendPoint[];
  missedRatePercentage?: number;
  footTrafficConversions?: number;
  serviceDemandBreakdown?: Record<string, number>;
  threadStatusDistribution?: Record<string, number>;
  deduplicationPrevented?: number;
  landlineFiltering?: number;
  answeredCallsFiltered?: number;
  optOutRatePercentage?: number;
}

export interface StatsStore {
  storeId: string;
  storeName: string;
  did: string;
  isActive: boolean;
}

export interface StoreComparison {
  storeId: string;
  storeName: string;
  did: string;
  isActive: boolean;
  telephony: {
    totalInboundCallVolume: number;
    missedCalls: number;
    storeMissedCallRate: number;
  };
  conversions: {
    recoveredInquiries: number;
    customerReplies: number;
    customerEngagementRate: number;
    bookingsCaptured: number;
    bookingConversionRate: number;
    footTrafficConversions: number;
  };
}

export interface RecentLog {
  eventType: string;
  callerNumber: string;
  storeName: string;
  createdAt: string;
}

export interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: PaginationInfo;
}

export type TimeRangeFilter = "today" | "7d" | "30d" | "all";
