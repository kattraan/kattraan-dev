import React, { createContext, useContext, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from './index';

const ConfirmDialogContext = createContext(null);

export const useConfirmDialog = () => {
    const context = useContext(ConfirmDialogContext);
    if (!context) {
        throw new Error('useConfirmDialog must be used within ConfirmDialogProvider');
    }
    return context;
};

export const ConfirmDialogProvider = ({ children }) => {
    const [dialogState, setDialogState] = useState({
        isOpen: false,
        title: '',
        message: '',
        confirmText: 'Confirm',
        cancelText: 'Cancel',
        onConfirm: null,
        onCancel: null,
        variant: 'danger' // danger, warning, info
    });

    const confirm = ({ title, message, confirmText = 'Delete', cancelText = 'Cancel', variant = 'danger' }) => {
        return new Promise((resolve) => {
            setDialogState({
                isOpen: true,
                title,
                message,
                confirmText,
                cancelText,
                variant,
                onConfirm: () => {
                    setDialogState(prev => ({ ...prev, isOpen: false }));
                    resolve(true);
                },
                onCancel: () => {
                    setDialogState(prev => ({ ...prev, isOpen: false }));
                    resolve(false);
                }
            });
        });
    };

    return (
        <ConfirmDialogContext.Provider value={{ confirm }}>
            {children}
            {dialogState.isOpen && <ConfirmDialog {...dialogState} />}
        </ConfirmDialogContext.Provider>
    );
};

const ConfirmDialog = ({ title, message, confirmText, cancelText, onConfirm, onCancel, variant }) => {
    const variantStyles = {
        danger: {
            icon: 'text-red-500',
            button: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white',
            border: 'border-red-500/20 dark:border-red-500/20',
            glow: 'shadow-[0_8px_32px_rgba(239,68,68,0.15)] dark:shadow-[0_8px_32px_rgba(239,68,68,0.2)]',
        },
        warning: {
            icon: 'text-yellow-500',
            button: 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white',
            border: 'border-yellow-500/20 dark:border-yellow-500/20',
            glow: 'shadow-[0_8px_32px_rgba(234,179,8,0.15)] dark:shadow-[0_8px_32px_rgba(234,179,8,0.2)]',
        },
        info: {
            icon: 'text-blue-500',
            button: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white',
            border: 'border-blue-500/20 dark:border-blue-500/20',
            glow: 'shadow-[0_8px_32px_rgba(59,130,246,0.15)] dark:shadow-[0_8px_32px_rgba(59,130,246,0.2)]',
        },
    };

    const styles = variantStyles[variant] || variantStyles.danger;

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className={`
                bg-white dark:bg-[#1A1A1A] border ${styles.border} rounded-2xl p-6 max-w-md w-full mx-4
                animate-in zoom-in-95 duration-200 ${styles.glow}
            `}>
                <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 ${styles.icon}`}>
                        <AlertTriangle size={24} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 font-satoshi">{title}</h3>
                        <p className="text-sm text-gray-600 dark:text-white/60 font-medium font-satoshi leading-relaxed">{message}</p>
                    </div>
                    <button
                        onClick={onCancel}
                        className="flex-shrink-0 text-gray-400 hover:text-gray-700 dark:text-white/20 dark:hover:text-white transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="flex items-center gap-3 mt-6 justify-end">
                    <button
                        onClick={onCancel}
                        className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 dark:text-white/60 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-all font-satoshi"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all font-satoshi ${styles.button}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};
