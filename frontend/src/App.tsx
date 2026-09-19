import { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { WardMap } from './components/WardMap';
import { ReportForm } from './components/ReportForm';
import { TicketTracker } from './components/TicketTracker';
import { OfficerPortal } from './components/OfficerPortal';
import { Leaderboard } from './components/Leaderboard';
import type { Report } from './types';

export function App() {
  const [currentTab, setCurrentTab] = useState<'map' | 'report' | 'track' | 'official' | 'leaderboard'>('map');
  const [selectedTicketId, setSelectedTicketId] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const mainContentRef = useRef<HTMLElement>(null);

  // Read URL query parameters on initial mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ticket = params.get('ticket');
    const tab = params.get('tab');

    if (ticket) {
      setSelectedTicketId(ticket);
      setCurrentTab('track');
    } else if (tab && ['map', 'report', 'track', 'official', 'leaderboard'].includes(tab)) {
      setCurrentTab(tab as any);
    }
  }, []);

  const scrollToTop = () => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSelectTab = (tab: string) => {
    setCurrentTab(tab as any);
    setSidebarOpen(false);
    scrollToTop();
  };

  const handleSelectTicketFromMap = (id: string) => {
    setSelectedTicketId(id);
    setCurrentTab('track');
    window.history.replaceState(null, '', `?ticket=${encodeURIComponent(id)}`);
    scrollToTop();
  };

  const handleReportSubmitted = (report: Report) => {
    setSelectedTicketId(report.id);
    setCurrentTab('track');
    scrollToTop();
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-slate-50 text-slate-900 font-sans antialiased">
      {/* Left Sidebar - permanently fixed on lg+, drawer on mobile */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Right Column: Top Header + Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Top Header - pinned at top */}
        <Navbar onToggleSidebar={() => setSidebarOpen(true)} />

        {/* Scrollable Main Content Area */}
        <main
          ref={mainContentRef}
          className="flex-1 overflow-y-auto overflow-x-hidden px-4 sm:px-8 py-6 sm:py-7 focus:outline-none"
          tabIndex={-1}
        >
          <div className="max-w-7xl mx-auto">
            {currentTab === 'map' && (
              <WardMap
                onSelectTicket={handleSelectTicketFromMap}
                onNavigateToReport={() => handleSelectTab('report')}
              />
            )}

            {currentTab === 'report' && (
              <ReportForm onReportSubmitted={handleReportSubmitted} />
            )}

            {currentTab === 'track' && (
              <TicketTracker initialTicketId={selectedTicketId} />
            )}

            {currentTab === 'official' && (
              <OfficerPortal onSelectTicket={handleSelectTicketFromMap} />
            )}

            {currentTab === 'leaderboard' && (
              <Leaderboard />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
