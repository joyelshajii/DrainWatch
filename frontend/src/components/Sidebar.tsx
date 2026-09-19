import React from 'react';
import {
  LayoutDashboard,
  FilePlus,
  Activity,
  Users,
  Trophy,
  Leaf,
  X,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpen,
  onClose,
}) => {
  const navItems = [
    { id: 'map', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'report', label: 'File Report', icon: FilePlus },
    { id: 'track', label: 'Track & Escalate', icon: Activity },
    { id: 'official', label: 'Officer Triage', icon: Users },
    { id: 'leaderboard', label: 'Civic Champions', icon: Trophy },
  ];

  const handleItemClick = (id: string) => {
    onSelectTab(id);
    onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 left-0 bottom-0 h-full w-64 shrink-0 bg-white border-r border-slate-200/90 flex flex-col justify-between z-50 transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer select-none group"
            onClick={() => handleItemClick('map')}
          >
            {/* Custom Modern Civic DrainWatch Emblem (Donezo Style: Emerald circular ripple/water flow emblem) */}
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-600 transition-all duration-200 group-hover:bg-emerald-100/80 group-hover:scale-105 shadow-xs">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                {/* Clean outer droplet/basin contour */}
                <path d="M12 3a9 9 0 0 0-9 9c0 4.97 4.03 9 9 9s9-4.03 9-9a9 9 0 0 0-9-9z" />
                {/* Concentric inner water/canal ring */}
                <path d="M12 7a5 5 0 0 0-5 5c0 2.76 2.24 5 5 5s5-2.24 5-5a5 5 0 0 0-5-5z" />
                {/* Central monitoring flow core */}
                <circle cx="12" cy="12" r="1.5" fill="currentColor" />
              </svg>
            </div>
            <div>
              <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 block leading-tight font-sans">
                DrainWatch
              </span>
              <p className="text-xs text-slate-500 font-medium leading-none mt-1">
                Kochi Municipal Corporation
              </p>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
          <div>
            <span className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono block mb-2">
              Platform Views
            </span>
            <nav className="space-y-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.id === currentTab;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-3 text-sm rounded-xl font-medium transition-all cursor-pointer ${
                      isActive
                        ? 'bg-slate-900 text-white font-semibold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                    {isActive && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Bottom Civic Banner */}
        <div className="p-4 border-t border-slate-100">
          <div className="rounded-xl p-3.5 bg-gradient-to-br from-emerald-50/90 to-teal-50/50 border border-emerald-100/90 flex items-center gap-3 relative overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <strong className="text-sm font-semibold text-emerald-950 block leading-tight">
                Cleaner Kochi
              </strong>
              <span className="text-xs text-emerald-700 font-medium">
                Greener Tomorrow
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
