import React, { useState } from "react";
import type {
  OptOutRecord,
  SuppressedEvent,
  SuppressedReason,
  SuppressionSummary,
} from "../../types";
import { SuppressedReason as ReasonEnum } from "../../types";
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  RefreshCw,
  Search,
  ShieldAlert,
  UserX,
} from "lucide-react";

interface SuppressedViewProps {
  suppressedEvents: SuppressedEvent[];
  optOutRecords: OptOutRecord[];
  onRemoveOptOut: (callerNumber: string) => void;
  reasonFilter: string;
  onReasonFilterChange: (reason: string) => void;
  suppressedSearch: string;
  onSuppressedSearchChange: (value: string) => void;
  optOutSearch: string;
  onOptOutSearchChange: (value: string) => void;
  optOutSource: string;
  onOptOutSourceChange: (value: string) => void;
  summary: SuppressionSummary | null;
  loading: boolean;
  error: string | null;
  suppressedPage: number;
  optOutPage: number;
  hasNextSuppressedPage: boolean;
  hasNextOptOutPage: boolean;
  onSuppressedPageChange: (page: number) => void;
  onOptOutPageChange: (page: number) => void;
}

const reasonLabel = (reason: SuppressedReason) => reason.replace(/_/g, " ");

export const SuppressedView: React.FC<SuppressedViewProps> = ({
  suppressedEvents,
  optOutRecords,
  reasonFilter,
  onReasonFilterChange,
  summary,
  loading,
  error,
  suppressedPage,
  optOutPage,
  hasNextSuppressedPage,
  hasNextOptOutPage,
  suppressedSearch,
  onSuppressedSearchChange,
  optOutSearch,
  onOptOutSearchChange,
  optOutSource,
  onOptOutSourceChange,
  onSuppressedPageChange,
  onOptOutPageChange,
}) => {
  const [activeTab, setActiveTab] = useState<"suppressed" | "optouts">(
    "suppressed",
  );
  const page = activeTab === "suppressed" ? suppressedPage : optOutPage;
  const hasNext =
    activeTab === "suppressed" ? hasNextSuppressedPage : hasNextOptOutPage;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {[
          ["Total Suppressed Calls", summary?.totalSuppressed ?? 0],
          ["Non-Mobile / Landlines", summary?.byReason?.not_mobile ?? 0],
          ["Answered Calls Filtered", summary?.byReason?.not_missed_call ?? 0],
          ["Total Opt-Outs", summary?.totalOptOuts ?? optOutRecords.length],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-xl bg-slate-900/50 border border-slate-800/60 p-4"
          >
            <p className="text-[11px] uppercase tracking-wider text-slate-400">
              {label}
            </p>
            <p className="text-2xl font-bold text-white mt-2">{value}</p>
          </div>
        ))}
      </div>
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-300">
          {error}
        </div>
      )}
      {loading && (
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <RefreshCw className="w-4 h-4 animate-spin" /> Loading suppression
          data...
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/60 pb-3">
        <div className="flex items-center gap-2 bg-slate-900/50 p-1 rounded-xl border border-slate-800/60">
          <button
            onClick={() => setActiveTab("suppressed")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold ${activeTab === "suppressed" ? "bg-blue-600 text-white" : "text-slate-400"}`}
          >
            Suppressed Calls ({suppressedEvents.length})
          </button>
          <button
            onClick={() => setActiveTab("optouts")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold ${activeTab === "optouts" ? "bg-blue-600 text-white" : "text-slate-400"}`}
          >
            Opt-Outs ({optOutRecords.length})
          </button>
        </div>
        {activeTab === "suppressed" ? (
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input
                value={suppressedSearch}
                onChange={(e) => onSuppressedSearchChange(e.target.value)}
                placeholder="Search caller or call ID"
                className="bg-slate-950/60 border border-slate-800/60 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={reasonFilter}
                onChange={(e) => onReasonFilterChange(e.target.value)}
                className="bg-slate-950/60 border border-slate-800/60 text-slate-200 text-xs rounded-xl px-2.5 py-1.5"
              >
                <option value="all">All Reasons</option>
                <option value={ReasonEnum.NOT_MOBILE}>Not mobile</option>
                <option value={ReasonEnum.NOT_MISSED_CALL}>
                  Not missed call
                </option>
                <option value={ReasonEnum.INTERNAL_EXTENSION}>
                  Internal extension
                </option>
                <option value={ReasonEnum.DEDUP}>Deduplication</option>
              </select>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input
                value={optOutSearch}
                onChange={(e) => onOptOutSearchChange(e.target.value)}
                placeholder="Search mobile number"
                className="bg-slate-950/60 border border-slate-800/60 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white"
              />
            </div>
            <select
              value={optOutSource}
              onChange={(e) => onOptOutSourceChange(e.target.value)}
              className="bg-slate-950/60 border border-slate-800/60 rounded-xl px-2.5 py-1.5 text-xs text-slate-200"
            >
              <option value="all">All Sources</option>
              <option value="keyword">Keyword</option>
              <option value="llm_detected">LLM detected</option>
            </select>
          </div>
        )}
      </div>
      {activeTab === "suppressed" ? (
        <div className="bg-slate-900/50 border border-slate-800/60 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-175 text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="p-4">Caller Number</th>
                  <th className="p-4">Store Name</th>
                  <th className="p-4">Call ID</th>
                  <th className="p-4">Reason</th>
                  <th className="p-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {suppressedEvents.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-12 text-center text-slate-400"
                    >
                      <ShieldAlert className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                      No suppressed calls found.
                    </td>
                  </tr>
                ) : (
                  suppressedEvents.map((event) => (
                    <tr key={event._id} className="text-slate-300">
                      <td className="p-4 font-mono text-white">
                        {event.callerNumber}
                      </td>
                      <td className="p-4">{event.storeName || "-"}</td>
                      <td className="p-4 font-mono text-slate-400">
                        {event.callId}
                      </td>
                      <td className="p-4">
                        <span className="rounded-full border border-slate-700 px-2 py-1 text-[10px] uppercase">
                          {reasonLabel(event.suppressedReason)}
                        </span>
                      </td>
                      <td className="p-4 whitespace-nowrap text-slate-400">
                        {new Date(event.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900/50 border border-slate-800/60 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-175 text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="p-4">Mobile Number</th>
                  <th className="p-4">Keyword</th>
                  <th className="p-4">Trigger Source</th>
                  <th className="p-4">Opted Out</th>
                  {/* <th className="p-4 text-right">Action</th> */}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {optOutRecords.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-12 text-center text-slate-400"
                    >
                      <UserX className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                      No opt-outs found.
                    </td>
                  </tr>
                ) : (
                  optOutRecords.map((opt) => (
                    <tr key={opt._id} className="text-slate-300">
                      <td className="p-4 font-mono text-white">
                        {opt.callerNumber}
                      </td>
                      <td className="p-4 text-rose-300">
                        {opt.keyword || "STOP"}
                      </td>
                      <td className="p-4">{opt.source}</td>
                      <td className="p-4 whitespace-nowrap text-slate-400">
                        {new Date(opt.optOutAt).toLocaleString()}
                      </td>
                      <td className="p-4 text-right">
                        {/* <button
                          onClick={() => onRemoveOptOut(opt.callerNumber)}
                          className="inline-flex items-center gap-1 rounded-lg border border-rose-500/25 px-2.5 py-1 text-[11px] text-rose-300"
                        >
                          <Trash2 className="w-3 h-3" /> Re-enable
                        </button> */}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <div className="flex items-center justify-end gap-2">
        <span className="text-[11px] text-slate-500">Page {page}</span>
        <button
          type="button"
          title="Previous page"
          disabled={page <= 1}
          onClick={() =>
            activeTab === "suppressed"
              ? onSuppressedPageChange(page - 1)
              : onOptOutPageChange(page - 1)
          }
          className="p-2 rounded-lg border border-slate-800 text-slate-400 disabled:opacity-40"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          title="Next page"
          disabled={!hasNext}
          onClick={() =>
            activeTab === "suppressed"
              ? onSuppressedPageChange(page + 1)
              : onOptOutPageChange(page + 1)
          }
          className="p-2 rounded-lg border border-slate-800 text-slate-400 disabled:opacity-40"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
