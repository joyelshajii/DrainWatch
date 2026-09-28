import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  MapPin,
  Bell,
  ChevronDown,
  CloudRain,
  Phone,
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
  const [language, setLanguage] = useState<'en' | 'ml'>(() => {
    return (localStorage.getItem('drainwatch_lang') as 'en' | 'ml') || 'en';
  });
  const navRef = useRef<HTMLDivElement>(null);

  const handleLanguageChange = (lang: 'en' | 'ml') => {
    setLanguage(lang);
    localStorage.setItem('drainwatch_lang', lang);
  };

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 shrink-0 w-full z-40 bg-white/95 backdrop-blur-md text-slate-700 text-sm border-b border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
      <div ref={navRef} className="w-full px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
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
              <span className="font-bold text-slate-900 text-sm sm:text-base tracking-tight">
                {language === 'ml' ? 'തദ്ദേശ സ്വയംഭരണ വകുപ്പ്' : 'LSGD Kerala'}
              </span>
              <span className="text-slate-300 font-normal">/</span>
              <span className="text-slate-600 font-medium hidden sm:inline text-sm">
                {language === 'ml' ? 'കൊച്ചി കോർപ്പറേഷൻ' : 'Kochi Municipal Corporation'}
              </span>
            </span>
            <span className="hidden lg:inline text-slate-300">|</span>
            <span className="hidden xl:inline text-slate-500 text-xs sm:text-sm font-medium">
              {language === 'ml'
                ? 'തോട് & ഓവുചാൽ പരാതി പരിഹാര സെൽ'
                : 'Canal & Storm-Drain Redressal Grid'}
            </span>
          </div>
        </div>

        {/* Right Section: Language switcher, Weather advisory, Hotline, Notifications, Profile */}
        <div className="flex items-center gap-2.5 sm:gap-4 shrink-0 text-xs sm:text-sm">
          {/* Bilingual Language Switcher */}
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => handleLanguageChange('en')}
              className={`px-2 py-0.5 rounded-md font-medium transition-all cursor-pointer ${
                language === 'en'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Switch to English"
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => handleLanguageChange('ml')}
              className={`px-2 py-0.5 rounded-md font-medium transition-all cursor-pointer ${
                language === 'ml'
                  ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="മലയാളത്തിലേക്ക് മാറ്റുക"
            >
              മലയാളം
            </button>
          </div>

          {/* Live Monsoon Weather Advisory */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50/80 border border-amber-200/80 text-amber-900 text-xs font-medium">
            <CloudRain className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>
              {language === 'ml' ? 'മൺസൂൺ ജാഗ്രത: ' : 'Monsoon Cell: '}
              <strong className="font-semibold text-amber-950">
                {language === 'ml' ? 'യെല്ലോ അലർട്ട്' : 'Yellow Alert'}
              </strong>
            </span>
          </div>

          {/* Hotline Direct */}
          <div className="hidden sm:flex items-center gap-1.5 text-slate-500 text-xs">
            <Phone className="w-3.5 h-3.5 text-slate-400" />
            <a
              href="tel:18004254000"
              className="text-slate-900 hover:text-sky-600 font-semibold font-mono underline decoration-slate-300 underline-offset-2 transition-colors"
              title="24x7 Municipal Control Room"
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
              className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Civic Alerts & SLA Breaches"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                3
              </span>
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-slate-200 shadow-xl p-3 z-50 animate-fade-in">
                <div className="flex items-center justify-between px-2 py-1.5 border-b border-slate-100 mb-2">
                  <span className="font-bold text-slate-900 text-xs sm:text-sm">Civic Escalations</span>
                  <span className="text-[11px] font-medium text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                    3 Breached SLA
                  </span>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="p-2.5 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200">
                    <p className="font-semibold text-slate-900 flex items-center justify-between">
                      <span>Ward 48 &bull; Thevara-Perandoor</span>
                      <span className="text-rose-600 font-mono text-[10px] font-bold">L4 ESCALATED</span>
                    </p>
                    <p className="text-slate-500 text-[11px] mt-0.5">Culvert choke at SCB Road &bull; Overdue</p>
                  </div>
                  <div className="p-2.5 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200">
                    <p className="font-semibold text-slate-900 flex items-center justify-between">
                      <span>Ward 66 &bull; Mullassery Canal</span>
                      <span className="text-rose-600 font-mono text-[10px] font-bold">L4 ESCALATED</span>
                    </p>
                    <p className="text-slate-500 text-[11px] mt-0.5">Plastic blockage near South Railway Station</p>
                  </div>
                  <div className="p-2.5 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200">
                    <p className="font-semibold text-slate-900 flex items-center justify-between">
                      <span>Ward 60 &bull; Calvathy Canal</span>
                      <span className="text-rose-600 font-mono text-[10px] font-bold">L4 ESCALATED</span>
                    </p>
                    <p className="text-slate-500 text-[11px] mt-0.5">Heavy silt barrier throttled outflow</p>
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
              className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-800 text-xs transition-all cursor-pointer"
            >
              <div className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold text-[11px] flex items-center justify-center font-sans shadow-xs">
                KC
              </div>
              <span className="hidden sm:inline font-sans text-xs text-slate-800 font-semibold">Control Cell</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-slate-200 shadow-xl p-3.5 z-50 animate-fade-in space-y-2">
                <div className="px-1 border-b border-slate-100 pb-2">
                  <p className="font-bold text-slate-900 text-xs sm:text-sm">Kochi Corporation Control Cell</p>
                  <p className="text-slate-500 text-[11px]">LSGD Engineering &amp; Disaster Wing</p>
                </div>
                <div className="space-y-1.5 text-xs">
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
