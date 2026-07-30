import React from 'react';
import { clsx } from 'clsx';

/**
 * Shimmer skeleton block. Use className for size/shape (h-*, w-*, rounded-*).
 */
const Skeleton = ({ className, ...props }) => (
  <div
    className={clsx(
      'relative overflow-hidden rounded-xl bg-gray-100 dark:bg-white/[0.06]',
      'before:absolute before:inset-0 before:animate-shimmer',
      'before:bg-gradient-to-r before:from-transparent before:via-white/40 before:to-transparent',
      'dark:before:via-white/[0.08]',
      className,
    )}
    aria-hidden="true"
    {...props}
  />
);

export default Skeleton;
