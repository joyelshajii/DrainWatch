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
        className={`fixed lg:static top-0 left-0 bottom-0 w-64 bg-white border-r border-slate-200/90 flex flex-col justify-between z-50 transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-100/80 flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer select-none group"
            onClick={() => handleItemClick('map')}
          >
            <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800/90 flex items-center justify-center text-white shadow-sm transition-transform duration-200 group-hover:scale-105">
              <svg className="w-5 h-5 text-sky-400 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <div>
              <span className="text-[15px] font-bold tracking-tight text-slate-950 block leading-tight">
                DrainWatch
              </span>
              <p className="text-[10px] text-slate-400 font-medium leading-none mt-0.5">
                Kochi Municipal Corp &bull; SC-08
              </p>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
          <div>
            <span className="px-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider font-mono block mb-1.5">
              Platform Views
            </span>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.id === currentTab;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 text-xs rounded-xl font-medium transition-all cursor-pointer ${
                      isActive
                        ? 'bg-slate-900 text-white font-semibold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Bottom Civic Banner */}
        <div className="p-3 border-t border-slate-100/80">
          <div className="rounded-xl p-3 bg-gradient-to-br from-emerald-50/80 to-teal-50/40 border border-emerald-100/80 flex items-center gap-3 relative overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Leaf className="w-4 h-4" />
            </div>
            <div>
              <strong className="text-xs font-semibold text-emerald-950 block leading-tight">
                Cleaner Kochi
              </strong>
              <span className="text-[10px] text-emerald-600 font-medium">
                Greener Tomorrow
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
