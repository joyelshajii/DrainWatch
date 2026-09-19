import React, { useState } from 'react';
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
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="sticky top-0 shrink-0 w-full z-40 bg-white/90 backdrop-blur-md text-slate-700 text-sm border-b border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
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
              <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200/80 shrink-0">
                <MapPin className="w-4 h-4" />
              </span>
              <span className="font-bold text-slate-900 text-sm sm:text-base tracking-tight">LSGD Kerala</span>
              <span className="text-slate-300 font-normal">/</span>
              <span className="text-slate-600 font-medium hidden sm:inline text-sm">Kochi Municipal Corporation</span>
            </span>
            <span className="hidden lg:inline text-slate-300">|</span>
            <span className="hidden xl:inline text-slate-500 text-xs sm:text-sm font-medium">
              Canal &amp; Storm-Drain Redressal Grid
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
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfileMenu(false);
                onNotificationsClick?.();
              }}
              className="relative p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Civic Alerts"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                3
              </span>
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-slate-200 shadow-lg p-3 z-50 animate-in fade-in duration-150">
                <div className="flex items-center justify-between px-2 py-1.5 border-b border-slate-100 mb-2">
                  <span className="font-bold text-slate-900 text-xs sm:text-sm">Civic Escalations</span>
                  <span className="text-[11px] font-medium text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">3 Breached SLA</span>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="p-2 rounded-xl hover:bg-slate-50 transition-colors">
                    <p className="font-semibold text-slate-900">Ward 48 &bull; Thevara-Perandoor</p>
                    <p className="text-slate-500 text-[11px]">Culvert choke at SCB Road &bull; 48h SLA elapsed</p>
                  </div>
                  <div className="p-2 rounded-xl hover:bg-slate-50 transition-colors">
                    <p className="font-semibold text-slate-900">Ward 66 &bull; Mullassery Canal</p>
                    <p className="text-slate-500 text-[11px]">Severe plastic blockage near South Rly Stn</p>
                  </div>
                  <div className="p-2 rounded-xl hover:bg-slate-50 transition-colors">
                    <p className="font-semibold text-slate-900">Ward 60 &bull; Calvathy Canal</p>
                    <p className="text-slate-500 text-[11px]">Silt barrier throttled outflow to harbor</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Pill with Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowProfileMenu(!showProfileMenu);
                setShowNotifications(false);
                onProfileClick?.();
              }}
              className="flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-full bg-slate-100/80 hover:bg-slate-200/80 border border-slate-200/90 text-slate-800 text-xs sm:text-sm transition-all cursor-pointer"
            >
              <div className="w-7 h-7 rounded-full bg-sky-600 text-white font-bold text-xs flex items-center justify-center font-sans shadow-xs">
                KM
              </div>
              <span className="hidden sm:inline font-sans text-xs sm:text-sm text-slate-800 font-semibold">Control Cell</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-slate-200 shadow-lg p-3 z-50 animate-in fade-in duration-150">
                <div className="px-2 py-1.5 border-b border-slate-100 mb-2">
                  <p className="font-bold text-slate-900 text-xs sm:text-sm">Kochi Corporation Control Cell</p>
                  <p className="text-slate-500 text-[11px]">LSGD Engineering &amp; Disaster Wing</p>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="p-2 rounded-xl bg-slate-50">
                    <span className="text-slate-400 block text-[10px] font-mono uppercase">Jurisdiction</span>
                    <span className="font-semibold text-slate-800">12 Wards &bull; Division IV</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50">
                    <span className="text-slate-400 block text-[10px] font-mono uppercase">Hotline Direct</span>
                    <span className="font-mono font-bold text-emerald-700">1800-425-4000</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

