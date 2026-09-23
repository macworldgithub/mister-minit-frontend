import React from "react";
import type { SmsThread } from "../../types";
import {
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Phone,
  RefreshCw,
  Search,
  Store,
} from "lucide-react";

interface ClosedInquiriesViewProps {
  threads: SmsThread[];
  selectedThread: SmsThread | null;
  onSelectThread: (thread: SmsThread) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  loading: boolean;
  error: string | null;
  page: number;
  hasNextPage: boolean;
  onPageChange: (page: number) => void;
}

const statuses = [
  ["all", "All Resolved"],
  ["closed_visited", "Confirmed In-Store Visit"],
  ["closed_answered", "Resolved by Phone"],
  ["closed_no_response", "No Customer Reply"],
] as const;

const formatPhone = (phone: string) => {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10)
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  return phone;
};

const formatDate = (value?: string | null) =>
  value
    ? new Date(value).toLocaleString([], {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "-";

const badge = (status: string) => {
  const values: Record<string, { label: string; className: string }> = {
    closed_visited: {
      label: "Visit Confirmed",
      className: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    },
    closed_answered: {
      label: "Resolved on Call",
      className: "bg-blue-500/15 text-blue-300 border-blue-500/30",
    },
    closed_no_response: {
      label: "No Reply (72h)",
      className: "bg-slate-800 text-slate-300 border-slate-700/60",
    },
  };
  return (
    values[status] ?? {
      label: status.replace(/_/g, " "),
      className: "bg-slate-800 text-slate-300 border-slate-700/60",
    }
  );
};

export const ClosedInquiriesView: React.FC<ClosedInquiriesViewProps> = ({
  threads,
  selectedThread,
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
}) => (
  <div className="grid grid-cols-1 xl:grid-cols-[minmax(320px,0.9fr)_minmax(0,1.1fr)] gap-5 min-h-[650px]">
    <section className="min-w-0 space-y-4">
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search caller number"
            className="w-full bg-slate-950/60 border border-slate-800/60 focus:border-blue-500/60 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 outline-none"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {statuses.map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => onStatusFilterChange(value)}
              className={`whitespace-nowrap rounded-xl px-3 py-1.5 text-xs font-medium ${statusFilter === value ? "bg-blue-600 text-white" : "bg-slate-900/50 border border-slate-800/60 text-slate-300"}`}
            >
              {label}
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
          <RefreshCw className="w-4 h-4 animate-spin" /> Loading resolved
          inquiries...
        </div>
      )}
      <div className="space-y-2.5">
        {threads.length === 0 && !loading ? (
          <div className="rounded-xl border border-slate-800/60 bg-slate-900/50 py-14 text-center text-xs text-slate-500">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 text-slate-600" />
            No resolved inquiries found.
          </div>
        ) : (
          threads.map((thread) => {
            const item = badge(thread.status);
            const last = thread.conversationHistory.at(-1);
            return (
              <button
                type="button"
                key={thread._id}
                onClick={() => onSelectThread(thread)}
                className={`w-full text-left rounded-xl border p-4 transition-colors ${selectedThread?._id === thread._id ? "border-blue-500/50 bg-blue-500/10" : "border-slate-800/60 bg-slate-900/50 hover:border-slate-700"}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">
                      {formatPhone(thread.callerNumber)}
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-[11px] text-slate-400">
                      <Store className="w-3 h-3" />{" "}
                      {thread.storeName || "Unknown store"}
                    </p>
                  </div>
                  <span
                    className={`rounded-full border px-2 py-1 text-[10px] font-semibold ${item.className}`}
                  >
                    {item.label}
                  </span>
                </div>
                <p className="mt-3 truncate text-xs text-slate-300">
                  {last?.content || "No message content"}
                </p>
                <p className="mt-2 text-[11px] text-slate-500">
                  Closed {formatDate(thread.closedAt || thread.updatedAt)}
                </p>
              </button>
            );
          })
        )}
      </div>
      <div className="flex items-center justify-end gap-2">
        <span className="text-[11px] text-slate-500">Page {page}</span>
        <button
          type="button"
          title="Previous page"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="rounded-lg border border-slate-800 p-2 text-slate-400 disabled:opacity-40"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          title="Next page"
          disabled={!hasNextPage}
          onClick={() => onPageChange(page + 1)}
          className="rounded-lg border border-slate-800 p-2 text-slate-400 disabled:opacity-40"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </section>
    <section className="min-w-0 rounded-xl border border-slate-800/60 bg-slate-900/50 overflow-hidden">
      {!selectedThread ? (
        <div className="h-full min-h-[500px] flex items-center justify-center text-center text-xs text-slate-500">
          <div>
            <MessageSquare className="w-10 h-10 mx-auto mb-3 text-slate-600" />
            Select a resolved inquiry to view the archive.
          </div>
        </div>
      ) : (
        <div className="flex h-full min-h-[650px] flex-col">
          <header className="border-b border-slate-800/60 bg-slate-950/60 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="flex items-center gap-2 text-base font-bold text-white">
                  <Phone className="w-4 h-4 text-blue-400" />
                  {formatPhone(selectedThread.callerNumber)}
                </h3>
                <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                  <Store className="w-3 h-3" />{" "}
                  {selectedThread.storeName || "Unknown store"} ·{" "}
                  {formatDate(
                    selectedThread.closedAt || selectedThread.updatedAt,
                  )}
                </p>
              </div>
              <span
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${badge(selectedThread.status).className}`}
              >
                {badge(selectedThread.status).label}
              </span>
            </div>
          </header>
          {selectedThread.bookingCaptured && selectedThread.bookingDetails && (
            <div className="m-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-300">
                <CalendarCheck className="w-4 h-4" /> Booking captured
              </p>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <span>
                  <b className="block text-[10px] uppercase text-slate-400">
                    Customer
                  </b>
                  {selectedThread.bookingDetails.customerName || "-"}
                </span>
                <span>
                  <b className="block text-[10px] uppercase text-slate-400">
                    Service
                  </b>
                  {selectedThread.bookingDetails.serviceType || "-"}
                </span>
                <span>
                  <b className="block text-[10px] uppercase text-slate-400">
                    Preferred time
                  </b>
                  {selectedThread.bookingDetails.preferredTime || "-"}
                </span>
              </div>
            </div>
          )}
          <div className="flex-1 space-y-4 overflow-y-auto p-5">
            {selectedThread.conversationHistory.map((message, index) => {
              const user = message.role === "user";
              return (
                <div
                  key={`${message.sentAt}-${index}`}
                  className={`flex ${user ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${user ? "rounded-tr-sm bg-blue-600 text-white" : "rounded-tl-sm border border-slate-700/50 bg-slate-800/70 text-slate-100"}`}
                  >
                    <p>{message.content}</p>
                    <p
                      className={`mt-2 text-[10px] ${user ? "text-blue-100" : "text-slate-400"}`}
                    >
                      {user ? "Customer" : "Mister Minit Concierge"} ·{" "}
                      {formatDate(message.sentAt)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          <footer className="border-t border-slate-800/60 bg-slate-950/60 p-4 text-xs text-slate-400">
            This conversation was closed on{" "}
            {formatDate(selectedThread.closedAt || selectedThread.updatedAt)}{" "}
            with reason:{" "}
            {String(
              selectedThread.closedReason || selectedThread.status,
            ).replace(/_/g, " ")}
            . Read-only archive.
          </footer>
        </div>
      )}
    </section>
  </div>
);
