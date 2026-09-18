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

// Specialized KPI Tile: Clean card with top accent line, matching icon container, and prominent metric
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
  // Top border accent strictly mapped to 3 status colors + 1 neutral
  const accentStyles = {
    neutral: {
      borderTop: 'border-t-2 border-t-slate-300',
      text: 'text-slate-900',
      iconBox: 'bg-slate-50 text-slate-500 border-slate-200',
    },
    pending: {
      borderTop: 'border-t-4 border-t-amber-500',
      text: 'text-amber-700',
      iconBox: 'bg-amber-50 text-amber-600 border-amber-200',
    },
    critical: {
      borderTop: 'border-t-4 border-t-rose-600',
      text: 'text-rose-700',
      iconBox: 'bg-rose-50 text-rose-600 border-rose-200',
    },
    resolved: {
      borderTop: 'border-t-4 border-t-emerald-500',
      text: 'text-emerald-700',
      iconBox: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    },
  };

  const currentAccent = accentStyles[accent] || accentStyles.neutral;

  return (
    <div
      className={`bg-white border border-slate-200/90 ${currentAccent.borderTop} rounded-xl p-5 shadow-2xs flex flex-col justify-between transition-all duration-150`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
          {label}
        </span>
        <div
          className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${currentAccent.iconBox}`}
        >
          {icon}
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-baseline gap-2">
          <span className={`text-2xl sm:text-3xl font-bold font-mono tracking-tight ${currentAccent.text}`}>
            {value}
          </span>
          <span className="text-xs font-normal text-slate-600">{subtext}</span>
        </div>

        {secondaryText && (
          <p className="text-[11px] text-slate-400 mt-1.5 font-normal truncate">
            {secondaryText}
          </p>
        )}
      </div>
    </div>
  );
};
