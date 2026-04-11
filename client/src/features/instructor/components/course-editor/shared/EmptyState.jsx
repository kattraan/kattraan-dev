import React from 'react';
import { Search } from 'lucide-react';

/**
 * Reusable empty state component with customizable message and icon
 */
const EmptyState = ({ icon: Icon = Search, title, message, showDecorations = true }) => (
    <div className="py-32 flex flex-col items-center justify-center space-y-10">
        <div className="relative">
            <div className="w-24 h-24 rounded-full bg-white/[0.03] flex items-center justify-center border border-white/5 border-dashed">
                <Icon size={40} className="text-primary-pink/30" />
            </div>
            {showDecorations && (
                <>
                    <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary-pink/20 shadow-[0_0_15px_rgba(255,63,180,0.3)]" />
                    <div className="absolute -bottom-2 -left-2 w-2 h-2 rounded-full bg-primary-purple/20" />
                    <div className="absolute top-1/2 -right-4 w-1.5 h-1.5 rounded-full bg-white/20" />
                </>
            )}
        </div>
        {title && (
            <h3 className="text-[17px] font-black text-white">{title}</h3>
        )}
        <p className="text-[13px] text-white/20 font-bold text-center max-w-sm px-4">
            {message}
        </p>
    </div>
);

export default EmptyState;
