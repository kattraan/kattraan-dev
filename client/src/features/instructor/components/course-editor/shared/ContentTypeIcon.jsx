import React from 'react';

/**
 * Reusable content type icon component for curriculum editor
 */
const ContentTypeIcon = ({ Icon, color, bgColor, label, text, onClick }) => (
    <div className="flex flex-col items-center group cursor-pointer relative" onClick={onClick}>
        {/* Tooltip */}
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-black text-white text-[11px] font-bold px-3 py-1.5 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 shadow-xl">
            {label}
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-black rotate-45" />
        </div>
        
        <div className={`relative w-[46px] h-[58px] rounded-[4px] flex items-center justify-center transition-all group-hover:-translate-y-1 shadow-sm border ${bgColor}`} 
             style={{ clipPath: 'polygon(0 0, 72% 0, 100% 22%, 100% 100%, 0 100%)' }}>
            <div className="absolute top-0 right-0 w-[14px] h-[14px] bg-black/5 shadow-inner" 
                 style={{ clipPath: 'polygon(0 0, 0 100%, 100% 100%)' }} />
            {text ? (
                <span className="text-[10px] font-black text-white mt-1">{text}</span>
            ) : (
                <Icon size={20} className={color} />
            )}
        </div>
    </div>
);

export default ContentTypeIcon;
