import React, { useState } from "react";
import type {
  SuppressedEvent,
  OptOutRecord,
  SuppressedReason,
} from "../../types";
import { SuppressedReason as ReasonEnum } from "../../types";
import { ShieldAlert, UserX, Trash2, Filter } from "lucide-react";

interface SuppressedViewProps {
  suppressedEvents: SuppressedEvent[];
  optOutRecords: OptOutRecord[];
  onRemoveOptOut: (callerNumber: string) => void;
  reasonFilter: string;
  onReasonFilterChange: (reason: string) => void;
}

export const SuppressedView: React.FC<SuppressedViewProps> = ({
  suppressedEvents,
  optOutRecords,
  onRemoveOptOut,
  reasonFilter,
  onReasonFilterChange,
}) => {
  const [activeTab, setActiveTab] = useState<"suppressed" | "optouts">(
    "suppressed",
  );

  const reasonBadge = (reason: SuppressedReason) => {
    switch (reason) {
      case ReasonEnum.NOT_MOBILE:
        return {
          label: "Landline (Not Mobile)",
          class: "bg-slate-800 text-slate-300 border-slate-700/60",
          desc: "Cannot deliver SMS to Australian landline numbers.",
        };
      case ReasonEnum.NOT_A_PILOT_STORE:
        return {
          label: "Non-Pilot Store",
          class: "bg-slate-800/60 text-slate-400 border-slate-700/50",
          desc: "Store DID has not been onboarded into pilot yet.",
        };
      case ReasonEnum.DEDUP:
        return {
          label: "Deduplication Window",
          class: "bg-slate-800/80 text-slate-300 border-slate-700/60",
          desc: "Customer called repeatedly within rapid cooldown window.",
        };
      case ReasonEnum.OPTED_OUT:
        return {
          label: "Opted Out",
          class: "bg-red-500/15 text-red-300 border-red-500/30",
          desc: "Customer previously unsubscribed from SMS.",
        };
      default:
        return {
          label: (reason as string).replace(/_/g, " "),
          class: "bg-slate-800/60 text-slate-400 border-slate-700/60",
          desc: "",
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Subtabs Bar */}
      <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
        <div className="flex items-center gap-2 bg-slate-900/50 p-1 rounded-xl border border-slate-800/60">
          <button
            onClick={() => setActiveTab("suppressed")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "suppressed"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Suppressed Call Events ({suppressedEvents.length})
          </button>
          <button
            onClick={() => setActiveTab("optouts")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "optouts"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Opt-Out Registry ({optOutRecords.length})
          </button>
        </div>

        {activeTab === "suppressed" && (
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={reasonFilter}
              onChange={(e) => onReasonFilterChange(e.target.value)}
              className="bg-slate-950/60 border border-slate-800/60 text-slate-200 text-xs rounded-xl px-2.5 py-1.5 outline-none cursor-pointer"
            >
              <option value="all">All Suppression Reasons</option>
              <option value={ReasonEnum.NOT_MOBILE}>Landline Numbers</option>
              <option value={ReasonEnum.NOT_A_PILOT_STORE}>
                Non-Pilot Stores
              </option>
              <option value={ReasonEnum.DEDUP}>Dedup Cooldown</option>
              <option value={ReasonEnum.OPTED_OUT}>Opted-Out Callers</option>
            </select>
          </div>
        )}
      </div>

      {activeTab === "suppressed" ? (
        <div className="bg-slate-900/50 border border-slate-800/60 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 border-b border-slate-800/60 text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Suppression Reason</th>
                  <th className="py-3.5 px-4">Caller Number</th>
                  <th className="py-3.5 px-4">Store Name / DID</th>
                  <th className="py-3.5 px-4">3CX Call ID</th>
                  <th className="py-3.5 px-4">Timestamp</th>
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
                      No suppressed events match the selected criteria.
                    </td>
                  </tr>
                ) : (
                  suppressedEvents.map((ev) => {
                    const badge = reasonBadge(ev.suppressedReason);
                    return (
                      <tr
                        key={ev._id}
                        className="hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="py-3.5 px-4">
                          <div>
                            <span
                              className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${badge.class}`}
                            >
                              {badge.label}
                            </span>
                            {badge.desc && (
                              <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
                                {badge.desc}
                              </p>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-mono font-semibold text-white">
                          {ev.callerNumber}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="text-slate-200 font-medium">
                            {ev.storeName || "—"}
                          </div>
                          <div className="text-[10px] font-mono text-slate-400">
                            DID: {ev.did}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                          {ev.callId}
                        </td>

                        <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                          {new Date(ev.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900/50 border border-slate-800/60 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 border-b border-slate-800/60 text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Caller Number</th>
                  <th className="py-3.5 px-4">Opt-Out Trigger</th>
                  <th className="py-3.5 px-4">Detection Source</th>
                  <th className="py-3.5 px-4">Opt-Out Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
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
                      No customers have opted out.
                    </td>
                  </tr>
                ) : (
                  optOutRecords.map((opt) => (
                    <tr
                      key={opt._id}
                      className="hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono font-semibold text-white">
                        {opt.callerNumber}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="bg-slate-800/60 px-2 py-0.5 rounded-lg text-rose-300 font-mono text-[11px]">
                          "{opt.keyword}"
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full border ${
                            opt.source === "keyword"
                              ? "bg-sky-500/12 text-sky-400 border-sky-500/25"
                              : "bg-purple-500/12 text-purple-400 border-purple-500/25"
                          }`}
                        >
                          {opt.source === "keyword"
                            ? "SMS Keyword (STOP)"
                            : "AI LLM Detected"}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                        {new Date(opt.optOutAt).toLocaleString()}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => onRemoveOptOut(opt.callerNumber)}
                          className="px-2.5 py-1 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/25 text-[11px] font-semibold transition-colors cursor-pointer inline-flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" /> Re-enable SMS
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
