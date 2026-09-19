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
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md text-slate-700 text-sm border-b border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
      <div className="w-full px-5 sm:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Left Section: Mobile Menu + LSGD Municipal Tag */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer transition-colors"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 truncate">
            <span className="inline-flex items-center gap-2 font-medium text-slate-800">
              <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
                <MapPin className="w-4 h-4" />
              </span>
              <span className="font-semibold text-slate-900 text-sm sm:text-base tracking-tight">LSGD Kerala</span>
              <span className="text-slate-300 font-normal">/</span>
              <span className="text-slate-600 font-medium hidden sm:inline text-xs sm:text-sm">Kochi Municipal Corporation</span>
            </span>
            <span className="hidden lg:inline text-slate-300">|</span>
            <span className="hidden xl:inline text-slate-500 text-xs font-mono font-medium">
              SC-08: Canal &amp; Storm-Drain Redressal Grid
            </span>
          </div>
        </div>

        {/* Right Section: Engine Status, Hotline, Notifications, Profile */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0 text-xs sm:text-sm">
          {/* GIS PIP Engine Status */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 font-medium text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>GIS PIP Engine: <strong className="font-bold text-emerald-900">Active</strong></span>
          </div>

          {/* Hotline */}
          <div className="hidden md:flex items-center gap-1.5 text-slate-500 text-xs sm:text-sm">
            <span>Control Room:</span>
            <a
              href="tel:18004254000"
              className="text-slate-900 hover:text-sky-600 font-semibold font-mono underline decoration-slate-300 underline-offset-2 transition-colors"
            >
              1800-425-4000
            </a>
          </div>

          <div className="h-5 w-px bg-slate-200 hidden sm:block" />

          {/* Notification Bell with Badge */}
          <button
            type="button"
            onClick={onNotificationsClick}
            className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            title="3 New Civic Escalation Alerts"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
              3
            </span>
          </button>

          {/* User Profile Pill */}
          <button
            type="button"
            onClick={onProfileClick}
            className="flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-full bg-slate-100/80 hover:bg-slate-200/80 border border-slate-200/90 text-slate-800 text-xs sm:text-sm transition-all cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-sky-600 text-white font-bold text-xs flex items-center justify-center font-sans shadow-xs">
              KM
            </div>
            <span className="hidden sm:inline font-sans text-xs sm:text-sm text-slate-800 font-semibold">Control Cell</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          </button>
        </div>
      </div>
    </header>
  );
};

