import React from "react";
import type { SmsThread, ThreadStatus } from "../../types";
import { ThreadStatus as StatusEnum } from "../../types";
import {
  Search,
  MessageSquare,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";

interface ConversationsViewProps {
  threads: SmsThread[];
  onSelectThread: (thread: SmsThread) => void;
  onUpdateStatus: (threadId: string, status: ThreadStatus) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  loading: boolean;
  error: string | null;
  page: number;
  hasNextPage: boolean;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
}

export const ConversationsView: React.FC<ConversationsViewProps> = ({
  threads,
  onSelectThread,
  statusFilter,
  onStatusFilterChange,
  searchQuery,
  onSearchChange,
  loading,
  error,
  page,
  hasNextPage,
  onPageChange,
  onRefresh,
}) => {
  const statusOptions = [
    { value: "all", label: "All Live" },
    { value: StatusEnum.SMS_SENT, label: "Awaiting Reply" },
    { value: StatusEnum.BOOKING_REQUESTED, label: "Booking Requested" },
  ];

  const getStatusBadge = (status: ThreadStatus) => {
    switch (status) {
      case StatusEnum.BOOKING_REQUESTED:
        return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
      case StatusEnum.ACTIVE:
        return "bg-slate-800 text-slate-200 border-slate-700/80";
      case StatusEnum.SMS_SENT:
        return "bg-slate-800/80 text-slate-300 border-slate-700/60";
      case StatusEnum.CLOSED_VISITED:
        return "bg-slate-800/60 text-slate-400 border-slate-700/50";
      case StatusEnum.CLOSED_OPTED_OUT:
        return "bg-slate-900 text-slate-500 border-slate-800";
      default:
        return "bg-slate-800/60 text-slate-300 border-slate-700/60";
    }
  };

  const formatTimestamp = (isoString?: string | null) => {
    if (!isoString) return "—";
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar: Search & Status Pills */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by caller number, store, customer, message..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-slate-950/60 border border-slate-800/60 focus:border-blue-500/60 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder:text-slate-500 outline-none transition-colors"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onStatusFilterChange(opt.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === opt.value
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-900/50 border border-slate-800/60 text-slate-300 hover:bg-slate-800/60"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-300">
          {error}
        </div>
      )}
      {loading && (
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <RefreshCw className="w-4 h-4 animate-spin" /> Loading live SMS
          threads...
        </div>
      )}
      <button
        type="button"
        onClick={onRefresh}
        disabled={loading}
        className="ml-auto inline-flex items-center gap-2 rounded-xl border border-slate-800 px-3 py-2 text-xs text-slate-300 disabled:opacity-40"
      >
        <RefreshCw className="w-3.5 h-3.5" /> Refresh
      </button>

      {/* Threads Table */}
      <div className="bg-slate-900/50 border border-slate-800/60 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 border-b border-slate-800/60 text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Caller / Customer</th>
                <th className="py-3.5 px-4">Store & DID</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Latest Message</th>
                <th className="py-3.5 px-4">Booking Info</th>
                <th className="py-3.5 px-4">Last Activity</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {threads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <MessageSquare className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    No SMS threads found matching your filters.
                  </td>
                </tr>
              ) : (
                threads.map((thread) => {
                  const lastMsg =
                    thread.conversationHistory.length > 0
                      ? thread.conversationHistory[
                          thread.conversationHistory.length - 1
                        ]
                      : null;

                  return (
                    <tr
                      key={thread._id}
                      onClick={() => onSelectThread(thread)}
                      className="hover:bg-slate-800/30 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                          {thread.callerNumber}
                        </div>
                        {thread.bookingDetails?.customerName && (
                          <div className="text-[11px] text-slate-400">
                            {thread.bookingDetails.customerName}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-slate-200 font-medium">
                          {thread.storeName || "—"}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          DID: {thread.did}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getStatusBadge(
                            thread.status,
                          )}`}
                        >
                          {thread.status.replace(/_/g, " ")}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="truncate text-slate-300">
                          {lastMsg ? (
                            <span>
                              <strong className="text-slate-400">
                                {lastMsg.role === "user" ? "Cust: " : "Bot: "}
                              </strong>
                              {lastMsg.content}
                            </span>
                          ) : (
                            <span className="italic text-slate-500">
                              No messages
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {thread.bookingCaptured && thread.bookingDetails ? (
                          <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                            <CalendarCheck className="w-3.5 h-3.5" />
                            <span
                              className="truncate max-w-35"
                              title={thread.bookingDetails.serviceType || ""}
                            >
                              {thread.bookingDetails.serviceType || "Service"}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-400">
                        {formatTimestamp(
                          thread.lastInteractionAt || thread.createdAt,
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectThread(thread);
                          }}
                          className="px-2.5 py-1 rounded-xl bg-slate-800/60 hover:bg-blue-600 hover:text-white text-slate-300 text-[11px] font-semibold transition-colors cursor-pointer"
                        >
                          Open Chat
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="flex items-center justify-end gap-2">
        <span className="text-[11px] text-slate-500">Page {page}</span>
        <button
          type="button"
          title="Previous page"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="p-2 rounded-lg border border-slate-800 text-slate-400 disabled:opacity-40"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          title="Next page"
          disabled={!hasNextPage}
          onClick={() => onPageChange(page + 1)}
          className="p-2 rounded-lg border border-slate-800 text-slate-400 disabled:opacity-40"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
