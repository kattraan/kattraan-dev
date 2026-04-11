import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Premium Card component for containers.
 */
const Card = ({
  children,
  className,
  hoverable = false,
  variant = 'default', // default, dark, glass
  ...props
}) => {
  const baseStyles = 'rounded-[32px] overflow-hidden transition-all duration-300';
  
  const variants = {
    default: 'bg-white/[0.02] border border-white/5 shadow-xl',
    dark: 'bg-[#0c091a] border border-white/5',
    glass: 'bg-white/[0.03] backdrop-blur-md border border-white/10',
    white: 'bg-white border border-gray-100 shadow-sm',
  };

  const hoverStyles = hoverable ? 'hover:border-white/20 hover:bg-white/[0.04] hover:-translate-y-1' : '';

  return (
    <div
      className={twMerge(clsx(baseStyles, variants[variant], hoverStyles, className))}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
