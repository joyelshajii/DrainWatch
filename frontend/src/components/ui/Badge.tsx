import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | 'default'
    | 'critical'
    | 'high'
    | 'moderate'
    | 'minor'
    | 'reported'
    | 'inspected'
    | 'in_progress'
    | 'escalated'
    | 'resolved'
    | 'outline';
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  dot = false,
  children,
  className = '',
  ...props
}) => {
  const variantStyles: Record<string, { bg: string; dot: string }> = {
    default: {
      bg: 'bg-slate-100 text-slate-700 border-slate-200',
      dot: 'bg-slate-400',
    },
    critical: {
      bg: 'bg-rose-50 text-rose-800 border-rose-200 font-semibold',
      dot: 'bg-rose-600 animate-pulse',
    },
    high: {
      bg: 'bg-amber-50 text-amber-800 border-amber-200 font-semibold',
      dot: 'bg-amber-500',
    },
    moderate: {
      bg: 'bg-sky-50 text-sky-800 border-sky-200',
      dot: 'bg-sky-500',
    },
    minor: {
      bg: 'bg-slate-100 text-slate-700 border-slate-200',
      dot: 'bg-slate-500',
    },
    reported: {
      bg: 'bg-amber-50 text-amber-800 border-amber-200',
      dot: 'bg-amber-500',
    },
    inspected: {
      bg: 'bg-sky-50 text-sky-800 border-sky-200',
      dot: 'bg-sky-500',
    },
    in_progress: {
      bg: 'bg-blue-50 text-blue-800 border-blue-200',
      dot: 'bg-blue-600',
    },
    escalated: {
      bg: 'bg-rose-50 text-rose-800 border-rose-200 font-bold',
      dot: 'bg-rose-600 animate-pulse',
    },
    resolved: {
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold',
      dot: 'bg-emerald-600',
    },
    outline: {
      bg: 'bg-transparent text-slate-600 border-slate-300',
      dot: 'bg-slate-400',
    },
  };

  const style = variantStyles[variant] || variantStyles.default;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs border ${style.bg} ${className}`}
      {...props}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${style.dot}`} />}
      {children}
    </span>
  );
};
