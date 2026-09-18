import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | 'reported'
    | 'inspected'
    | 'in_progress'
    | 'escalated'
    | 'resolved'
    | 'neutral'
    | 'outline';
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  dot = false,
  children,
  className = '',
  ...props
}) => {
  // Functional semantic colors strictly mapped to civic status
  const variantStyles: Record<string, { bg: string; text: string; border: string; dot: string }> = {
    escalated: {
      bg: 'bg-rose-50',
      text: 'text-rose-800',
      border: 'border-rose-200',
      dot: 'bg-rose-600 animate-pulse',
    },
    reported: {
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-200',
      dot: 'bg-amber-500',
    },
    inspected: {
      bg: 'bg-sky-50',
      text: 'text-sky-800',
      border: 'border-sky-200',
      dot: 'bg-sky-500',
    },
    in_progress: {
      bg: 'bg-blue-50',
      text: 'text-blue-800',
      border: 'border-blue-200',
      dot: 'bg-blue-600',
    },
    resolved: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-800',
      border: 'border-emerald-200',
      dot: 'bg-emerald-600',
    },
    neutral: {
      bg: 'bg-slate-100',
      text: 'text-slate-700',
      border: 'border-slate-200',
      dot: 'bg-slate-400',
    },
    outline: {
      bg: 'bg-white',
      text: 'text-slate-600',
      border: 'border-slate-300',
      dot: 'bg-slate-400',
    },
  };

  const style = variantStyles[variant] || variantStyles.neutral;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${style.bg} ${style.text} ${style.border} ${className}`}
      {...props}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${style.dot}`} />}
      {children}
    </span>
  );
};

// Subordinate Hazard Tag: Visually understated so it does NOT compete with the primary Status Badge
export interface HazardTagProps {
  severity: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'MINOR' | string;
}

export const HazardTag: React.FC<HazardTagProps> = ({ severity }) => {
  const isCritical = severity === 'CRITICAL';
  const isHigh = severity === 'HIGH';

  return (
    <span
      className={`inline-flex items-center text-[11px] font-semibold tracking-tight ${
        isCritical
          ? 'text-rose-700'
          : isHigh
          ? 'text-amber-700'
          : 'text-slate-500'
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-xs mr-1.5 shrink-0 ${
          isCritical
            ? 'bg-rose-600'
            : isHigh
            ? 'bg-amber-500'
            : 'bg-slate-400'
        }`}
      />
      <span>{severity} HAZARD</span>
    </span>
  );
};
