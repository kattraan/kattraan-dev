import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Premium reusable button component.
 * Supports various variants, sizes, and states.
 */
const Button = ({
  children,
  className,
  variant = "primary", // primary, secondary, outline, ghost, success, muted
  size = "md", // sm, md, lg
  isLoading = false,
  disabled = false,
  type = "button",
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-bold rounded-full transition-all duration-300 transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-gradient-to-r from-primary-pink to-[#ff7b3f] text-white hover:brightness-110 shadow-lg shadow-primary-pink/20",
    secondary:
      "bg-white/10 backdrop-blur-sm text-white border border-white/10 hover:bg-white/20",
    outline:
      "border border-primary-pink text-primary-pink hover:bg-primary-pink hover:text-white",
    ghost: "text-white/70 hover:text-white hover:bg-white/5",
    /** Subtle completion / success — no brand gradient */
    success:
      "bg-emerald-50/90 text-emerald-800 border border-emerald-200/70 hover:bg-emerald-100/90 hover:border-emerald-300/60 dark:bg-emerald-950/30 dark:text-emerald-200 dark:border-emerald-800/40 dark:hover:bg-emerald-900/35 dark:hover:border-emerald-700/40 shadow-none",
    /** Neutral card actions on light backgrounds */
    muted:
      "bg-zinc-100/90 text-zinc-800 border border-zinc-200/80 hover:bg-zinc-200/70 hover:border-zinc-300/60 dark:bg-white/[0.06] dark:text-white/90 dark:border-white/10 dark:hover:bg-white/[0.1] shadow-none",
  };

  const sizes = {
    sm: "px-6 py-2 text-[13px]",
    md: "px-8 py-3 text-[15px]",
    lg: "px-10 py-4 text-[17px]",
  };

  const classes = twMerge(
    clsx(baseStyles, variants[variant], sizes[size], className),
  );

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg
          className="animate-spin -ml-1 mr-3 h-5 w-5 text-current"
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
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      ) : null}
      {children}
    </button>
  );
};

export default Button;
