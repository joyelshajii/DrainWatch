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

  // Navigation items matching reference screenshot with restrained 3 status colors
  const navItems = [
    {
      id: 'map',
      label: 'Open-Report Map',
      icon: Map,
      badge: activeCount > 0 ? `${activeCount} Live` : 'Map',
      badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
    },
    {
      id: 'report',
      label: 'File Report',
      icon: PlusCircle,
      badge: 'AI Detect',
      badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
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
      badge: escalatedCount > 0 ? `${escalatedCount} Escalated` : null,
      badgeColor: 'bg-rose-50 text-rose-800 border-rose-200 font-semibold',
    },
    {
      id: 'leaderboard',
      label: 'Civic Champions',
      icon: Trophy,
      badge: 'Points',
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
    },
  ];

  const handleTabClick = (id: string) => {
    onSelectTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Precision Operational Header Bar */}
      <div className="bg-[#090d16] text-slate-300 text-[11px] py-1 px-4 border-b border-slate-900">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 font-medium text-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>LSGD Kerala &bull; Kochi Municipal Corporation</span>
            </span>
            <span className="hidden sm:inline text-slate-700">|</span>
            <span className="hidden sm:inline text-slate-400">
              SC-08: Canal &amp; Storm-Drain Blockage Spatial Redressal System
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
            <span className="flex items-center gap-1.5">
              <Activity className="w-3 h-3 text-emerald-400" />
              <span>GIS PIP ENGINE: <span className="text-emerald-400 font-medium">ACTIVE</span></span>
            </span>
            <span className="hidden md:inline">
              Control Room: <strong className="text-slate-200 font-mono">1800-425-4000</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
        {/* Brand */}
        <div
          className="flex items-center gap-3 cursor-pointer select-none"
          onClick={() => handleTabClick('map')}
        >
          <div className="w-9 h-9 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-white shadow-2xs">
            <svg className="w-5 h-5 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-slate-950">
                DrainWatch
              </span>
              <span className="text-[10px] font-semibold tracking-wider px-1.5 py-0.2 rounded bg-sky-50 text-sky-800 border border-sky-200 font-mono">
                SC-08 KOCHI
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-normal leading-none mt-0.5">
              Ward Identification &bull; Escalation Engine
            </p>
          </div>
        </div>

        {/* Center: Navigation (Desktop) */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-50/80 p-1 rounded-xl border border-slate-200">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white text-slate-950 shadow-2xs border border-slate-200 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 text-[10px] rounded-full border ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Actions (Desktop) */}
        <div className="hidden lg:flex items-center gap-3">
          <button
            onClick={() => handleTabClick('report')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-950 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-slate-500" />
            <span>Report Blockage</span>
          </button>

          <a
            href="tel:18004254000"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900"
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
            className="bg-slate-900 text-white text-xs font-semibold py-1.5 px-3 rounded-lg"
          >
            <span>+ Report</span>
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg"
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
                className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition-colors ${
                  isActive
                    ? 'bg-slate-100 text-slate-950 font-bold border border-slate-200'
                    : 'text-slate-600 hover:bg-slate-50 font-medium'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`px-1.5 py-0.5 text-[10px] rounded-full border ${item.badgeColor}`}
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
