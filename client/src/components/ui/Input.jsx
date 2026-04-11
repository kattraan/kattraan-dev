import React, { useId, useState } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Eye, EyeOff } from 'lucide-react';

/**
 * Premium reusable input component.
 * Standardizes styling across the application.
 * Error message is associated with the input via aria-describedby for accessibility.
 */
const Input = ({
  label,
  error,
  className,
  type = 'text',
  placeholder = '',
  icon: Icon,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const errorId = useId();

  return (
    <div className="space-y-2 w-full">
      {label && (
        <label className="text-gray-700 dark:text-white text-[15px] font-normal ml-1 block transition-colors duration-300">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none">
            {React.isValidElement(Icon) ? Icon : <Icon size={20} strokeWidth={1.5} />}
          </div>
        )}
        <input
          type={isPassword ? (showPassword ? 'text' : 'password') : type}
          placeholder={placeholder}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={twMerge(
            clsx(
              'w-full bg-gray-50 dark:bg-white/[0.05] border border-gray-200 dark:border-white/10 rounded-xl py-2.5 text-gray-900 dark:text-white text-[14px] placeholder:text-gray-400 dark:placeholder:text-white/50 focus:outline-none focus:border-gray-400 dark:focus:border-white/70 focus:bg-white dark:focus:bg-white/[0.08] transition-all duration-300',
              Icon ? 'pl-12' : 'px-6',
              isPassword ? 'pr-12' : 'pr-6',
              error && 'border-red-500/50 focus:border-red-500',
              className
            )
          )}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-white/50 dark:hover:text-white transition-colors focus:outline-none"
          >
            {showPassword ? <EyeOff size={18} strokeWidth={1.5} /> : <Eye size={18} strokeWidth={1.5} />}
          </button>
        )}
      </div>
      {error && (
        <p id={errorId} className="text-red-500 text-[12px] ml-4 font-medium" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
