import React from "react";

interface MetricCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon: React.ElementType;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subValue,
  change,
  trend = "up",
  icon: Icon,
}) => {
  return (
    <div className="rounded-xl bg-slate-900/50 p-4 sm:p-5 border border-slate-800/60 hover:border-slate-700 transition-all duration-200 shadow-sm relative overflow-hidden group">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <span className="text-[11px] sm:text-xs font-medium text-slate-400 uppercase tracking-wider block truncate">
            {label}
          </span>
          <div className="text-xl sm:text-2xl font-bold text-white mt-1.5 sm:mt-2 tracking-tight flex flex-wrap items-baseline gap-2">
            <span>{value}</span>
            {subValue && (
              <span className="text-xs font-normal text-slate-400">
                {subValue}
              </span>
            )}
          </div>
        </div>

        <div className="p-2.5 sm:p-3 rounded-xl bg-slate-800/60 text-slate-200 border border-slate-700/60 transition-transform duration-200 group-hover:scale-105 flex-shrink-0">
          <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
        </div>
      </div>

      {change && (
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${
              trend === "up"
                ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                : trend === "down"
                  ? "bg-slate-800 text-slate-400 border-slate-700/60"
                  : "bg-slate-800 text-slate-300 border-slate-700/60"
            }`}
          >
            {change}
          </span>
          <span className="text-[11px] text-slate-400">vs prev period</span>
        </div>
      )}
    </div>
  );
};
