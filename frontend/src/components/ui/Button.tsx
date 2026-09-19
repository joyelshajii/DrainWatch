import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-sky-600 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98]';

  const sizeClasses = {
    sm: 'text-xs sm:text-sm px-3.5 py-1.5 min-h-[36px] gap-1.5 font-medium',
    md: 'text-xs sm:text-sm px-4.5 py-2 min-h-[42px] gap-2 font-semibold',
    lg: 'text-sm sm:text-base px-5.5 py-2.5 min-h-[46px] gap-2.5 font-semibold',
  };

  const variantClasses = {
    primary:
      'bg-slate-900 hover:bg-slate-800 text-white border border-slate-900 shadow-sm hover:shadow active:bg-slate-950',
    secondary:
      'bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200/90 shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:border-slate-300',
    danger:
      'bg-rose-600 hover:bg-rose-700 text-white border border-rose-600 shadow-sm hover:shadow',
    ghost:
      'bg-transparent hover:bg-slate-100/80 text-slate-600 hover:text-slate-900 border border-transparent',
  };

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg
          className="animate-spin -ml-0.5 mr-1.5 h-3.5 w-3.5 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children}
    </button>
  );
};
