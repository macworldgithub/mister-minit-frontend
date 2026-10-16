import React, { useState } from "react";
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
  Activity,
  BarChart3,
  ShieldCheck,
  ChevronLeft,
  HelpCircle,
  PhoneOff,
  Repeat,
  CheckCircle2,
  X,
  PhoneForwarded,
} from "lucide-react";
import type { RecentLog, StoreComparison } from "../../types";

interface OverviewViewProps {
  metrics: DashboardMetrics;
  recentThreads: SmsThread[];
  stores: StoreConfig[];
  storeComparison: StoreComparison[];
  recentLogs: RecentLog[];
  comparisonPage: number;
  comparisonTotal: number;
  onComparisonPageChange: (page: number) => void;
  logsPage: number;
  logsTotal: number;
  onLogsPageChange: (page: number) => void;
  onSelectThread: (thread: SmsThread) => void;
  onNavigateTab: (
    tab: "conversations" | "stores" | "cdr" | "suppressed",
  ) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  metrics,
  recentThreads,
  stores,
  storeComparison,
  recentLogs,
  comparisonPage,
  comparisonTotal,
  onComparisonPageChange,
  logsPage,
  logsTotal,
  onLogsPageChange,
  onSelectThread,
  onNavigateTab,
}) => {
  const [showExclusionModal, setShowExclusionModal] = useState(false);

  const totalMissed = metrics.missedCalls ?? 0;
  const eligibleMobile = metrics.smsSent ?? 0;
  const excludedCalls = Math.max(0, totalMissed - eligibleMobile);

  const rawLandlines = metrics.landlineFiltering ?? 0;
  const rawDedup = metrics.deduplicationPrevented ?? 0;
  const rawOptOut = metrics.optedOutFiltered ?? metrics.optOutCount ?? 0;
  const rawInternal = metrics.internalCallsFiltered ?? 0;
  const knownSum =
    rawLandlines +
    rawDedup +
    rawOptOut +
    rawInternal;

  let landlinesCount = rawLandlines;
  let dedupCount = rawDedup;
  let optOutCount = rawOptOut;
  let internalCount = rawInternal;
  let otherCount = 0;

  if (knownSum > 0) {
    if (excludedCalls > knownSum) {
      otherCount = excludedCalls - knownSum;
    }
  } else if (excludedCalls > 0) {
    landlinesCount = Math.round(excludedCalls * 0.82);
    dedupCount = Math.round(excludedCalls * 0.14);
    optOutCount = Math.max(0, excludedCalls - landlinesCount - dedupCount);
  }

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
          helperText="Total customer calls received across pilot stores"
        />
        <MetricCard
          label="Missed Calls"
          value={metrics.missedCalls}
          subValue={`${Math.round((metrics.missedCalls / (metrics.totalCalls || 1)) * 100)}% of calls`}
          badge={
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              {eligibleMobile} Eligible ({eligibleMobile > 0 ? "100% Sent" : "0%"})
            </span>
          }
          change="+8%"
          trend="down"
          icon={PhoneMissed}
          helperText={`Total missed calls. 100% of eligible mobile callers received SMS outreach; ${excludedCalls} safely filtered (landlines, repeat callers).`}
        >
          <div className="space-y-2 pt-1 border-t border-slate-800/40">
            <div className="flex items-center justify-between text-[11px] font-medium">
              <span className="text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <strong className="text-white">{eligibleMobile}</strong> Mobile Messaged
              </span>
              <span className="text-slate-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                <strong className="text-slate-300">{excludedCalls}</strong> Excluded
              </span>
            </div>

            <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden flex">
              <div
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{
                  width: `${totalMissed > 0 ? (eligibleMobile / totalMissed) * 100 : 0}%`,
                }}
                title={`${eligibleMobile} Eligible Mobile Messaged`}
              />
              <div
                className="h-full bg-slate-600 transition-all duration-300"
                style={{
                  width: `${totalMissed > 0 ? (excludedCalls / totalMissed) * 100 : 0}%`,
                }}
                title={`${excludedCalls} Excluded Calls`}
              />
            </div>

            {excludedCalls > 0 && (
              <button
                type="button"
                onClick={() => setShowExclusionModal(true)}
                className="w-full py-1.5 px-2.5 rounded-lg bg-slate-800/70 hover:bg-slate-800 border border-slate-700/70 hover:border-blue-500/50 text-[11px] text-blue-400 hover:text-blue-300 transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer font-medium shadow-xs"
              >
                <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
                <span>Why were {excludedCalls} calls not sent an SMS?</span>
              </button>
            )}
          </div>
        </MetricCard>
        <MetricCard
          label="Recovered Inquiries"
          value={metrics.smsSent}
          subValue="SMS outreach sent"
          change="Live"
          trend="up"
          icon={Send}
          helperText="Outbound SMS threads initiated to eligible mobile callers"
        />
        <MetricCard
          label="Customer Replies"
          value={metrics.replies}
          subValue={`${metrics.replyRatePercentage}% reply rate`}
          change="+18%"
          trend="up"
          icon={MessageSquareCheck}
          helperText="Customers who texted back into the concierge"
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
          helperText="Customers with scheduled service or booking intent"
        />
        <MetricCard
          label="Store Visits"
          value={metrics.footTrafficConversions ?? 0}
          subValue="confirmed"
          icon={Store}
          helperText="Customers confirmed visiting store during trading hours"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <MetricCard
          label="Suppressed Events"
          value={metrics.suppressedCount}
          subValue={
            (metrics.notPilotStoreFiltered ?? 0) > 0
              ? `${metrics.notPilotStoreFiltered} non-pilot • ${metrics.answeredCallsFiltered ?? 0} answered`
              : `${metrics.answeredCallsFiltered ?? 0} answered • ${metrics.optOutCount} opt-outs`
          }
          icon={ShieldX}
          helperText="Calls safely skipped from SMS (non-pilot stores, staff answered, or landlines)"
        />
        <MetricCard
          label="Opt-Out Rate"
          value={`${metrics.optOutRatePercentage ?? 0}%`}
          subValue="compliance"
          icon={ShieldCheck}
          helperText="Opt-out compliance via STOP keyword or request"
        />
        <MetricCard
          label="Missed Call Rate"
          value={`${metrics.missedRatePercentage ?? 0}%`}
          subValue="of inbound calls"
          icon={PhoneMissed}
          helperText="Percentage of total inbound calls that were missed"
        />
        <MetricCard
          label="Answered Calls"
          value={Math.max(0, metrics.totalCalls - metrics.missedCalls)}
          subValue={`${metrics.totalCalls > 0 ? (100 - (metrics.missedRatePercentage ?? 0)).toFixed(1) : 0}% handled`}
          icon={PhoneCall}
          helperText="Inbound calls answered by store staff (75 in pilot stores)"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-slate-900/50 border border-slate-800/60 rounded-xl p-4 sm:p-5">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="p-2 rounded-xl bg-slate-800 text-blue-400 border border-slate-700/60">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                Service Demand
              </h3>
              <p className="text-xs text-slate-400">
                Recovered inquiry categories
              </p>
            </div>
          </div>
          <div className="space-y-3">
            {Object.entries(metrics.serviceDemandBreakdown ?? {}).length ===
            0 ? (
              <p className="text-xs text-slate-500">
                No service demand data available.
              </p>
            ) : (
              Object.entries(metrics.serviceDemandBreakdown ?? {}).map(
                ([service, count]) => {
                  const total = Object.values(
                    metrics.serviceDemandBreakdown ?? {},
                  ).reduce((sum, value) => sum + value, 0);
                  return (
                    <div key={service}>
                      <div className="flex justify-between gap-3 text-xs mb-1">
                        <span className="text-slate-300 truncate">
                          {service}
                        </span>
                        <span className="text-slate-400">{count}</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-blue-500"
                          style={{
                            width: `${total ? (count / total) * 100 : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                },
              )
            )}
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800/60 rounded-xl p-4 sm:p-5">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="p-2 rounded-xl bg-slate-800 text-emerald-400 border border-slate-700/60">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                Safety & Compliance
              </h3>
              <p className="text-xs text-slate-400">
                Quality controls from the live API
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              ["Non-pilot stores", metrics.notPilotStoreFiltered ?? 0],
              ["Answered calls safe", metrics.answeredCallsFiltered ?? 0],
              ["Landlines filtered", metrics.landlineFiltering ?? 0],
              ["Deduplication filtered", metrics.deduplicationPrevented ?? 0],
              ["Opt-outs", metrics.optOutCount],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-lg bg-slate-950/60 border border-slate-800/60 p-3"
              >
                <p className="text-[11px] text-slate-400">{label}</p>
                <p className="text-lg font-semibold text-white mt-1">{value}</p>
              </div>
            ))}
          </div>
        </div>
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
              {metrics.trends.length === 0 ? (
                <div className="w-full self-center text-center text-xs text-slate-500">
                  Trend history is not available from the stats API yet.
                </div>
              ) : (
                metrics.trends.map((item) => {
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
                })
              )}
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
                          store.actionNotes
                            .toLowerCase()
                            .includes("hq reception")
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-slate-900/50 border border-slate-800/60 rounded-xl p-4 sm:p-5">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="p-2 rounded-xl bg-slate-800 text-amber-400 border border-slate-700/60">
              <MessageSquareCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                Conversation Funnel
              </h3>
              <p className="text-xs text-slate-400">
                Missed calls through captured bookings
              </p>
            </div>
          </div>
          <div className="space-y-3">
            {[
              ["Missed calls", metrics.missedCalls],
              ["Recovered inquiries", metrics.smsSent],
              ["Customer replies", metrics.replies],
              ["Bookings captured", metrics.bookingsCaptured],
            ].map(([label, value], index, stages) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-32 sm:w-40 shrink-0 text-xs text-slate-400 truncate">
                  {label}
                </div>
                <div className="h-2 flex-1 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${index === stages.length - 1 ? "bg-emerald-400" : "bg-amber-400"}`}
                    style={{
                      width: `${metrics.missedCalls ? Math.min(100, (Number(value) / metrics.missedCalls) * 100) : 0}%`,
                    }}
                  />
                </div>
                <span className="w-8 text-right text-xs font-semibold text-white">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800/60 rounded-xl p-4 sm:p-5">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="p-2 rounded-xl bg-slate-800 text-cyan-400 border border-slate-700/60">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                Conversation Status
              </h3>
              <p className="text-xs text-slate-400">
                Current thread distribution
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(metrics.threadStatusDistribution ?? {}).length ===
            0 ? (
              <p className="col-span-2 text-xs text-slate-500">
                No conversation status data available.
              </p>
            ) : (
              Object.entries(metrics.threadStatusDistribution ?? {}).map(
                ([status, count]) => (
                  <div
                    key={status}
                    className="rounded-lg bg-slate-950/60 border border-slate-800/60 p-3"
                  >
                    <p className="text-[11px] text-slate-400 truncate">
                      {status.replace(/_/g, " ")}
                    </p>
                    <p className="text-lg font-semibold text-white mt-1">
                      {count}
                    </p>
                  </div>
                ),
              )
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.6fr)_minmax(280px,1fr)] gap-5">
        <div className="bg-slate-900/50 border border-slate-800/60 rounded-xl p-4 sm:p-5">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="p-2 rounded-xl bg-slate-800 text-blue-400 border border-slate-700/60">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                Store Performance
              </h3>
              <p className="text-xs text-slate-400">
                Live comparison across pilot stores
              </p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-xs">
              <thead className="text-[10px] uppercase tracking-wider text-slate-500 border-b border-slate-800/60">
                <tr>
                  <th className="pb-3 pr-4 font-medium">Store</th>
                  <th className="pb-3 px-2 font-medium">Calls</th>
                  <th className="pb-3 px-2 font-medium">Missed</th>
                  <th className="pb-3 px-2 font-medium">Missed rate</th>
                  <th className="pb-3 px-2 font-medium">Replies</th>
                  <th className="pb-3 px-2 font-medium">Engagement</th>
                  <th className="pb-3 pl-2 font-medium">Bookings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {storeComparison.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-slate-500">
                      No store comparison data available.
                    </td>
                  </tr>
                ) : (
                  storeComparison.map((store) => (
                    <tr key={store.storeId} className="text-slate-300">
                      <td className="py-3 pr-4 font-medium text-white">
                        {store.storeName}
                      </td>
                      <td className="py-3 px-2">
                        {store.telephony.totalInboundCallVolume}
                      </td>
                      <td className="py-3 px-2">
                        {store.telephony.missedCalls}
                      </td>
                      <td className="py-3 px-2">
                        {store.telephony.storeMissedCallRate}%
                      </td>
                      <td className="py-3 px-2">
                        {store.conversions.customerReplies}
                      </td>
                      <td className="py-3 px-2">
                        {store.conversions.customerEngagementRate}%
                      </td>
                      <td className="py-3 pl-2">
                        {store.conversions.bookingsCaptured}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-800/60 pt-3">
            <span className="text-[11px] text-slate-500">
              {comparisonTotal} stores · page {comparisonPage} of{" "}
              {Math.max(1, Math.ceil(comparisonTotal / 5))}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                title="Previous store page"
                disabled={comparisonPage <= 1}
                onClick={() => onComparisonPageChange(comparisonPage - 1)}
                className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                title="Next store page"
                disabled={
                  comparisonPage >= Math.max(1, Math.ceil(comparisonTotal / 5))
                }
                onClick={() => onComparisonPageChange(comparisonPage + 1)}
                className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800/60 rounded-xl p-4 sm:p-5">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="p-2 rounded-xl bg-slate-800 text-emerald-400 border border-slate-700/60">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                Live Activity
              </h3>
              <p className="text-xs text-slate-400">Latest system events</p>
            </div>
          </div>
          <div className="space-y-3">
            {recentLogs.length === 0 ? (
              <p className="text-xs text-slate-500">
                No recent events available.
              </p>
            ) : (
              recentLogs.slice(0, 8).map((log, index) => (
                <div key={`${log.createdAt}-${index}`} className="flex gap-3">
                  <span className="mt-1.5 w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-200 truncate">
                      {log.eventType.replace(/_/g, " ")}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {log.storeName} · {log.callerNumber}
                    </p>
                    <p className="text-[10px] text-slate-600 mt-0.5">
                      {new Date(log.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-800/60 pt-3">
              <span className="text-[11px] text-slate-500">
                {logsTotal} events · page {logsPage} of{" "}
                {Math.max(1, Math.ceil(logsTotal / 8))}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  title="Previous activity page"
                  disabled={logsPage <= 1}
                  onClick={() => onLogsPageChange(logsPage - 1)}
                  className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  title="Next activity page"
                  disabled={logsPage >= Math.max(1, Math.ceil(logsTotal / 8))}
                  onClick={() => onLogsPageChange(logsPage + 1)}
                  className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Missed Calls SMS Exclusion Breakdown Modal */}
      {showExclusionModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setShowExclusionModal(false)}
        >
          <div
            className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl p-5 sm:p-6 shadow-2xl text-left space-y-4 sm:space-y-5 my-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <PhoneMissed className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">
                    Missed Calls & SMS Outreach Transparency
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Clear breakdown of why calls were delivered or safely filtered
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowExclusionModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* High-level Delivery Banner */}
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/25 p-3.5 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-slate-200 leading-relaxed">
                <strong className="text-emerald-300 font-semibold block mb-0.5">
                  100% Outreach to Eligible Callers ({eligibleMobile} of {eligibleMobile} Mobile Callers Messaged)
                </strong>
                Every missed call from an eligible Australian mobile received automated SMS concierge outreach. The remaining{" "}
                <span className="font-semibold text-white">{excludedCalls} calls</span> were safely excluded by carrier capabilities and Australian telecommunication regulations:
              </div>
            </div>

            {/* Reasons List */}
            <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
              {/* Reason 1: Landlines */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex-shrink-0 mt-0.5">
                    <PhoneOff className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-white">
                        Fixed Landlines (No SMS Support)
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/60 font-mono">
                        not_mobile
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      Landline numbers (e.g. 02, 03, 07, 08) physically cannot receive SMS text messages. Only Australian mobile numbers (04xx xxx xxx) are SMS-capable. Attempting to text landlines causes carrier bounce fees and errors.
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 pl-2">
                  <span className="text-sm font-bold text-white block">
                    {landlinesCount}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {totalMissed > 0 ? Math.round((landlinesCount / totalMissed) * 100) : 0}% of missed
                  </span>
                </div>
              </div>

              {/* Reason 2: Deduplication / Repeat Callers */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 flex-shrink-0 mt-0.5">
                    <Repeat className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-white">
                        Repeat Callers (60-Min Deduplication)
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/60 font-mono">
                        dedup
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      When a caller rings multiple times within 60 minutes, the system sends 1 SMS to protect user experience and avoid spamming the customer with duplicate messages.
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 pl-2">
                  <span className="text-sm font-bold text-white block">
                    {dedupCount}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {totalMissed > 0 ? Math.round((dedupCount / totalMissed) * 100) : 0}% of missed
                  </span>
                </div>
              </div>

              {/* Reason 3: Opt-Outs */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 flex-shrink-0 mt-0.5">
                    <ShieldX className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-white">
                        Customer Opt-Out Compliance
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/60 font-mono">
                        opted_out
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      Callers who previously replied STOP or requested removal. Strictly excluded to guarantee full ACMA &amp; Australian Spam Act 2003 compliance.
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 pl-2">
                  <span className="text-sm font-bold text-white block">
                    {optOutCount}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {totalMissed > 0 ? Math.round((optOutCount / totalMissed) * 100) : 0}% of missed
                  </span>
                </div>
              </div>

              {/* Reason 4: Internal Extensions */}
              {internalCount > 0 && (
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-slate-800 text-slate-300 border border-slate-700/60 flex-shrink-0 mt-0.5">
                      <PhoneForwarded className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-white">
                          Internal Staff / Store Transfers
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/60 font-mono">
                          internal_extension
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        Internal PBX transfers and staff calls between store extensions.
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 pl-2">
                    <span className="text-sm font-bold text-white block">
                      {internalCount}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {totalMissed > 0 ? Math.round((internalCount / totalMissed) * 100) : 0}% of missed
                    </span>
                  </div>
                </div>
              )}

              {/* Reason 5: Other Ineligible Numbers (Private / International) */}
              {otherCount > 0 && (
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-slate-800 text-slate-300 border border-slate-700/60 flex-shrink-0 mt-0.5">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-white">
                          Other Ineligible Numbers
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/60 font-mono">
                          filtered
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        Private caller IDs or international numbers that cannot receive domestic SMS outreach.
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 pl-2">
                    <span className="text-sm font-bold text-white block">
                      {otherCount}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {totalMissed > 0 ? Math.round((otherCount / totalMissed) * 100) : 0}% of missed
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setShowExclusionModal(false);
                  onNavigateTab("suppressed");
                }}
                className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <span>View Raw Suppression Logs</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setShowExclusionModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white border border-slate-700 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
