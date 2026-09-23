import React from "react";
import type { StatsStore, TimeRangeFilter } from "../../types";
import { Store, Calendar, RefreshCw, Menu } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle?: string;
  stores: StatsStore[];
  selectedStoreId: string;
  onSelectStore: (storeId: string) => void;
  timeRange: TimeRangeFilter;
  onSelectTimeRange: (range: TimeRangeFilter) => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
  onOpenMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  stores,
  selectedStoreId,
  onSelectStore,
  timeRange,
  onSelectTimeRange,
  onRefresh,
  isRefreshing =false,
  onOpenMobileMenu,
}) => {
  return (
    <header className="min-h-16 lg:h-20 bg-slate-900/50 backdrop-blur-md border-b border-slate-800/60 px-4 sm:px-6 lg:px-8 py-3 lg:py-0 flex flex-col md:flex-row md:items-center justify-between gap-3 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-xl bg-slate-950/60 border border-slate-800/60 text-slate-300 hover:text-white"
            title="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs text-slate-400 mt-0.5 hidden sm:block">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center flex-wrap gap-2.5 sm:gap-3">
        {/* Store Selector */}
        <div className="flex items-center gap-2 bg-slate-950/60 border border-slate-800/60 rounded-xl px-2.5 sm:px-3 py-1.5 shadow-sm max-w-[200px] sm:max-w-none">
          <Store className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400 flex-shrink-0" />
          <select
            value={selectedStoreId}
            onChange={(e) => onSelectStore(e.target.value)}
            className="bg-transparent text-xs font-medium text-slate-200 outline-none cursor-pointer pr-1 w-full truncate"
          >
            <option value="all" className="bg-slate-900 text-slate-200">
              All Stores ({stores.length} Pilot)
            </option>
            {stores.map((s) => (
              <option
                key={s.storeId}
                value={s.storeId}
                className="bg-slate-900 text-slate-200"
              >
                {s.storeName} ({s.did})
              </option>
            ))}
          </select>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center bg-slate-950/60 border border-slate-800/60 rounded-xl p-1">
          <Calendar className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-1 hidden xs:block" />
          {(["today", "7d", "30d", "all"] as TimeRangeFilter[]).map((range) => (
            <button
              key={range}
              onClick={() => onSelectTimeRange(range)}
              className={`px-2 sm:px-2.5 py-1 text-xs font-medium rounded-lg capitalize transition-all cursor-pointer ${
                timeRange === range
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {range === "7d" ? "7D" : range === "30d" ? "30D" : range}
            </button>
          ))}
        </div>

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          title="Refresh Data"
          className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/60 text-slate-400 hover:text-white hover:border-slate-700 transition-all cursor-pointer disabled:opacity-50 flex-shrink-0"
        >
          <RefreshCw
            className={`w-4 h-4 ${isRefreshing ? "animate-spin text-blue-400" : ""}`}
          />
        </button>
      </div>
    </header>
  );
};
