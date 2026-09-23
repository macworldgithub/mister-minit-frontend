import React, { useState } from "react";
import type { SmsThread, ThreadStatus } from "../../types";
import { ThreadStatus as StatusEnum } from "../../types";
import {
  X,
  CalendarCheck,
  Phone,
  Store,
  ShieldAlert,
  User,
  Bot,
} from "lucide-react";

interface ThreadDrawerProps {
  thread: SmsThread | null;
  onClose: () => void;
  onUpdateStatus: (threadId: string, status: ThreadStatus) => void;
  onSendMessage: (threadId: string, content: string) => void;
}

export const ThreadDrawer: React.FC<ThreadDrawerProps> = ({
  thread,
  onClose,
  onUpdateStatus,
  onSendMessage,
}) => {
  const [replyText, setReplyText] = useState("");

  if (!thread) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    onSendMessage(thread._id, replyText.trim());
    setReplyText("");
  };

  const getStatusColor = (status: ThreadStatus) => {
    switch (status) {
      case StatusEnum.BOOKING_REQUESTED:
        return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
      case StatusEnum.ACTIVE:
        return "bg-slate-800 text-slate-200 border-slate-700/80";
      case StatusEnum.CLOSED_VISITED:
        return "bg-slate-800/80 text-slate-300 border-slate-700/60";
      case StatusEnum.CLOSED_OPTED_OUT:
        return "bg-slate-900 text-slate-500 border-slate-800";
      default:
        return "bg-slate-800/60 text-slate-300 border-slate-700/60";
    }
  };

  const formatTimestamp = (isoString?: string | null) => {
    if (!isoString) return "—";
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-all duration-300">
      <div className="w-full max-w-xl bg-slate-900/95 border-l border-slate-800/60 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-800/60 flex items-center justify-between bg-slate-950/60">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="text-base font-bold text-white tracking-tight">
                {thread.callerNumber}
              </span>
              <span
                className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${getStatusColor(
                  thread.status,
                )}`}
              >
                {thread.status.replace(/_/g, " ")}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Store className="w-3 h-3 text-blue-400" />{" "}
                {thread.storeName || "Store"}
              </span>
              <span className="flex items-center gap-1 font-mono">
                <Phone className="w-3 h-3 text-slate-400" /> DID: {thread.did}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Booking Card Banner (if captured) */}
        {thread.bookingCaptured && thread.bookingDetails && (
          <div className="m-4 p-4 rounded-xl bg-slate-950/80 border border-emerald-500/30 text-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400">
                <CalendarCheck className="w-4 h-4 text-emerald-400" />
                Customer Booking Captured
              </span>
              <span className="text-[11px] bg-emerald-500/15 text-emerald-300 px-2 py-0.5 rounded-lg font-semibold border border-emerald-500/20">
                Lead Ready
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">
                  Customer:
                </span>
                <span className="font-semibold text-white">
                  {thread.bookingDetails.customerName || "Anonymous"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">
                  Preferred Time:
                </span>
                <span className="font-semibold text-white">
                  {thread.bookingDetails.preferredTime || "Anytime"}
                </span>
              </div>
              <div className="col-span-2 pt-1 border-t border-slate-800/60">
                <span className="text-slate-400 block text-[10px] uppercase">
                  Service Required:
                </span>
                <span className="font-medium text-slate-100">
                  {thread.bookingDetails.serviceType}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Opt-Out Alert Banner */}
        {thread.optedOut && (
          <div className="m-4 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-400 flex items-center gap-2.5 text-xs">
            <ShieldAlert className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>
              Customer opted out via keyword:{" "}
              <strong className="text-slate-200">
                {thread.optOutKeyword || "STOP"}
              </strong>
              . Automated messaging is suppressed.
            </span>
          </div>
        )}

        {/* Status Actions Bar */}
        <div className="px-5 py-2.5 bg-slate-950/40 border-b border-slate-800/60 flex items-center justify-between text-xs">
          <span className="text-slate-400 font-medium">
            Update Thread Status:
          </span>
          <select
            value={thread.status}
            onChange={(e) =>
              onUpdateStatus(thread._id, e.target.value as ThreadStatus)
            }
            className="bg-slate-800/60 border border-slate-700/60 text-slate-200 text-xs rounded-xl px-2.5 py-1 outline-none cursor-pointer"
          >
            <option value={StatusEnum.ACTIVE}>Active</option>
            <option value={StatusEnum.BOOKING_REQUESTED}>
              Booking Requested
            </option>
            <option value={StatusEnum.SMS_SENT}>SMS Sent</option>
            <option value={StatusEnum.CLOSED_VISITED}>
              Closed — Customer Visited
            </option>
            <option value={StatusEnum.CLOSED_ANSWERED}>
              Closed — Phone Answered
            </option>
            {/* <option value={StatusEnum.CLOSED_NO_RESPONSE}>
              Closed — No Response
            </option> */}
            {/* <option value={StatusEnum.CLOSED_OPTED_OUT}>
              Closed — Opted Out
            </option> */}
          </select>
        </div>

        {/* Conversation Transcript Stream */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="text-center">
            <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-500 bg-slate-950/60 px-2.5 py-1 rounded-full border border-slate-800/60">
              Missed Call Event Triggered SMS (
              {formatTimestamp(thread.createdAt)})
            </span>
          </div>

          {thread.conversationHistory.map((msg, index) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={index}
                className={`flex flex-col ${isUser ? "items-end" : "items-start"} max-w-[85%] ${
                  isUser ? "ml-auto" : "mr-auto"
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1 px-1">
                  {isUser ? (
                    <>
                      <span className="text-[10px] text-slate-400">
                        {formatTimestamp(msg.sentAt)}
                      </span>
                      <span className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                        Customer <User className="w-3 h-3 text-blue-400" />
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-xs font-semibold text-blue-400 flex items-center gap-1">
                        <Bot className="w-3 h-3 text-blue-400" /> Mister Minit
                        Concierge
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {formatTimestamp(msg.sentAt)}
                      </span>
                    </>
                  )}
                </div>

                <div
                  className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                    isUser
                      ? "bg-blue-600 text-white rounded-tr-sm shadow-md"
                      : "bg-slate-800/60 text-slate-100 rounded-tl-sm border border-slate-700/50"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            );
          })}
        </div>

        {/* Message Input Bar (Concierge Reply Simulation) */}
        <form
          onSubmit={handleSend}
          className="p-4 bg-slate-950/80 border-t border-slate-800/60 flex items-center gap-2"
        >
          {/* <input
            type="text"
            placeholder={
              thread.optedOut
                ? "Cannot reply: customer has opted out"
                : "Type a reply as Mister Minit Concierge..."
            }
            disabled={thread.optedOut}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            className="flex-1 bg-slate-900/50 border border-slate-800/60 focus:border-blue-500/60 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 outline-none transition-colors disabled:opacity-40"
          /> */}
          {/* <button
            type="submit"
            disabled={thread.optedOut || !replyText.trim()}
            className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-all disabled:opacity-40 cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button> */}
        </form>
      </div>
    </div>
  );
};
