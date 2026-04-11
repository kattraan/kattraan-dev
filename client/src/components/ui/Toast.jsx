import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback(({ title, message, type = 'info', duration = 4000 }) => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts((prevToasts) => [...prevToasts, { id, title, message, type, duration }]);

        setTimeout(() => {
            removeToast(id);
        }, duration);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
    }, []);

    const toast = {
        success: (title, message) => addToast({ title, message, type: 'success' }),
        error: (title, message) => addToast({ title, message, type: 'error' }),
        info: (title, message) => addToast({ title, message, type: 'info' }),
        warning: (title, message) => addToast({ title, message, type: 'warning' }),
    };

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
};

const ToastContainer = ({ toasts, removeToast }) => {
    if (toasts.length === 0) return null;
    
    return (
        <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none w-full max-w-[380px] sm:max-w-[400px] ml-auto pr-4">
            {toasts.map((toast) => (
                <div key={toast.id} className="pointer-events-auto">
                    <ToastItem {...toast} onRemove={() => removeToast(toast.id)} />
                </div>
            ))}
        </div>
    );
};

const ToastItem = ({ title, message, type, onRemove }) => {
    const configs = {
        success: {
            iconBg: 'bg-emerald-500/10 dark:bg-[#00FF94]/10 border border-emerald-500/30 dark:border-[#00FF94]/30',
            iconColor: 'text-emerald-600 dark:text-[#00FF94]',
            containerBg: 'bg-white dark:bg-[#0A0A0A] border border-emerald-500/30 dark:border-[#00FF94]/30 shadow-lg dark:shadow-[0_12px_48px_rgba(0,255,148,0.2)]',
        },
        error: {
            iconBg: 'bg-red-500/10 dark:bg-[#FF4B4B]/10 border border-red-500/30 dark:border-[#FF4B4B]/30',
            iconColor: 'text-red-600 dark:text-[#FF4B4B]',
            containerBg: 'bg-white dark:bg-[#0A0A0A] border border-red-500/30 dark:border-[#FF4B4B]/30 shadow-lg dark:shadow-[0_12px_48px_rgba(255,75,75,0.2)]',
        },
        info: {
            iconBg: 'bg-blue-500/10 dark:bg-[#4B9FFF]/10 border border-blue-500/30 dark:border-[#4B9FFF]/30',
            iconColor: 'text-blue-600 dark:text-[#4B9FFF]',
            containerBg: 'bg-white dark:bg-[#0A0A0A] border border-blue-500/30 dark:border-[#4B9FFF]/30 shadow-lg dark:shadow-[0_12px_48px_rgba(75,159,255,0.2)]',
        },
        warning: {
            iconBg: 'bg-amber-500/10 dark:bg-[#FFB800]/10 border border-amber-500/30 dark:border-[#FFB800]/30',
            iconColor: 'text-amber-600 dark:text-[#FFB800]',
            containerBg: 'bg-white dark:bg-[#0A0A0A] border border-amber-500/30 dark:border-[#FFB800]/30 shadow-lg dark:shadow-[0_12px_48px_rgba(255,184,0,0.2)]',
        },
    };

    const config = configs[type];
    const iconSize = 28;
    const icons = {
        success: <CheckCircle2 className={config.iconColor} size={iconSize} strokeWidth={2.5} />,
        error: <AlertCircle className={config.iconColor} size={iconSize} strokeWidth={2.5} />,
        info: <Info className={config.iconColor} size={iconSize} strokeWidth={2.5} />,
        warning: <AlertTriangle className={config.iconColor} size={iconSize} strokeWidth={2.5} />,
    };

    return (
        <div className={`
            relative flex items-start gap-3 rounded-xl border backdrop-blur-xl
            min-w-[260px] max-w-[360px] px-4 py-3 pr-9
            animate-in slide-in-from-right-4 fade-in duration-200
            ${config.containerBg}
        `}>
            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${config.iconBg}`}>
                {React.cloneElement(icons[type], { size: 20 })}
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
                {title && (
                    <h4 className="text-gray-900 dark:text-white text-sm font-bold font-satoshi tracking-tight">
                        {title}
                    </h4>
                )}
                {message && (
                    <p className="text-gray-600 dark:text-white/70 text-xs font-medium font-satoshi leading-relaxed mt-0.5">
                        {message}
                    </p>
                )}
            </div>
            <button
                type="button"
                onClick={onRemove}
                aria-label="Close"
                className="absolute top-2 right-2 p-1 rounded-md text-gray-400 hover:text-gray-700 dark:text-white/50 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/10 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-white/30"
            >
                <X size={14} strokeWidth={2.5} />
            </button>
        </div>
    );
};
