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
  <div className="space-y-6">
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
      <div className="relative flex-1 max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search caller number, call ID, reason..."
          className="w-full bg-slate-950/60 border border-slate-800/60 focus:border-blue-500/60 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder:text-slate-500 outline-none"
        />
      </div>
      <select
        value={statusFilter}
        onChange={(e) =>
          onStatusFilterChange(e.target.value as "all" | "missed" | "answered")
        }
        className="bg-slate-900/50 border border-slate-800/60 text-slate-300 rounded-xl px-3 py-2 text-xs"
      >
        <option value="all">All Calls</option>
        <option value="missed">Missed Only</option>
        <option value="answered">Answered Only</option>
      </select>
    </div>
    {error && (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-300">
        {error}
      </div>
    )}
    {loading && (
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <RefreshCw className="w-4 h-4 animate-spin" /> Loading live 3CX call
        logs...
      </div>
    )}
    <div className="bg-slate-900/50 border border-slate-800/60 rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-xs">
          <thead className="bg-slate-900/80 border-b border-slate-800/60 text-slate-400 uppercase text-[10px]">
            <tr>
              <th className="p-4">Call ID</th>
              <th className="p-4">Date & Time</th>
              <th className="p-4">Caller Number</th>
              <th className="p-4">Store Name</th>
              <th className="p-4">Duration</th>
              <th className="p-4">Status</th>
              <th className="p-4">Reason Terminated</th>
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
                    className="hover:bg-slate-800/30 text-slate-300"
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
                      {cdr.storeName || cdr["dial-no"] || "-"}
                    </td>
                    <td className="p-4">{cdr.duration || "00:00:00"}</td>
                    <td className="p-4">
                      {missed ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-red-500/30 bg-red-500/15 px-2 py-1 text-[10px] font-bold uppercase text-red-300">
                          <PhoneMissed className="w-3 h-3" /> Missed
                        </span>
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
