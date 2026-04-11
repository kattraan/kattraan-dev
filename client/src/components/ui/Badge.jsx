import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Premium Badge/Status component.
 */
const Badge = ({
  children,
  variant = 'default', // default, success, warning, error, primary
  className,
  ...props
}) => {
  const variants = {
    default: 'bg-white/10 text-white/60',
    primary: 'bg-orange-500/10 text-orange-500',
    success: 'bg-green-500/10 text-green-500',
    warning: 'bg-yellow-500/10 text-yellow-500',
    error: 'bg-red-500/10 text-red-500',
    ghost: 'bg-transparent border border-white/10 text-white/40',
  };

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest',
          variants[variant],
          className
        )
      )}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
