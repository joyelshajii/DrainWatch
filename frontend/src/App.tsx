import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { WardMap } from './components/WardMap';
import { ReportForm } from './components/ReportForm';
import { TicketTracker } from './components/TicketTracker';
import { OfficerPortal } from './components/OfficerPortal';
import { Leaderboard } from './components/Leaderboard';
import { fetchStats } from './api';
import type { Stats, Report } from './types';

export function App() {
  const [currentTab, setCurrentTab] = useState<'map' | 'report' | 'track' | 'official' | 'leaderboard'>('map');
  const [selectedTicketId, setSelectedTicketId] = useState<string>('');
  const [stats, setStats] = useState<Stats | null>(null);

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

    // Fetch initial stats
    fetchStats()
      .then(setStats)
      .catch((err) => console.error('Error loading initial stats:', err));
  }, []);

  const handleSelectTab = (tab: string) => {
    setCurrentTab(tab as any);
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
    fetchStats().then(setStats).catch(() => {});
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased">
      {/* Top Civic Navigation */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        activeCount={stats?.active_blockages || 0}
        escalatedCount={stats?.escalated_count || 0}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
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
      </main>
    </div>
  );
}

export default App;
