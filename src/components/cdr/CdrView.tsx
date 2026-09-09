import React from 'react';
import type { CdrRecord } from '../../types';
import { PhoneCall, PhoneMissed, Search, ArrowDownLeft } from 'lucide-react';

interface CdrViewProps {
  cdrs: CdrRecord[];
  missedOnly: boolean;
  onToggleMissedOnly: (val: boolean) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const CdrView: React.FC<CdrViewProps> = ({
  cdrs,
  missedOnly,
  onToggleMissedOnly,
  searchQuery,
  onSearchChange,
}) => {
  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by caller number, DID, call ID, reason..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-slate-950/60 border border-slate-800/60 focus:border-red-500/60 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder:text-slate-500 outline-none transition-colors"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onToggleMissedOnly(!missedOnly)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all cursor-pointer ${
              missedOnly
                ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-900/30'
                : 'bg-slate-900/50 border-slate-800/60 text-slate-300 hover:bg-slate-800/60'
            }`}
          >
            <PhoneMissed className="w-3.5 h-3.5" />
            {missedOnly ? 'Showing Missed Calls Only' : 'Filter Missed Calls Only'}
          </button>
        </div>
      </div>

      {/* CDR Table */}
      <div className="bg-slate-900/50 border border-slate-800/60 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 border-b border-slate-800/60 text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">Caller (From-No)</th>
                <th className="py-3.5 px-4">Target DID (Dial-No)</th>
                <th className="py-3.5 px-4">Duration</th>
                <th className="py-3.5 px-4">Start / End</th>
                <th className="py-3.5 px-4">Termination Reason</th>
                <th className="py-3.5 px-4">3CX Call ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 font-mono">
              {cdrs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-sans">
                    <PhoneCall className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    No 3CX call records match the active criteria.
                  </td>
                </tr>
              ) : (
                cdrs.map((cdr) => (
                  <tr key={cdr.callid} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4">
                      {cdr.isMissed ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-red-500/15 text-red-300 border border-red-500/30">
                          <PhoneMissed className="w-3 h-3" /> Missed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700/60">
                          <ArrowDownLeft className="w-3 h-3 text-slate-400" /> Answered
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-slate-300 font-sans whitespace-nowrap">
                      {cdr.timestamp}
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-white">
                      {cdr['from-no']}
                      {cdr['from-dn'] && (
                        <span className="text-slate-400 font-normal block text-[11px] font-sans">
                          {cdr['from-dn']}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-red-400 font-medium">
                      {cdr['dial-no']}
                    </td>

                    <td className="py-3.5 px-4 text-slate-300">
                      {cdr.duration || '00:00:00'}
                    </td>

                    <td className="py-3.5 px-4 text-[11px] text-slate-400">
                      {cdr['time-start']} → {cdr['time-end']}
                    </td>

                    <td className="py-3.5 px-4 font-sans text-slate-300">
                      <span className="bg-slate-800/60 px-2 py-0.5 rounded-lg border border-slate-700/60 text-[11px]">
                        {cdr['reason-terminated']}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-[11px] text-slate-500 truncate max-w-[120px]">
                      {cdr.callid}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
