import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Premium Switch/Toggle component.
 */
const Switch = ({
  checked,
  onChange,
  className,
  ...props
}) => {
  return (
    <div 
      onClick={() => onChange?.(!checked)}
      className={twMerge(
        clsx(
          "relative w-12 h-6 rounded-full transition-all cursor-pointer",
          checked ? 'bg-orange-500' : 'bg-white/10',
          className
        )
      )}
      {...props}
    >
      <div 
        className={twMerge(
          clsx(
            "absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm",
            checked ? 'translate-x-6' : 'translate-x-0'
          )
        )} 
      />
    </div>
  );
};

export default Switch;
