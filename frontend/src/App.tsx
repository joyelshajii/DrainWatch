import { useState, useEffect } from 'react';
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

  const handleSelectTab = (tab: string) => {
    setCurrentTab(tab as any);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectTicketFromMap = (id: string) => {
    setSelectedTicketId(id);
    setCurrentTab('track');
    window.history.replaceState(null, '', `?ticket=${encodeURIComponent(id)}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReportSubmitted = (report: Report) => {
    setSelectedTicketId(report.id);
    setCurrentTab('track');
  };

  return (
    <div className="min-h-screen flex flex-row bg-slate-50 text-slate-900 font-sans antialiased">
      {/* Left Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Right: Top Header + Main Content */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        {/* Top Operational Header */}
        <Navbar onToggleSidebar={() => setSidebarOpen(true)} />

        {/* Page Content */}
        <main className="flex-1 px-5 sm:px-8 py-7 overflow-y-auto">
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
