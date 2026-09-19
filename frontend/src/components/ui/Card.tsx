import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
  hover = false,
  children,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`bg-white border border-slate-200/80 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.03),0_1px_2px_rgba(0,0,0,0.02)] transition-all duration-200 ${
        hover ? 'hover:shadow-[0_8px_20px_-4px_rgba(15,23,42,0.08)] hover:border-slate-300/90 hover:-translate-y-0.5' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div className={`px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardBody: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div className={`p-5 sm:p-6 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div className={`px-5 py-3.5 bg-slate-50/70 border-t border-slate-100 rounded-b-2xl ${className}`} {...props}>
      {children}
    </div>
  );
};

// Specialized KPI Tile: Clean modern SaaS metric card with squircle icon badge and trend sparkline
export interface KpiTileProps {
  label: string;
  value: string | number;
  subtext: string;
  secondaryText?: string;
  icon: React.ReactNode;
  accent?: 'neutral' | 'pending' | 'critical' | 'resolved';
}

export const KpiTile: React.FC<KpiTileProps> = ({
  label,
  value,
  subtext,
  secondaryText,
  icon,
  accent = 'neutral',
}) => {
  const accentStyles = {
    neutral: {
      text: 'text-slate-900',
      iconBox: 'bg-sky-50 text-sky-600 border-sky-100',
      sparklineColor: 'text-sky-500',
      sparklinePath: 'M2 20 Q 14 24, 26 14 T 48 12 T 62 2',
      trendBadge: 'bg-sky-50 text-sky-700 border-sky-200/80',
    },
    pending: {
      text: 'text-slate-900',
      iconBox: 'bg-amber-50 text-amber-600 border-amber-100',
      sparklineColor: 'text-amber-500',
      sparklinePath: 'M2 18 Q 14 20, 26 14 T 46 8 T 62 4',
      trendBadge: 'bg-amber-50 text-amber-700 border-amber-200/80',
    },
    critical: {
      text: 'text-slate-900',
      iconBox: 'bg-rose-50 text-rose-600 border-rose-100',
      sparklineColor: 'text-rose-500',
      sparklinePath: 'M2 14 Q 12 18, 22 8 T 42 22 T 62 4',
      trendBadge: 'bg-rose-50 text-rose-700 border-rose-200/80',
    },
    resolved: {
      text: 'text-slate-900',
      iconBox: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      sparklineColor: 'text-emerald-500',
      sparklinePath: 'M2 18 Q 16 12, 28 20 T 48 10 T 62 2',
      trendBadge: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    },
  };

  const currentAccent = accentStyles[accent] || accentStyles.neutral;

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03),0_1px_2px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_24px_-4px_rgba(15,23,42,0.08)] hover:border-slate-300/90 hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between gap-4 group">
      {/* Top row: Label + Icon */}
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs sm:text-sm font-semibold tracking-normal text-slate-500 font-sans">
          {label}
        </span>
        <div
          className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl border flex items-center justify-center shrink-0 shadow-2xs transition-transform duration-200 group-hover:scale-105 ${currentAccent.iconBox}`}
        >
          {icon}
        </div>
      </div>

      {/* Middle row: Big metric value + subtext badge + sparkline */}
      <div className="flex items-baseline justify-between gap-2">
        <div className="flex items-baseline gap-2">
          <span className={`text-2xl sm:text-3xl lg:text-4xl font-bold font-sans tracking-tight ${currentAccent.text}`}>
            {value}
          </span>
          <span className="text-xs sm:text-sm font-medium text-slate-500">{subtext}</span>
        </div>

        {/* Decorative Trend Sparkline Curve */}
        <div className="shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
          <svg
            className={`w-14 sm:w-16 h-8 ${currentAccent.sparklineColor}`}
            viewBox="0 0 64 26"
            fill="none"
          >
            <path
              d={currentAccent.sparklinePath}
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* Bottom row: Clear, short status text */}
      {secondaryText && (
        <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-xs text-slate-600 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
          <span className="truncate">{secondaryText}</span>
        </div>
      )}
    </div>
  );
};
