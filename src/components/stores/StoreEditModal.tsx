import React, { useState } from "react";
import type { StoreConfig, StaffContact } from "../../types";
import { X, Plus, Trash2, Store } from "lucide-react";

interface StoreEditModalProps {
  isOpen: boolean;
  store: StoreConfig | null; // null if creating
  onClose: () => void;
  onSave: (payload: Omit<StoreConfig, "_id">) => void;
  onDelete?: (did: string) => void;
}

const StoreFormContent: React.FC<{
  store: StoreConfig | null;
  onClose: () => void;
  onSave: (payload: Omit<StoreConfig, "_id">) => void;
  onDelete?: (did: string) => void;
}> = ({ store, onClose, onSave, onDelete }) => {
  const [storeName, setStoreName] = useState(store?.storeName || "");
  const [did, setDid] = useState(store?.did || "");
  const [address, setAddress] = useState(store?.address || "");
  const [tradingHours, setTradingHours] = useState(
    store?.tradingHours ||
      "Mon-Fri 9:00am–5:30pm, Sat 9:00am–5:00pm, Sun: Closed",
  );
  const [googleMapsLink, setGoogleMapsLink] = useState(
    store?.googleMapsLink || "",
  );
  const [contactPhoneNumber, setContactPhoneNumber] = useState(
    store?.contactPhoneNumber || "",
  );
  const [actionNotes, setActionNotes] = useState<string>(
    store?.actionNotes || "Direct to Mobile Van",
  );
  const [bookingLink, setBookingLink] = useState(store?.bookingLink || "");
  const [isActive, setIsActive] = useState(store ? store.isActive : true);
  const [staffContacts, setStaffContacts] = useState<StaffContact[]>(
    store?.staffContacts && store.staffContacts.length > 0
      ? store.staffContacts
      : [{ name: "", mobile: "", email: "" }],
  );

  const handleAddContact = () => {
    setStaffContacts([...staffContacts, { name: "", mobile: "", email: "" }]);
  };

  const handleRemoveContact = (index: number) => {
    setStaffContacts(staffContacts.filter((_, i) => i !== index));
  };

  const handleContactChange = (
    index: number,
    field: keyof StaffContact,
    value: string,
  ) => {
    const updated = [...staffContacts];
    updated[index] = { ...updated[index], [field]: value };
    setStaffContacts(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName || !did || !address) return;

    const cleanedContacts = staffContacts
      .filter((c) => c.name.trim() && c.mobile.trim())
      .map((c) => ({
        name: c.name.trim(),
        mobile: c.mobile.trim(),
        email: c.email ? c.email.trim() : "",
      }));

    onSave({
      storeName: storeName.trim(),
      did: did.trim(),
      address: address.trim(),
      tradingHours: tradingHours.trim(),
      googleMapsLink: googleMapsLink.trim(),
      contactPhoneNumber: contactPhoneNumber.trim(),
      actionNotes: actionNotes.trim(),
      bookingLink: bookingLink.trim(),
      isActive,
      staffContacts: cleanedContacts,
    });
  };

  return (
    <div className="w-full max-w-2xl bg-slate-900/95 border border-slate-800/60 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
      <div className="p-5 border-b border-slate-800/60 flex items-center justify-between bg-slate-950/60">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-500/12 text-blue-400 border border-blue-500/20">
            <Store className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              {store ? `Edit ${store.storeName}` : "Add New Pilot Store"}
            </h3>
            <p className="text-xs text-slate-400">
              Configure 3CX DID, trading hours, and staff notification contacts
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-xl bg-slate-800/60 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="p-6 space-y-4 max-h-[78vh] overflow-y-auto"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Store Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Marion Westfield"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full bg-slate-950/60 border border-slate-800/60 focus:border-blue-500/60 rounded-xl px-3 py-2 text-xs text-white outline-none transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              3CX DID (Store Dial-No) *
            </label>
            <input
              type="text"
              required
              disabled={!!store}
              placeholder="e.g. 0872286100"
              value={did}
              onChange={(e) => setDid(e.target.value)}
              className="w-full bg-slate-950/60 border border-slate-800/60 focus:border-blue-500/60 rounded-xl px-3 py-2 text-xs text-white outline-none disabled:opacity-60 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">
            Physical Address *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Kiosk 204 Westfield, 297 Diagonal Rd, Oaklands Park SA 5046"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full bg-slate-950/60 border border-slate-800/60 focus:border-blue-500/60 rounded-xl px-3 py-2 text-xs text-white outline-none transition-colors"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">
            Trading Hours *
          </label>
          <textarea
            required
            rows={2}
            placeholder="e.g. Mon-Wed & Fri 9:00am–5:30pm, Thu 9:00am–9:00pm, Sat 9:00am–5:00pm"
            value={tradingHours}
            onChange={(e) => setTradingHours(e.target.value)}
            className="w-full bg-slate-950/60 border border-slate-800/60 focus:border-blue-500/60 rounded-xl px-3 py-2 text-xs text-white outline-none transition-colors"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">
            Google Maps Link
          </label>
          <input
            type="url"
            placeholder="https://maps.google.com/?q=..."
            value={googleMapsLink}
            onChange={(e) => setGoogleMapsLink(e.target.value)}
            className="w-full bg-slate-950/60 border border-slate-800/60 focus:border-blue-500/60 rounded-xl px-3 py-2 text-xs text-white outline-none transition-colors"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Contact Phone Number
            </label>
            <input
              type="text"
              placeholder="e.g. 0423 707 295"
              value={contactPhoneNumber}
              onChange={(e) => setContactPhoneNumber(e.target.value)}
              className="w-full bg-slate-950/60 border border-slate-800/60 focus:border-blue-500/60 rounded-xl px-3 py-2 text-xs text-white outline-none transition-colors font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Action Notes
            </label>
            <select
              value={actionNotes}
              onChange={(e) => setActionNotes(e.target.value)}
              className="w-full bg-slate-950/60 border border-slate-800/60 focus:border-blue-500/60 rounded-xl px-3 py-2 text-xs text-white outline-none transition-colors cursor-pointer"
            >
              <option value="Direct to Mobile Van">Direct to Mobile Van</option>
              <option value="Direct to HQ Reception">
                Direct to HQ Reception
              </option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">
            Booking Link
          </label>
          <input
            type="url"
            placeholder="e.g. https://misterminit.co/pages/car-keys"
            value={bookingLink}
            onChange={(e) => setBookingLink(e.target.value)}
            className="w-full bg-slate-950/60 border border-slate-800/60 focus:border-blue-500/60 rounded-xl px-3 py-2 text-xs text-white outline-none transition-colors"
          />
        </div>

        {/* Active Pilot Switch */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-white block">
              Active Pilot Status
            </span>
            <span className="text-[11px] text-slate-400">
              When active, missed calls to this store DID will trigger automated
              SMS concierge.
            </span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>

        {/* Staff Contacts */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-300">
              Staff Notification Contacts
            </label>
            <button
              type="button"
              onClick={handleAddContact}
              className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Staff Member
            </button>
          </div>

          <div className="space-y-2">
            {staffContacts.map((contact, i) => (
              <div
                key={i}
                className="flex items-center gap-2 bg-slate-950/60 p-2 rounded-xl border border-slate-800/60"
              >
                <input
                  type="text"
                  placeholder="Name"
                  value={contact.name}
                  onChange={(e) =>
                    handleContactChange(i, "name", e.target.value)
                  }
                  className="flex-1 bg-slate-900/50 border border-slate-800/60 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none"
                />
                <input
                  type="text"
                  placeholder="Mobile"
                  value={contact.mobile}
                  onChange={(e) =>
                    handleContactChange(i, "mobile", e.target.value)
                  }
                  className="w-36 bg-slate-900/50 border border-slate-800/60 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none font-mono"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={contact.email}
                  onChange={(e) =>
                    handleContactChange(i, "email", e.target.value)
                  }
                  className="flex-1 bg-slate-900/50 border border-slate-800/60 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveContact(i)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-slate-800/60 flex items-center justify-between gap-3">
          <div>
            {store && onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (
                    window.confirm(
                      `Are you sure you want to delete store "${store.storeName}" (${store.did})?`,
                    )
                  ) {
                    onDelete(store.did);
                    onClose();
                  }
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-red-500/40 text-slate-400 hover:text-red-400 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Store</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800/60 text-slate-300 hover:bg-slate-700 text-xs font-semibold cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors cursor-pointer shadow-lg shadow-blue-900/30"
            >
              {store ? "Update Store" : "Create Store"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export const StoreEditModal: React.FC<StoreEditModalProps> = ({
  isOpen,
  store,
  onClose,
  onSave,
  onDelete,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <StoreFormContent
        key={store?.did || "new-store"}
        store={store}
        onClose={onClose}
        onSave={onSave}
        onDelete={onDelete}
      />
    </div>
  );
};
