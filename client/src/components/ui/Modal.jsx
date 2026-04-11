import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { X } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Premium generic modal component.
 * Renders via portal so it covers entire viewport (including sidebar). Supports dark/light theme.
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  className,
  showClose = true,
  maxWidth = '500px',
}) => {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      {/* Backdrop - covers entire screen including sidebar */}
      <div 
        className="absolute inset-0 bg-black/50 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Modal Container - theme aware */}
      <div 
        ref={modalRef}
        style={{ maxWidth }}
        className={twMerge(
          clsx(
            "relative w-full rounded-2xl overflow-hidden shadow-xl animate-in zoom-in-95 fade-in duration-300 font-satoshi",
            "bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 backdrop-blur-xl",
            "shadow-gray-200/20 dark:shadow-black/50 transition-colors duration-300",
            className
          )
        )}
      >
        {/* Header */}
        {(title || showClose) && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/10">
            {title ? (
              <h2 className="text-xs font-bold text-gray-500 dark:text-white/50 uppercase tracking-widest flex-grow text-center">{title}</h2>
            ) : <div className="flex-grow" />}
            
            {showClose && (
              <button 
                onClick={onClose}
                className="p-2 rounded-full bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white transition-all"
                aria-label="Close modal"
              >
                <X size={16} />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="px-5 pb-5 pt-2">
          {children}
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default Modal;
