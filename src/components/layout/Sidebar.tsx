import React from "react";
import {
  LayoutDashboard,
  MessageSquareText,
  Store,
  PhoneCall,
  ShieldAlert,
  X,
} from "lucide-react";

export type NavTab =
  | "overview"
  | "conversations"
  | "stores"
  | "cdr"
  | "suppressed";

interface SidebarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  unreadCount?: number;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  unreadCount = 3,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const navItems: Array<{
    id: NavTab;
    label: string;
    icon: React.ElementType;
    badge?: number;
  }> = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    {
      id: "conversations",
      label: "SMS Concierge",
      icon: MessageSquareText,
      badge: unreadCount,
    },
    { id: "stores", label: "Store Configs", icon: Store },
    { id: "cdr", label: "3CX Call Logs", icon: PhoneCall },
    { id: "suppressed", label: "Suppression & Opt-outs", icon: ShieldAlert },
  ];

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-64 bg-slate-900/95 lg:bg-slate-900/50 backdrop-blur-md border-r border-slate-800/60 flex flex-col flex-shrink-0 min-h-screen transition-transform duration-300 ease-in-out ${
          isOpenMobile ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-900/30 text-white font-bold text-lg tracking-wider border border-blue-500/30">
              MM
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-semibold text-white text-base tracking-tight leading-none">
                  Mister Minit
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Pilot
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                SMS Concierge System
              </p>
            </div>
          </div>

          {/* Close button on mobile */}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1.5 flex-1">
          <div className="px-3 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Main Modules
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer text-left ${
                  isActive
                    ? "bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-sm"
                    : "text-slate-300 hover:bg-slate-800/60 hover:text-white border border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${isActive ? "text-blue-400" : "text-slate-400"}`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && item.badge > 0 ? (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      isActive
                        ? "bg-blue-500 text-white"
                        : "bg-slate-800 text-slate-300"
                    }`}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        {/* Backend Mode Status Card */}
        {/* <div className="p-4 m-3 rounded-xl bg-slate-950/60 border border-slate-800/60">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Server className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs font-medium text-slate-300">
                Backend API
              </span>
            </div>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full border bg-slate-800 text-slate-300 border-slate-700">
              {API_CONFIG.useMock ? "Mock Mode" : "Connected"}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            {API_CONFIG.useMock
              ? "Dynamic in-memory state modeled after NestJS schemas."
              : `Live endpoints target: ${API_CONFIG.baseURL}`}
          </p>
          <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center gap-1.5 text-[10px] text-slate-400">
            <Zap className="w-3 h-3 text-blue-400" />
            <span>Telephony: 3CX PBX Ingestion</span>
          </div>
        </div> */}
      </aside>
    </>
  );
};
