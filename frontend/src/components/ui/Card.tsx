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

// Specialized KPI Tile: Clean, de-boxed, without loud top borders, dominant stat number
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
  // Value color strictly mapped to functional status, card itself is clean neutral
  const textColors = {
    neutral: 'text-slate-900',
    pending: 'text-amber-800',
    critical: 'text-rose-800',
    resolved: 'text-emerald-800',
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs flex flex-col justify-between">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
          {label}
        </span>
        <div className="w-7 h-7 rounded-md bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
          {icon}
        </div>
      </div>

      <div className="mt-3">
        <div className="flex items-baseline gap-2">
          <span className={`text-3xl sm:text-4xl font-bold font-mono tracking-tight ${textColors[accent]}`}>
            {value}
          </span>
          <span className="text-xs text-slate-500 font-normal">{subtext}</span>
        </div>

        {secondaryText && (
          <p className="text-[11px] text-slate-400 mt-1 font-normal truncate">
            {secondaryText}
          </p>
        )}
      </div>
    </div>
  );
};
