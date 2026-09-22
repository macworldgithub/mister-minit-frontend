import type { CdrRecord } from "../types";
import { API_CONFIG, request } from "./apiClient";
import { INITIAL_CDRS } from "./mockData";

let mockCdrs: CdrRecord[] = [...INITIAL_CDRS];

export interface CdrFilters {
  storeId?: string;
  did?: string;
  isMissed?: boolean;
  missedOnly?: boolean;
  search?: string;
  limit?: number;
  skip?: number;
}

export const cdrService = {
  async getCdrRecords(filters: CdrFilters = {}): Promise<CdrRecord[]> {
    if (API_CONFIG.useMock) {
      await new Promise((r) => setTimeout(r, 100));
      return mockCdrs.filter((cdr) => {
        if (
          filters.did &&
          filters.did !== "all" &&
          cdr["dial-no"] !== filters.did
        ) {
          return false;
        }
        if (filters.missedOnly && !cdr.isMissed) {
          return false;
        }
        if (filters.search) {
          const q = filters.search.toLowerCase();
          const matchFrom = cdr["from-no"].toLowerCase().includes(q);
          const matchDial = cdr["dial-no"].toLowerCase().includes(q);
          const matchReason = cdr["reason-terminated"]
            .toLowerCase()
            .includes(q);
          const matchDn = cdr["from-dn"]?.toLowerCase().includes(q) ?? false;
          if (!matchFrom && !matchDial && !matchReason && !matchDn) {
            return false;
          }
        }
        return true;
      });
    }

    const params = new URLSearchParams();
    if (filters.storeId && filters.storeId !== "all")
      params.append("storeId", filters.storeId);
    if (filters.did && filters.did !== "all") params.append("did", filters.did);
    if (filters.isMissed !== undefined)
      params.append("isMissed", String(filters.isMissed));
    else if (filters.missedOnly) params.append("isMissed", "true");
    if (filters.search) params.append("search", filters.search);
    params.append("limit", String(filters.limit ?? 50));
    params.append("skip", String(filters.skip ?? 0));

    const response = await request<
      | CdrRecord[]
      | { logs?: CdrRecord[]; items?: CdrRecord[]; data?: CdrRecord[] }
    >(`/cdr/logs?${params.toString()}`);
    const logs = Array.isArray(response)
      ? response
      : (response.logs ?? response.items ?? response.data ?? []);
    return logs.map((cdr) => ({
      ...cdr,
      callid:
        cdr.callid ||
        cdr.callId ||
        (cdr as CdrRecord & { id?: string }).id ||
        "",
      "reason-terminated":
        cdr["reason-terminated"] || cdr.reasonTerminated || "",
      "from-no": cdr["from-no"] || cdr.fromNo || "",
      "dial-no": cdr["dial-no"] || cdr.dialNo || "",
      "time-start": cdr["time-start"] || cdr.timeStart || cdr.timestamp || "",
      "time-end": cdr["time-end"] || cdr.timeEnd || "",
    }));
  },
};
