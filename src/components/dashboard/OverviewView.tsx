import React from "react";
import type {
  DashboardMetrics,
  SmsThread,
  StoreConfig,
  ThreadStatus,
} from "../../types";
import { ThreadStatus as StatusEnum } from "../../types";
import { MetricCard } from "./MetricCard";
import {
  PhoneCall,
  PhoneMissed,
  Send,
  MessageSquareCheck,
  CalendarCheck,
  ShieldX,
  ChevronRight,
  ExternalLink,
  Store,
  User,
  Clock,
} from "lucide-react";

interface OverviewViewProps {
  metrics: DashboardMetrics;
  recentThreads: SmsThread[];
  stores: StoreConfig[];
  onSelectThread: (thread: SmsThread) => void;
  onNavigateTab: (
    tab: "conversations" | "stores" | "cdr" | "suppressed",
  ) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  metrics,
  recentThreads,
  stores,
  onSelectThread,
  onNavigateTab,
}) => {
  const getStatusBadge = (status: ThreadStatus) => {
    switch (status) {
      case StatusEnum.BOOKING_REQUESTED:
        return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
      case StatusEnum.ACTIVE:
        return "bg-slate-800 text-slate-200 border-slate-700/80";
      case StatusEnum.CLOSED_VISITED:
        return "bg-slate-800/80 text-slate-300 border-slate-700/60";
      case StatusEnum.CLOSED_OPTED_OUT:
        return "bg-slate-900 text-slate-400 border-slate-800";
      default:
        return "bg-slate-800/60 text-slate-300 border-slate-700/60";
    }
  };

  const formatStatus = (s: string) => s.replace(/_/g, " ");

  return (
    <div className="space-y-6">
      {/* Primary KPI Cards Grid: 1 col on mobile, 2 on sm/md, 4 on lg */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <MetricCard
          label="Inbound Calls"
          value={metrics.totalCalls}
          change="+14%"
          trend="up"
          icon={PhoneCall}
        />
        <MetricCard
          label="Missed Calls"
          value={metrics.missedCalls}
          subValue={`${Math.round((metrics.missedCalls / (metrics.totalCalls || 1)) * 100)}%`}
          change="+8%"
          trend="down"
          icon={PhoneMissed}
        />
        <MetricCard
          label="SMS Dispatched"
          value={metrics.smsSent}
          change="+22%"
          trend="up"
          icon={Send}
        />
        <MetricCard
          label="Customer Replies"
          value={metrics.replies}
          subValue={`${metrics.replyRatePercentage}% rate`}
          change="+18%"
          trend="up"
          icon={MessageSquareCheck}
        />
      </div>

      {/* Secondary KPI row — 2 cards responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <MetricCard
          label="Bookings Captured"
          value={metrics.bookingsCaptured}
          subValue={`${metrics.conversionRatePercentage}% conv.`}
          change="+35%"
          trend="up"
          icon={CalendarCheck}
        />
        <MetricCard
          label="Suppressed"
          value={metrics.suppressedCount}
          subValue={`${metrics.optOutCount} opt-outs`}
          icon={ShieldX}
        />
      </div>

      {/* Activity Trends & Performance Chart */}
      <div className="bg-slate-900/50 border border-slate-800/60 rounded-xl p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-white">
              Conversion Funnel Activity
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Daily trend of calls, missed call recovery SMS, and captured
              bookings
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-medium text-slate-300">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-slate-500"></span>{" "}
              Inbound Calls
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-red-500"></span> Missed
              Calls
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-slate-400"></span> SMS
              Dispatched
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400"></span>{" "}
              Bookings
            </span>
          </div>
        </div>

        {/* Visual Bar Chart with horizontal scroll safety on mobile */}
        <div className="overflow-x-auto pb-2">
          <div className="min-w-[450px]">
            <div className="h-44 sm:h-52 flex items-end justify-between gap-2 sm:gap-3 pt-6 pb-2 border-b border-slate-800/60">
              {metrics.trends.map((item) => {
                const maxVal = 70;
                const hCalls = Math.round((item.totalCalls / maxVal) * 100);
                const hMissed = Math.round((item.missedCalls / maxVal) * 100);
                const hSms = Math.round((item.smsSent / maxVal) * 100);
                const hBookings = Math.round((item.bookings / maxVal) * 100);

                return (
                  <div
                    key={item.date}
                    className="flex-1 flex flex-col items-center gap-2 group h-full justify-end"
                  >
                    <div className="w-full flex items-end justify-center gap-1 h-full px-0.5 sm:px-1">
                      <div
                        style={{ height: `${hCalls}%` }}
                        className="w-2 sm:w-2.5 bg-slate-600/80 hover:bg-slate-500 rounded-t-sm transition-all"
                        title={`Total Calls: ${item.totalCalls}`}
                      />
                      <div
                        style={{ height: `${hMissed}%` }}
                        className="w-2 sm:w-2.5 bg-red-500 hover:bg-red-400 rounded-t-sm transition-all"
                        title={`Missed Calls: ${item.missedCalls}`}
                      />
                      <div
                        style={{ height: `${hSms}%` }}
                        className="w-2 sm:w-2.5 bg-slate-400/80 hover:bg-slate-300 rounded-t-sm transition-all"
                        title={`SMS Dispatched: ${item.smsSent}`}
                      />
                      <div
                        style={{ height: `${hBookings}%` }}
                        className="w-2 sm:w-2.5 bg-emerald-400 hover:bg-emerald-300 rounded-t-sm transition-all"
                        title={`Bookings: ${item.bookings}`}
                      />
                    </div>
                    <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium whitespace-nowrap">
                      {item.date}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 text-[11px] text-slate-400">
              <span>Scale: 0 – 70 events/day</span>
              <span>Automatic 3CX sync every 60 seconds</span>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Recent Threads & Stores */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent SMS Conversations */}
        <div className="bg-slate-900/50 border border-slate-800/60 rounded-xl p-4 sm:p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-slate-800 text-blue-400 border border-slate-700/60">
                <Send className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Live SMS Threads
                </h3>
                <p className="text-xs text-slate-400">
                  Recent missed call inquiries
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab("conversations")}
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer transition-colors"
            >
              View All <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5 flex-1">
            {recentThreads.slice(0, 4).map((thread) => (
              <div
                key={thread._id}
                onClick={() => onSelectThread(thread)}
                className="p-3 sm:p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/60 hover:border-blue-500/30 hover:bg-slate-950/80 transition-all cursor-pointer group"
              >
                <div className="flex flex-wrap items-center justify-between gap-1.5 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-200">
                      {thread.callerNumber}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      ({thread.storeName})
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border ${getStatusBadge(
                      thread.status,
                    )}`}
                  >
                    {formatStatus(thread.status)}
                  </span>
                </div>

                <p className="text-xs text-slate-300 line-clamp-1 group-hover:text-white transition-colors">
                  {thread.conversationHistory.length > 0
                    ? thread.conversationHistory[
                        thread.conversationHistory.length - 1
                      ].content
                    : "Awaiting customer response..."}
                </p>

                {thread.bookingCaptured && thread.bookingDetails && (
                  <div className="mt-2 text-[11px] bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-2.5 py-1 text-emerald-300 flex items-center gap-1.5 flex-wrap">
                    <CalendarCheck className="w-3 h-3 text-emerald-400" />
                    <span>
                      Booking:{" "}
                      <strong>{thread.bookingDetails.serviceType}</strong> (
                      {thread.bookingDetails.preferredTime})
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Pilot Store Status */}
        <div className="bg-slate-900/50 border border-slate-800/60 rounded-xl p-4 sm:p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-slate-800 text-blue-400 border border-slate-700/60">
                <Store className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Active Pilot Stores
                </h3>
                <p className="text-xs text-slate-400">
                  Stores routing missed calls to SMS
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab("stores")}
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer transition-colors"
            >
              Manage <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5 flex-1">
            {stores.slice(0, 4).map((store) => (
              <div
                key={store.did}
                className="p-3 sm:p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/60 flex flex-wrap items-center justify-between gap-2"
              >
                <div className="space-y-1 min-w-[180px]">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-xs font-bold text-white">
                      {store.storeName}
                    </h4>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-800/60 px-1.5 py-0.5 rounded">
                      DID: {store.did}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" /> Hours
                      configured
                    </span>
                    {store.actionNotes && (
                      <span
                        className={`px-1.5 py-0.2 text-[10px] font-medium rounded border ${
                          store.actionNotes.toLowerCase().includes("hq reception")
                            ? "bg-amber-500/10 text-amber-300 border-amber-500/20"
                            : "bg-purple-500/10 text-purple-300 border-purple-500/20"
                        }`}
                      >
                        {store.actionNotes}
                      </span>
                    )}
                    {store.staffContacts[0] && (
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-500" />{" "}
                        {store.staffContacts[0].name}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${
                      store.isActive
                        ? "bg-blue-500/10 text-blue-300 border-blue-500/20"
                        : "bg-slate-800/60 text-slate-400 border-slate-700/60"
                    }`}
                  >
                    {store.isActive ? "Pilot Live" : "Inactive"}
                  </span>
                  {store.googleMapsLink && (
                    <a
                      href={store.googleMapsLink}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1 text-slate-400 hover:text-white transition-colors"
                      title="Open Google Maps"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
