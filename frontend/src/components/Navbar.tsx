import React, { useState } from 'react';
import {
  Map,
  PlusCircle,
  Search,
  ShieldCheck,
  Menu,
  X,
  PhoneCall,
  Activity,
  Trophy,
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  activeCount: number;
  escalatedCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  activeCount,
  escalatedCount,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    {
      id: 'map',
      label: 'Open-Report Map',
      icon: Map,
      badge: activeCount > 0 ? `${activeCount} Live` : null,
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300 font-semibold',
    },
    {
      id: 'report',
      label: 'File Report',
      icon: PlusCircle,
      badge: 'AI Detect',
      badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold',
    },
    {
      id: 'track',
      label: 'Track & Escalate',
      icon: Search,
      badge: null,
      badgeColor: '',
    },
    {
      id: 'official',
      label: 'Officer Triage',
      icon: ShieldCheck,
      badge: escalatedCount > 0 ? `${escalatedCount} ESCALATED` : null,
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-300 font-bold animate-pulse',
    },
    {
      id: 'leaderboard',
      label: 'Civic Champions',
      icon: Trophy,
      badge: 'Points',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    },
  ];

  const handleTabClick = (id: string) => {
    onSelectTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Precision Operational Header Bar */}
      <div className="bg-[#0b1329] text-slate-300 text-[11px] py-1 px-4 border-b border-slate-900">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 font-medium text-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>LSGD Kerala &bull; Kochi Municipal Corporation</span>
            </span>
            <span className="hidden sm:inline text-slate-600">|</span>
            <span className="hidden sm:inline text-slate-400">
              SC-08: Canal &amp; Storm-Drain Blockage Spatial Redressal System
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
            <span className="flex items-center gap-1.5">
              <Activity className="w-3 h-3 text-sky-400" />
              <span>GIS PIP ENGINE: <span className="text-emerald-400 font-semibold">ACTIVE</span></span>
            </span>
            <span className="hidden md:inline">
              Control Room: <strong className="text-slate-100">1800-425-4080</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
        {/* Brand */}
        <div
          className="flex items-center gap-3 cursor-pointer select-none group"
          onClick={() => handleTabClick('map')}
        >
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 flex items-center justify-center text-white shadow-xs group-hover:border-sky-500 transition-colors">
            <svg className="w-5 h-5 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-slate-950 group-hover:text-sky-700 transition-colors">
                DrainWatch
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-sm bg-sky-50 text-sky-700 border border-sky-200">
                SC-08 Kochi
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium leading-none mt-0.5">
              Ward Identification &bull; Escalation Engine
            </p>
          </div>
        </div>

        {/* Center: Tactile Segmented Navigation (Desktop) */}
        <nav className="hidden md:flex items-center bg-slate-100/90 p-1 rounded-lg border border-slate-200">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 border border-transparent font-medium'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`ml-1 px-1.5 py-0.5 text-[10px] rounded-xs border ${
                      item.badgeColor || 'bg-slate-200 text-slate-700 border-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Actions (Desktop) */}
        <div className="hidden lg:flex items-center gap-2.5">
          {currentTab !== 'report' && (
            <button
              onClick={() => handleTabClick('report')}
              className="btn-primary text-xs shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Report Blockage</span>
            </button>
          )}

          <a
            href="tel:18004254080"
            className="btn-secondary text-xs text-slate-700 hover:text-slate-900"
            title="Kochi Municipal Monsoon Helpline"
          >
            <PhoneCall className="w-3.5 h-3.5 text-slate-400" />
            <span>Emergency 24x7</span>
          </a>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => handleTabClick('report')}
            className="btn-primary text-xs py-1.5 px-3"
          >
            <span>+ Report</span>
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-slate-600 hover:text-slate-900 border border-slate-200 rounded-md"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1 shadow-md">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-md transition-colors ${
                  isActive
                    ? 'bg-slate-100 text-slate-900 font-bold border border-slate-200'
                    : 'text-slate-600 hover:bg-slate-50 font-medium'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`px-1.5 py-0.5 text-[10px] rounded-xs border ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
