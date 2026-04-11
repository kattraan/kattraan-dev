/**
 * REFERENCE: Production-style form field with accessibility and consistency.
 * Use this pattern for new forms; consider migrating existing Input usage to this or to Input with the same a11y.
 *
 * - Single source of truth for label, error, hint
 * - aria-describedby links error/hint to input
 * - aria-invalid when error present
 * - Stable id from useId() for SSR-safe association
 * - Optional icon; supports password visibility toggle
 */
import React, { useId, useState, useCallback } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const FormField = React.memo(function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  hint,
  placeholder,
  required = false,
  disabled = false,
  icon: Icon,
  className,
  inputClassName,
  ...inputProps
}) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  const handleTogglePassword = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const describedBy = [error && errorId, hint && hintId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={twMerge('space-y-1.5', className)}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-white/90">
          {label}
          {required && <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/50 pointer-events-none" aria-hidden>
            <Icon size={20} strokeWidth={1.5} />
          </div>
        )}
        <input
          id={id}
          name={name}
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={twMerge(
            'w-full rounded-xl border bg-white/5 py-2.5 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-primary-pink/50 transition-colors',
            Icon ? 'pl-11 pr-4' : 'px-4',
            isPassword && 'pr-11',
            error && 'border-red-500/50 focus:ring-red-500/50',
            !error && 'border-gray-200 dark:border-white/10',
            inputClassName
          )}
          {...inputProps}
        />
        {isPassword && (
          <button
            type="button"
            onClick={handleTogglePassword}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-white/50 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-primary-pink/30 rounded p-1"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={0}
          >
            {/* In production use Eye/EyeOff from lucide-react; text used here for reference clarity */}
            {showPassword ? 'Hide' : 'Show'}
          </button>
        )}
      </div>
      {error && (
        <p id={errorId} className="text-sm text-red-500 font-medium" role="alert">
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={hintId} className="text-xs text-gray-500 dark:text-white/50">
          {hint}
        </p>
      )}
    </div>
  );
});

export default FormField;
