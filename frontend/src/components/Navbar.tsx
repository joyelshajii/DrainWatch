import React from 'react';
import {
  Menu,
  MapPin,
  Bell,
  ChevronDown,
} from 'lucide-react';

interface NavbarProps {
  onToggleSidebar?: () => void;
  onNotificationsClick?: () => void;
  onProfileClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleSidebar,
  onNotificationsClick,
  onProfileClick,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#090d16]/95 backdrop-blur-md text-slate-300 text-xs border-b border-slate-800/80 shadow-[0_1px_3px_rgba(0,0,0,0.15)]">
      <div className="w-full px-5 sm:px-7 py-3 flex items-center justify-between gap-4">
        {/* Left Section: Mobile Menu + LSGD Municipal Tag */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 cursor-pointer transition-colors"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 truncate">
            <span className="inline-flex items-center gap-1.5 font-medium text-slate-200">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="font-semibold text-white tracking-tight">LSGD Kerala</span>
              <span className="text-slate-600 font-mono">|</span>
              <span className="text-slate-300 hidden sm:inline text-xs">Kochi Municipal Corporation</span>
            </span>
            <span className="hidden md:inline text-slate-700">|</span>
            <span className="hidden xl:inline text-slate-400 text-[11px] font-mono">
              SC-08: Canal &amp; Storm-Drain Redressal Grid
            </span>
          </div>
        </div>

        {/* Right Section: Engine Status, Hotline, Notifications, Profile */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0 font-mono text-[11px]">
          {/* GIS PIP Engine Status */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/40 border border-emerald-800/40 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              GIS PIP ENGINE:{' '}
              <strong className="text-emerald-400 font-semibold font-mono">ACTIVE</strong>
            </span>
          </div>

          {/* Hotline */}
          <div className="hidden md:flex items-center gap-1 text-slate-400">
            <span>Control Room:</span>
            <a
              href="tel:18004254000"
              className="text-slate-200 hover:text-white font-semibold underline decoration-slate-600 underline-offset-2 transition-colors"
            >
              1800-425-4000
            </a>
          </div>

          <div className="h-4 w-px bg-slate-800 hidden sm:block" />

          {/* Notification Bell with Badge */}
          <button
            type="button"
            onClick={onNotificationsClick}
            className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
            title="3 New Civic Escalation Alerts"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-rose-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              3
            </span>
          </button>

          {/* User Profile Pill */}
          <button
            type="button"
            onClick={onProfileClick}
            className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-slate-200 text-xs transition-colors cursor-pointer"
          >
            <div className="w-6 h-6 rounded-full bg-sky-600 text-white font-bold text-[10px] flex items-center justify-center font-sans">
              KM
            </div>
            <span className="hidden sm:inline font-sans text-xs text-slate-300 font-medium">Control Cell</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </div>
    </header>
  );
};

