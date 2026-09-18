import React from 'react';
import {
  LayoutDashboard,
  Map,
  FilePlus,
  Activity,
  Users,
  Trophy,
  BarChart2,
  PhoneCall,
  Layers,
  UserCheck,
  Settings,
  Leaf,
  X,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
  onEmergencyClick?: () => void;
  onAdminClick?: (section: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpen,
  onClose,
  onEmergencyClick,
  onAdminClick,
}) => {
  const mainNavItems = [
    { id: 'map', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'map_only', label: 'Open-Report Map', icon: Map },
    { id: 'report', label: 'File Report', icon: FilePlus },
    { id: 'track', label: 'Track & Escalate', icon: Activity },
    { id: 'official', label: 'Officer Triage', icon: Users },
    { id: 'leaderboard', label: 'Civic Champions', icon: Trophy },
    { id: 'insights', label: 'Reports & Insights', icon: BarChart2 },
    { id: 'emergency', label: 'Emergency 24x7', icon: PhoneCall },
  ];

  const adminNavItems = [
    { id: 'admin_wards', label: 'Ward Management', icon: Layers },
    { id: 'admin_users', label: 'User Management', icon: UserCheck },
    { id: 'admin_settings', label: 'Settings', icon: Settings },
  ];

  const handleItemClick = (id: string) => {
    if (id === 'map_only') {
      onSelectTab('map');
    } else if (id === 'emergency') {
      if (onEmergencyClick) onEmergencyClick();
      else window.location.href = 'tel:18004254000';
    } else if (id === 'insights' || id.startsWith('admin_')) {
      if (onAdminClick) onAdminClick(id);
    } else {
      onSelectTab(id);
    }
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
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={() => handleItemClick('map')}
          >
            <div className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-white shadow-2xs">
              <svg className="w-5 h-5 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-slate-950 block leading-none">
                DrainWatch
              </span>
              <p className="text-[10px] text-slate-500 font-medium leading-none mt-1">
                Ward Identification &bull; Escalation Engine
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

        {/* Scrollable Navigation Body */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {/* Main Navigation */}
          <nav className="space-y-1">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                (item.id === 'map' && currentTab === 'map') ||
                (item.id === currentTab);

              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-xs rounded-xl font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-sky-50 text-sky-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Admin Navigation */}
          <div className="space-y-1 pt-2">
            <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono block">
              Admin
            </span>
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className="w-full flex items-center gap-3 px-3 py-2 text-xs rounded-xl font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all cursor-pointer"
                >
                  <Icon className="w-4 h-4 text-slate-400" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Civic Banner */}
        <div className="p-3 border-t border-slate-100">
          <div className="rounded-xl p-3 bg-gradient-to-br from-emerald-50 to-teal-50/60 border border-emerald-100/80 flex items-center gap-2.5 relative overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Leaf className="w-4 h-4" />
            </div>
            <div>
              <strong className="text-xs font-semibold text-emerald-950 block leading-tight">
                Cleaner Kochi
              </strong>
              <span className="text-[10px] text-emerald-700 font-medium">
                Greener Tomorrow
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
