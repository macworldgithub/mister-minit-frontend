import { useState, useEffect, useCallback, useRef } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import type { NavTab } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { OverviewView } from './components/dashboard/OverviewView';
import { ConversationsView } from './components/conversations/ConversationsView';
import { ThreadDrawer } from './components/conversations/ThreadDrawer';
import { StoresView } from './components/stores/StoresView';
import { CdrView } from './components/cdr/CdrView';
import { SuppressedView } from './components/suppressed/SuppressedView';

import { storeConfigService } from './services/storeConfigService';
import { smsThreadService } from './services/smsThreadService';
import { cdrService } from './services/cdrService';
import { suppressedService } from './services/suppressedService';
import { dashboardService } from './services/dashboardService';

import type {
  StoreConfig,
  SmsThread,
  CdrRecord,
  SuppressedEvent,
  OptOutRecord,
  DashboardMetrics,
  ThreadStatus,
  TimeRangeFilter,
} from './types';
import { ThreadStatus as StatusEnum } from './types';
import './App.css';

export function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('overview');
  const [selectedStoreId, setSelectedStoreId] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<TimeRangeFilter>('7d');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Core Dynamic Data State
  const [stores, setStores] = useState<StoreConfig[]>([]);
  const [isStoresLoading, setIsStoresLoading] = useState<boolean>(false);
  const [threads, setThreads] = useState<SmsThread[]>([]);
  const [cdrs, setCdrs] = useState<CdrRecord[]>([]);
  const [suppressedEvents, setSuppressedEvents] = useState<SuppressedEvent[]>([]);
  const [optOutRecords, setOptOutRecords] = useState<OptOutRecord[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);

  // Active View Modals/Drawers
  const [activeThread, setActiveThread] = useState<SmsThread | null>(null);

  // Filters within views
  const [threadStatusFilter, setThreadStatusFilter] = useState<string>('all');
  const [threadSearchQuery, setThreadSearchQuery] = useState<string>('');
  const [cdrMissedOnly, setCdrMissedOnly] = useState<boolean>(false);
  const [cdrSearchQuery, setCdrSearchQuery] = useState<string>('');
  const [suppressedReasonFilter, setSuppressedReasonFilter] = useState<string>('all');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const isFetchingStoresRef = useRef(false);

  // Load stores specifically (GET /store-config)
  const loadStores = useCallback(async () => {
    if (isFetchingStoresRef.current) return;
    isFetchingStoresRef.current = true;
    setIsStoresLoading(true);
    try {
      const fetchedStores = await storeConfigService.getStores();
      setStores(fetchedStores);
    } catch (err) {
      console.error('Failed to load stores from /store-config:', err);
      showToast('Error loading store configs');
    } finally {
      setIsStoresLoading(false);
      isFetchingStoresRef.current = false;
    }
  }, []);

  // Load all dynamic data based on active filters
  const loadData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [
        threadsResult,
        cdrsResult,
        suppressedResult,
        optoutsResult,
        metricsResult,
      ] = await Promise.allSettled([
        smsThreadService.getThreads({
          storeId: selectedStoreId,
          status: threadStatusFilter,
          search: threadSearchQuery,
        }),
        cdrService.getCdrRecords({
          did: selectedStoreId,
          missedOnly: cdrMissedOnly,
          search: cdrSearchQuery,
        }),
        suppressedService.getSuppressedEvents({
          storeId: selectedStoreId,
          reason: suppressedReasonFilter,
        }),
        suppressedService.getOptOutRecords(),
        dashboardService.getMetrics({
          storeId: selectedStoreId,
          timeRange,
        }),
      ]);
      if (threadsResult.status === 'fulfilled') {
        setThreads(threadsResult.value);
        setActiveThread((curr) => {
          if (!curr) return null;
          return threadsResult.value.find((t) => t._id === curr._id) || curr;
        });
      }
      if (cdrsResult.status === 'fulfilled') {
        setCdrs(cdrsResult.value);
      }
      if (suppressedResult.status === 'fulfilled') {
        setSuppressedEvents(suppressedResult.value);
      }
      if (optoutsResult.status === 'fulfilled') {
        setOptOutRecords(optoutsResult.value);
      }
      if (metricsResult.status === 'fulfilled') {
        setMetrics(metricsResult.value);
      }
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [
    selectedStoreId,
    threadStatusFilter,
    threadSearchQuery,
    cdrMissedOnly,
    cdrSearchQuery,
    suppressedReasonFilter,
    timeRange,
  ]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // When switching to the stores tab, immediately re-fetch store configurations from GET /store-config
  useEffect(() => {
    if (currentTab === 'stores') {
      void loadStores();
    }
  }, [currentTab, loadStores]);

  // Thread Status Updates
  const handleUpdateThreadStatus = async (threadId: string, status: ThreadStatus) => {
    try {
      const updated = await smsThreadService.updateThreadStatus(threadId, status);
      setThreads((prev) => prev.map((t) => (t._id === threadId ? updated : t)));
      setActiveThread((curr) => (curr?._id === threadId ? updated : curr));
      showToast(`Thread status updated to: ${status.replace(/_/g, ' ')}`);
      // Update metrics dynamically
      const newMetrics = await dashboardService.getMetrics({ storeId: selectedStoreId, timeRange });
      setMetrics(newMetrics);
    } catch (err) {
      console.error('Status update failed:', err);
      showToast('Failed to update thread status');
    }
  };

  // Concierge manual message sender
  const handleSendMessage = async (threadId: string, content: string) => {
    try {
      const updated = await smsThreadService.appendMessage(threadId, content, 'assistant');
      setThreads((prev) => prev.map((t) => (t._id === threadId ? updated : t)));
      setActiveThread((curr) => (curr?._id === threadId ? updated : curr));
      showToast('SMS reply sent to customer');
    } catch (err) {
      console.error('Send message failed:', err);
      showToast('Failed to send SMS reply');
    }
  };

  // Store Configuration Actions
  const handleSaveStore = async (storeData: Omit<StoreConfig, '_id'>) => {
    try {
      const existing = stores.find((s) => s.did === storeData.did);
      if (existing) {
        const updated = await storeConfigService.updateStore(storeData.did, storeData);
        setStores((prev) => prev.map((s) => (s.did === updated.did ? updated : s)));
        showToast(`Store "${updated.storeName}" updated successfully`);
      } else {
        const created = await storeConfigService.createStore(storeData);
        setStores((prev) => [created, ...prev]);
        showToast(`Store "${created.storeName}" added to pilot program`);
      }
      void loadStores();
    } catch (err) {
      console.error('Store save failed:', err);
      showToast('Failed to save store configuration');
    }
  };

  const handleToggleStoreActive = async (did: string, currentActive?: boolean) => {
    try {
      const updated = await storeConfigService.toggleStoreActive(did, currentActive);
      setStores((prev) => prev.map((s) => (s.did === did ? updated : s)));
      showToast(`Store "${updated.storeName}" pilot status is now: ${updated.isActive ? 'Active' : 'Disabled'}`);
      void loadStores();
    } catch (err) {
      console.error('Store toggle failed:', err);
      showToast('Failed to toggle store pilot status');
    }
  };

  const handleDeleteStore = async (did: string) => {
    try {
      await storeConfigService.deleteStore(did);
      setStores((prev) => prev.filter((s) => s.did !== did));
      showToast(`Store with DID ${did} removed from pilot configuration`);
      void loadStores();
    } catch (err) {
      console.error('Store delete failed:', err);
      showToast('Failed to delete store configuration');
    }
  };

  // Opt-out removal
  const handleRemoveOptOut = async (callerNumber: string) => {
    try {
      await suppressedService.removeOptOut(callerNumber);
      setOptOutRecords((prev) => prev.filter((o) => o.callerNumber !== callerNumber));
      showToast(`Unsubscribed restriction removed for ${callerNumber}`);
    } catch (err) {
      console.error('Opt-out removal failed:', err);
      showToast('Failed to remove opt-out');
    }
  };

  const titles: Record<NavTab, { title: string; subtitle: string }> = {
    overview: {
      title: 'Mister Minit Operations Overview',
      subtitle: 'Real-time telemetry, 3CX PBX missed-call recovery, and AI concierge bookings',
    },
    conversations: {
      title: 'SMS Concierge Conversations',
      subtitle: 'Customer text dialogues initiated from missed store phone calls',
    },
    stores: {
      title: 'Pilot Store Configurations',
      subtitle: 'Manage store profiles, 3CX DIDs, trading hours, and staff escalation contacts',
    },
    cdr: {
      title: '3CX Telephony Call Detail Records',
      subtitle: 'Raw telephony ingestion feed from 3CX PBX system',
    },
    suppressed: {
      title: 'Suppression Audit & Opt-Out Registry',
      subtitle: 'Audit trail of suppressed SMS triggers and customer unsubscribe list',
    },
  };

  return (
    <div className="flex h-screen w-full bg-[#090d16] text-slate-100 overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        unreadCount={threads.filter((t) => t.status === StatusEnum.BOOKING_REQUESTED).length}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Sticky Header */}
        <Header
          title={titles[currentTab].title}
          subtitle={titles[currentTab].subtitle}
          stores={stores}
          selectedStoreId={selectedStoreId}
          onSelectStore={setSelectedStoreId}
          timeRange={timeRange}
          onSelectTimeRange={setTimeRange}
          onRefresh={loadData}
          isRefreshing={isRefreshing}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />

        {/* Scrollable View Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {currentTab === 'overview' && metrics && (
              <OverviewView
                metrics={metrics}
                recentThreads={threads}
                stores={stores}
                onSelectThread={setActiveThread}
                onNavigateTab={setCurrentTab}
              />
            )}

            {currentTab === 'conversations' && (
              <ConversationsView
                threads={threads}
                onSelectThread={setActiveThread}
                onUpdateStatus={handleUpdateThreadStatus}
                statusFilter={threadStatusFilter}
                onStatusFilterChange={setThreadStatusFilter}
                searchQuery={threadSearchQuery}
                onSearchChange={setThreadSearchQuery}
              />
            )}

            {currentTab === 'stores' && (
              <StoresView
                stores={stores}
                isLoading={isStoresLoading}
                onSaveStore={handleSaveStore}
                onToggleActive={handleToggleStoreActive}
                onDeleteStore={handleDeleteStore}
                onRefresh={loadStores}
              />
            )}

            {currentTab === 'cdr' && (
              <CdrView
                cdrs={cdrs}
                missedOnly={cdrMissedOnly}
                onToggleMissedOnly={setCdrMissedOnly}
                searchQuery={cdrSearchQuery}
                onSearchChange={setCdrSearchQuery}
              />
            )}

            {currentTab === 'suppressed' && (
              <SuppressedView
                suppressedEvents={suppressedEvents}
                optOutRecords={optOutRecords}
                onRemoveOptOut={handleRemoveOptOut}
                reasonFilter={suppressedReasonFilter}
                onReasonFilterChange={setSuppressedReasonFilter}
              />
            )}
          </div>
        </main>
      </div>

      {/* Live Conversation Drawer */}
      <ThreadDrawer
        thread={activeThread}
        onClose={() => setActiveThread(null)}
        onUpdateStatus={handleUpdateThreadStatus}
        onSendMessage={handleSendMessage}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/95 border border-slate-800/60 text-white px-4 py-2.5 rounded-xl shadow-2xl text-xs font-medium flex items-center gap-2 animate-fade-in-up backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

export default App;
