import React from "react";
import type { CdrRecord } from "../../types";
import {
  ArrowDownLeft,
  ChevronLeft,
  ChevronRight,
  PhoneCall,
  PhoneMissed,
  RefreshCw,
  Search,
} from "lucide-react";

interface CdrViewProps {
  cdrs: CdrRecord[];
  statusFilter: "all" | "missed" | "answered";
  onStatusFilterChange: (value: "all" | "missed" | "answered") => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  loading: boolean;
  error: string | null;
  page: number;
  hasNextPage: boolean;
  onPageChange: (page: number) => void;
}

export const CdrView: React.FC<CdrViewProps> = ({
  cdrs,
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
  <div className="flex flex-col space-y-4 lg:h-[calc(100vh-9.5rem)] min-h-[580px]">
    {/* Pinned Top Bar: Search & Filter Dropdown */}
    <div className="flex-shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
      <div className="relative flex-1 max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search caller number, call ID, reason..."
          className="w-full bg-slate-950/60 border border-slate-800/60 focus:border-blue-500/60 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder:text-slate-500 outline-none transition-colors"
        />
      </div>
      <select
        value={statusFilter}
        onChange={(e) =>
          onStatusFilterChange(e.target.value as "all" | "missed" | "answered")
        }
        className="bg-slate-900/50 border border-slate-800/60 text-slate-300 rounded-xl px-3 py-2 text-xs cursor-pointer focus:border-blue-500/60 outline-none"
      >
        <option value="all">All Calls</option>
        <option value="missed">Missed Only</option>
        <option value="answered">Answered Only</option>
      </select>
    </div>

    {error && (
      <div className="flex-shrink-0 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-300">
        {error}
      </div>
    )}

    {loading && (
      <div className="flex-shrink-0 flex items-center gap-2 text-xs text-slate-400">
        <RefreshCw className="w-4 h-4 animate-spin" /> Loading live 3CX call
        logs...
      </div>
    )}

    {/* Scrollable Table Card with Sticky Header */}
    <div className="flex-1 min-h-0 bg-slate-900/50 border border-slate-800/60 rounded-xl overflow-hidden shadow-sm flex flex-col">
      <div className="flex-1 min-h-0 overflow-auto">
        <table className="w-full min-w-[900px] text-left text-xs border-collapse">
          <thead className="sticky top-0 z-10 bg-slate-900 border-b border-slate-800/80 text-slate-400 uppercase text-[10px] tracking-wider shadow-sm">
            <tr>
              <th className="p-4 bg-slate-900 font-semibold">Call ID</th>
              <th className="p-4 bg-slate-900 font-semibold">Date & Time</th>
              <th className="p-4 bg-slate-900 font-semibold">Caller Number</th>
              <th className="p-4 bg-slate-900 font-semibold">Store Name</th>
              <th className="p-4 bg-slate-900 font-semibold">Duration</th>
              <th className="p-4 bg-slate-900 font-semibold">Status</th>
              <th className="p-4 bg-slate-900 font-semibold">Reason Terminated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40">
            {cdrs.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  <PhoneCall className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  No 3CX call records match the active criteria.
                </td>
              </tr>
            ) : (
              cdrs.map((cdr) => {
                const missed = cdr.callStatus === "missed" || cdr.isMissed;
                return (
                  <tr
                    key={cdr.callid}
                    className="hover:bg-slate-800/30 text-slate-300 transition-colors"
                  >
                    <td className="p-4 font-semibold text-white">
                      {cdr.callId || cdr.callid}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      {cdr.timeStart || cdr["time-start"] || cdr.timestamp}
                    </td>
                    <td className="p-4 font-mono text-white">
                      {cdr.fromNo || cdr["from-no"]}
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-white">
                        {cdr.storeName || cdr["dial-no"] || "-"}
                      </div>
                      {cdr.finalType === "queue" && (
                        <div className="inline-flex items-center gap-1 text-[10px] text-amber-400 font-mono mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                          Queue {cdr.finalNumber ? `(${cdr.finalNumber})` : ""}
                        </div>
                      )}
                      {cdr.finalType === "extension" && (
                        <div className="inline-flex items-center gap-1 text-[10px] text-blue-400 font-mono mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                          Agent {cdr.finalNumber ? `(${cdr.finalNumber})` : ""}
                        </div>
                      )}
                      {cdr.finalType === "voicemail" && (
                        <div className="inline-flex items-center gap-1 text-[10px] text-purple-400 font-mono mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                          Voicemail {cdr.finalNumber ? `(${cdr.finalNumber})` : ""}
                        </div>
                      )}
                      {cdr.finalType === "ivr" && (
                        <div className="inline-flex items-center gap-1 text-[10px] text-indigo-400 font-mono mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                          IVR {cdr.finalNumber ? `(${cdr.finalNumber})` : ""}
                        </div>
                      )}
                    </td>
                    <td className="p-4">{cdr.duration || "00:00:00"}</td>
                    <td className="p-4">
                      {missed ? (
                        <div>
                          <span className="inline-flex items-center gap-1 rounded-full border border-red-500/30 bg-red-500/15 px-2 py-1 text-[10px] font-bold uppercase text-red-300">
                            <PhoneMissed className="w-3 h-3" /> Missed
                          </span>
                          {(cdr.missedRule === "queue_unanswered" ||
                            cdr.missedRule === "dropped_in_queue") && (
                            <div className="text-[10px] text-amber-400 mt-1 font-medium">
                              Queue Drop
                            </div>
                          )}
                          {cdr.missedRule === "voicemail" && (
                            <div className="text-[10px] text-purple-400 mt-1 font-medium">
                              Voicemail
                            </div>
                          )}
                          {cdr.missedRule === "ivr_drop" && (
                            <div className="text-[10px] text-indigo-400 mt-1 font-medium">
                              IVR Drop
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full border border-slate-700/60 bg-slate-800 px-2 py-1 text-[10px] font-bold uppercase text-slate-300">
                          <ArrowDownLeft className="w-3 h-3" /> Answered
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      {cdr.reasonTerminated || cdr["reason-terminated"] || "-"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>

    {/* Pinned Pagination Controls */}
    <div className="flex-shrink-0 flex items-center justify-between border-t border-slate-800/50 pt-2 px-1">
      <span className="text-[11px] text-slate-500">
        Page {page} {cdrs.length > 0 && `(${cdrs.length} records)`}
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          title="Previous page"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="p-2 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/60 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          title="Next page"
          disabled={!hasNextPage}
          onClick={() => onPageChange(page + 1)}
          className="p-2 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/60 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
);
