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
      label: "No Reply",
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
}) => {
  const chatMessagesRef = React.useRef<HTMLDivElement>(null);
  const chatSectionRef = React.useRef<HTMLElement>(null);

  // Auto-scroll chat messages to bottom whenever selected thread changes
  React.useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [selectedThread?._id]);

  const handleSelectThread = (thread: SmsThread) => {
    onSelectThread(thread);
    if (typeof window !== "undefined" && window.innerWidth < 1280) {
      chatSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(330px,0.92fr)_minmax(0,1.08fr)] gap-5 xl:h-[calc(100vh-9.5rem)] min-h-[580px]">
      {/* Left Column: Inquiry Thread List */}
      <section className="min-w-0 flex flex-col xl:h-full space-y-3">
        {/* Pinned Controls: Search & Filter Pills */}
        <div className="flex flex-col gap-3 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search caller number"
              className="w-full bg-slate-950/60 border border-slate-800/60 focus:border-blue-500/60 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 outline-none transition-colors"
            />
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {statuses.map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => onStatusFilterChange(value)}
                className={`whitespace-nowrap rounded-xl px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                  statusFilter === value
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-slate-900/50 border border-slate-800/60 text-slate-300 hover:bg-slate-800/60"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="flex-shrink-0 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-300">
            {error}
          </div>
        )}

        {loading && (
          <div className="flex-shrink-0 flex items-center gap-2 text-xs text-slate-400">
            <RefreshCw className="w-4 h-4 animate-spin" /> Loading resolved
            inquiries...
          </div>
        )}

        {/* Scrollable list of inquiries */}
        <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-2.5 max-h-[520px] xl:max-h-none">
          {threads.length === 0 && !loading ? (
            <div className="rounded-xl border border-slate-800/60 bg-slate-900/50 py-14 text-center text-xs text-slate-500">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 text-slate-600" />
              No resolved inquiries found.
            </div>
          ) : (
            threads.map((thread) => {
              const item = badge(thread.status);
              const last = thread.conversationHistory.at(-1);
              const isSelected = selectedThread?._id === thread._id;

              return (
                <button
                  type="button"
                  key={thread._id}
                  onClick={() => handleSelectThread(thread)}
                  className={`w-full text-left rounded-xl border p-4 transition-all cursor-pointer ${
                    isSelected
                      ? "border-blue-500/60 bg-blue-500/10 ring-1 ring-blue-500/30 shadow-sm"
                      : "border-slate-800/60 bg-slate-900/50 hover:border-slate-700/80 hover:bg-slate-900/80"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">
                        {formatPhone(thread.callerNumber)}
                      </p>
                      <p className="mt-1 flex items-center gap-1 text-[11px] text-slate-400">
                        <Store className="w-3 h-3 text-blue-400" />{" "}
                        {thread.storeName || "Unknown store"}
                      </p>
                    </div>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${item.className}`}
                    >
                      {item.label}
                    </span>
                  </div>
                  <p className="mt-2.5 truncate text-xs text-slate-300">
                    {last?.content ? (
                      last.content
                    ) : thread.status === "closed_answered" ? (
                      <span className="text-blue-300/90 font-medium">
                        📞 Resolved via phone call with store
                      </span>
                    ) : thread.openingSentAt ? (
                      <span className="text-slate-400">
                        Outreach SMS sent · No customer reply
                      </span>
                    ) : (
                      "No message content"
                    )}
                  </p>
                  <p className="mt-2 text-[11px] text-slate-500">
                    Closed {formatDate(thread.closedAt || thread.updatedAt)}
                  </p>
                </button>
              );
            })
          )}
        </div>

        {/* Pinned Pagination Controls */}
        <div className="flex-shrink-0 flex items-center justify-between border-t border-slate-800/50 pt-2.5">
          <span className="text-[11px] text-slate-500">
            Page {page} {threads.length > 0 && `(${threads.length} logs)`}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              title="Previous page"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="rounded-lg border border-slate-800 p-2 text-slate-400 hover:text-white hover:bg-slate-800/60 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              title="Next page"
              disabled={!hasNextPage}
              onClick={() => onPageChange(page + 1)}
              className="rounded-lg border border-slate-800 p-2 text-slate-400 hover:text-white hover:bg-slate-800/60 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Right Column: Chat Details / Archive View */}
      <section
        ref={chatSectionRef}
        className="min-w-0 flex flex-col h-[550px] xl:h-full rounded-xl border border-slate-800/60 bg-slate-900/50 overflow-hidden shadow-sm"
      >
        {!selectedThread ? (
          <div className="h-full min-h-[450px] flex items-center justify-center text-center text-xs text-slate-500 p-6">
            <div>
              <MessageSquare className="w-10 h-10 mx-auto mb-3 text-slate-600" />
              <p className="font-medium text-slate-400">Select a resolved inquiry</p>
              <p className="text-[11px] text-slate-500 mt-1">
                Click on any inquiry from the left to view the complete conversation history.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex h-full min-h-0 flex-col">
            {/* Chat Header */}
            <header className="flex-shrink-0 border-b border-slate-800/60 bg-slate-950/60 p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="flex items-center gap-2 text-base font-bold text-white">
                    <Phone className="w-4 h-4 text-blue-400" />
                    {formatPhone(selectedThread.callerNumber)}
                  </h3>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                    <Store className="w-3.5 h-3.5 text-blue-400" />{" "}
                    {selectedThread.storeName || "Unknown store"} ·{" "}
                    {formatDate(
                      selectedThread.closedAt || selectedThread.updatedAt,
                    )}
                  </p>
                </div>
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${badge(selectedThread.status).className}`}
                >
                  {badge(selectedThread.status).label}
                </span>
              </div>
            </header>

            {/* Booking Banner (if captured) */}
            {selectedThread.bookingCaptured && selectedThread.bookingDetails && (
              <div className="flex-shrink-0 m-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
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

            {/* Scrollable Chat Area */}
            <div
              ref={chatMessagesRef}
              className="flex-1 min-h-0 space-y-4 overflow-y-auto p-4 sm:p-5"
            >
              {selectedThread.status === "closed_answered" && (
                <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-3.5 text-xs text-blue-200 flex items-start gap-2.5">
                  <Phone className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="text-white block font-semibold mb-0.5">
                      Resolved on Phone Call
                    </strong>
                    The customer connected directly with store staff on a
                    follow-up call. The inquiry was resolved by phone rather than
                    SMS.
                  </div>
                </div>
              )}

              {selectedThread.conversationHistory.length === 0 &&
                selectedThread.status !== "closed_answered" && (
                  <div className="rounded-xl border border-slate-800/60 bg-slate-900/60 p-4 text-center text-xs text-slate-500">
                    {selectedThread.openingSentAt ? (
                      <div>
                        <p className="text-slate-400 mb-1 font-medium">
                          Initial Outreach SMS Sent
                        </p>
                        <p className="text-slate-500 text-[11px]">
                          Sent on {formatDate(selectedThread.openingSentAt)}. No
                          customer reply was received before this inquiry was
                          closed.
                        </p>
                      </div>
                    ) : (
                      "No message history recorded for this inquiry."
                    )}
                  </div>
                )}

              {selectedThread.conversationHistory.map((message, index) => {
                const user = message.role === "user";
                return (
                  <div
                    key={`${message.sentAt}-${index}`}
                    className={`flex ${user ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                        user
                          ? "rounded-tr-sm bg-blue-600 text-white"
                          : "rounded-tl-sm border border-slate-700/50 bg-slate-800/70 text-slate-100"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      <p
                        className={`mt-2 text-[10px] ${
                          user ? "text-blue-100" : "text-slate-400"
                        }`}
                      >
                        {user ? "Customer" : "Mister Minit Concierge"} ·{" "}
                        {formatDate(message.sentAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Chat Footer */}
            <footer className="flex-shrink-0 border-t border-slate-800/60 bg-slate-950/60 p-4 text-xs text-slate-400">
              This conversation was closed on{" "}
              {formatDate(selectedThread.closedAt || selectedThread.updatedAt)}{" "}
              with reason:{" "}
              <span className="text-slate-300 font-medium">
                {String(
                  selectedThread.closedReason || selectedThread.status,
                ).replace(/_/g, " ")}
              </span>
              . Read-only archive.
            </footer>
          </div>
        )}
      </section>
    </div>
  );
};
