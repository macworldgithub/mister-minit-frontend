import React, { useState } from "react";
import type { StoreConfig } from "../../types";
import { StoreEditModal } from "./StoreEditModal";
import {
  Store,
  Plus,
  Edit2,
  Trash2,
  MapPin,
  Clock,
  ExternalLink,
  Users,
  CheckCircle2,
  XCircle,
  RefreshCw,
  AlertTriangle,
  X,
  Phone,
  Link2,
} from "lucide-react";

interface StoresViewProps {
  stores: StoreConfig[];
  isLoading?: boolean;
  onSaveStore: (storeData: Omit<StoreConfig, "_id">) => Promise<void> | void;
  onToggleActive: (
    did: string,
    currentActive?: boolean,
  ) => Promise<void> | void;
  onDeleteStore?: (did: string) => Promise<void> | void;
  onRefresh?: () => Promise<any> | any;
}

/** Inline delete-confirmation modal */
const DeleteConfirmModal: React.FC<{
  isOpen: boolean;
  storeName: string;
  storeDid: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ isOpen, storeName, storeDid, isDeleting, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-[fadeScaleIn_0.2s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center">
              <AlertTriangle className="w-4.5 h-4.5 text-red-400" />
            </div>
            <h3 className="text-sm font-bold text-white">Delete Store Config</h3>
          </div>
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 pb-4">
          <p className="text-xs text-slate-300 leading-relaxed mb-3">
            Are you sure you want to permanently delete this store configuration?
            This action cannot be undone.
          </p>
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-red-400 flex-shrink-0">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">{storeName}</p>
              <p className="text-[11px] font-mono text-slate-400">DID: {storeDid}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 flex items-center justify-end gap-2.5">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer border border-slate-700/60 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-red-900/30 disabled:opacity-60"
          >
            {isDeleting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Deleting…
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" /> Delete Store
              </>
            )}
          </button>
        </div>
      </div>

      {/* Keyframe animation (injected once) */}
      <style>{`
        @keyframes fadeScaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export const StoresView: React.FC<StoresViewProps> = ({
  stores,
  isLoading = false,
  onSaveStore,
  onToggleActive,
  onDeleteStore,
  onRefresh,
}) => {
  const [editingStore, setEditingStore] = useState<StoreConfig | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Delete confirmation modal state
  const [deleteTarget, setDeleteTarget] = useState<StoreConfig | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleManualRefresh = async () => {
    if (onRefresh) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
  };

  const handleEdit = (store: StoreConfig) => {
    setEditingStore(store);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingStore(null);
    setIsModalOpen(true);
  };

  const handleSave = async (data: Omit<StoreConfig, "_id">) => {
    await onSaveStore(data);
    setIsModalOpen(false);
  };

  const handleDelete = async (did: string) => {
    if (onDeleteStore) {
      await onDeleteStore(did);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget || !onDeleteStore) return;
    setIsDeleting(true);
    try {
      await onDeleteStore(deleteTarget.did);
      setDeleteTarget(null);
    } catch {
      // keep modal open on error so user can retry
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="text-base font-bold text-white">
              Pilot Store Directory ({stores.length})
            </h3>
            {onRefresh && (
              <button
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                title="Refresh Store Configs (GET /store-config)"
                className="p-1.5 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-blue-400" : ""}`}
                />
              </button>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Stores participating in the automated 3CX missed-call SMS concierge
            pilot program
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-lg shadow-blue-900/30 cursor-pointer w-fit"
        >
          <Plus className="w-4 h-4" /> Add Pilot Store
        </button>
      </div>

      {/* Loading State */}
      {(isLoading || isRefreshing) && stores.length === 0 && (
        <div className="bg-slate-900/50 border border-slate-800/60 rounded-xl p-12 text-center">
          <RefreshCw className="w-10 h-10 text-blue-400 mx-auto mb-3 animate-spin" />
          <h4 className="text-sm font-bold text-white mb-1">
            Loading Store Configurations...
          </h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Fetching latest pilot stores from database (GET /store-config)
          </p>
        </div>
      )}

      {/* Empty State when stores list is empty and not loading */}
      {!isLoading && !isRefreshing && stores.length === 0 && (
        <div className="bg-slate-900/50 border border-slate-800/60 rounded-xl p-12 text-center">
          <Store className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-white mb-1">
            No Store Configs Found
          </h4>
          <p className="text-xs text-slate-400 mb-4 max-w-md mx-auto">
            No pilot store configurations found. Click below to add a new pilot
            store with DID.
          </p>
          <button
            onClick={handleAdd}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add First Pilot Store
          </button>
        </div>
      )}

      {/* Stores Grid */}
      {stores.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {stores.map((store) => (
            <div
              key={store.did}
              className="bg-slate-900/50 border border-slate-800/60 rounded-xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Store Card Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-center text-blue-400">
                      <Store className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white tracking-tight">
                        {store.storeName}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-mono font-medium text-blue-400 bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.2 rounded">
                          DID: {store.did}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(store)}
                      className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                      title="Edit Store Config (PATCH)"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {onDeleteStore && (
                      <button
                        onClick={() => setDeleteTarget(store)}
                        className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-700 hover:text-red-400 text-slate-400 transition-colors cursor-pointer"
                        title="Delete Store Config (DELETE)"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start gap-2 text-xs text-slate-300 mb-2.5">
                  <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                  <span className="leading-snug">{store.address}</span>
                </div>

                {/* Hours */}
                <div className="flex items-start gap-2 text-xs text-slate-400 mb-3 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
                  <Clock className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                  <span className="leading-snug text-[11px]">
                    {store.tradingHours}
                  </span>
                </div>

                {/* Routing & Contact Details */}
                {(store.contactPhoneNumber || store.actionNotes || store.bookingLink) && (
                  <div className="mb-3 bg-slate-950/40 rounded-xl p-2.5 border border-slate-800/50 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      {store.actionNotes && (
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${
                            store.actionNotes.toLowerCase().includes("hq reception")
                              ? "bg-amber-500/10 text-amber-300 border-amber-500/20"
                              : "bg-purple-500/10 text-purple-300 border-purple-500/20"
                          }`}
                        >
                          {store.actionNotes}
                        </span>
                      )}

                      {store.contactPhoneNumber && (
                        <div className="flex items-center gap-1 text-slate-300 font-mono text-[11px]">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{store.contactPhoneNumber}</span>
                        </div>
                      )}
                    </div>

                    {store.bookingLink && (
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 truncate">
                        <Link2 className="w-3 h-3 text-slate-500 flex-shrink-0" />
                        <a
                          href={store.bookingLink}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:text-blue-400 underline truncate transition-colors"
                          title={store.bookingLink}
                        >
                          {store.bookingLink}
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* Staff Contacts */}
                {store.staffContacts && store.staffContacts.length > 0 && (
                  <div className="mb-4">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1.5 flex items-center gap-1">
                      <Users className="w-3 h-3" /> Designated Staff Contacts:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {store.staffContacts.map((contact, idx) => (
                        <div
                          key={idx}
                          className="text-[11px] bg-slate-950/60 border border-slate-800/60 px-2.5 py-1 rounded-lg text-slate-300 flex items-center gap-1.5"
                        >
                          <span className="font-medium text-white">
                            {contact.name}
                          </span>
                          <span className="text-slate-400 font-mono">
                            ({contact.mobile})
                          </span>
                          {contact.email && (
                            <span className="text-slate-500 text-[10px] hidden sm:inline">
                              · {contact.email}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Bar: Status Toggle & Map */}
              <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onToggleActive(store.did, store.isActive)}
                    className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border transition-all cursor-pointer ${store.isActive
                      ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25"
                      : "bg-slate-800/60 text-slate-400 border-slate-700/60 hover:bg-slate-700/60"
                      }`}
                  >
                    {store.isActive ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />{" "}
                        Pilot Active
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5 text-slate-500" />{" "}
                        Inactive
                      </>
                    )}
                  </button>
                  <span className="text-[11px] text-slate-500">
                    {store.isActive
                      ? "Concierge SMS enabled"
                      : "Calls will be suppressed"}
                  </span>
                </div>

                {store.googleMapsLink && (
                  <a
                    href={store.googleMapsLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium"
                  >
                    Map Link <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <StoreEditModal
        isOpen={isModalOpen}
        store={editingStore}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        onDelete={handleDelete}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        storeName={deleteTarget?.storeName ?? ""}
        storeDid={deleteTarget?.did ?? ""}
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          if (!isDeleting) setDeleteTarget(null);
        }}
      />
    </div>
  );
};
