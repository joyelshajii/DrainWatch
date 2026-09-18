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
      className={`bg-white border border-slate-200/90 rounded-xl shadow-2xs transition-all duration-150 ${
        hover ? 'hover:shadow-xs hover:border-slate-300' : ''
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
    <div className={`px-5 py-3.5 border-b border-slate-100 ${className}`} {...props}>
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
    <div className={`p-5 ${className}`} {...props}>
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
    <div className={`px-5 py-3 bg-slate-50/60 border-t border-slate-100 rounded-b-xl ${className}`} {...props}>
      {children}
    </div>
  );
};

// Specialized KPI Tile: Clean modern card with squircle icon badge and trend sparkline matching mockup
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
    },
    pending: {
      text: 'text-slate-900',
      iconBox: 'bg-amber-50 text-amber-600 border-amber-100',
      sparklineColor: 'text-amber-500',
      sparklinePath: 'M2 18 Q 14 20, 26 14 T 46 8 T 62 4',
    },
    critical: {
      text: 'text-slate-900',
      iconBox: 'bg-rose-50 text-rose-600 border-rose-100',
      sparklineColor: 'text-rose-500',
      sparklinePath: 'M2 14 Q 12 18, 22 8 T 42 22 T 62 4',
    },
    resolved: {
      text: 'text-slate-900',
      iconBox: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      sparklineColor: 'text-emerald-500',
      sparklinePath: 'M2 18 Q 16 12, 28 20 T 48 10 T 62 2',
    },
  };

  const currentAccent = accentStyles[accent] || accentStyles.neutral;

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-[18px] shadow-2xs flex items-center justify-between gap-3 hover:shadow-xs transition-all duration-150">
      <div className="flex items-center gap-3.5 min-w-0">
        <div
          className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 shadow-2xs ${currentAccent.iconBox}`}
        >
          {icon}
        </div>

        <div className="min-w-0">
          <span className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase block">
            {label}
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className={`text-2xl sm:text-3xl font-bold font-mono tracking-tight ${currentAccent.text}`}>
              {value}
            </span>
            <span className="text-xs font-normal text-slate-600 truncate">{subtext}</span>
          </div>
          {secondaryText && (
            <p className="text-[11px] text-slate-400 mt-0.5 font-normal truncate">
              {secondaryText}
            </p>
          )}
        </div>
      </div>

      {/* Decorative Trend Sparkline Curve */}
      <div className="hidden sm:block shrink-0 pl-2">
        <svg
          className={`w-14 h-8 ${currentAccent.sparklineColor}`}
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
  );
};
