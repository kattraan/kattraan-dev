import React from 'react';

/** Floating date pill between message groups. */
const ChatDateSeparator = ({ label }) => (
    <div className="flex justify-center my-3 shrink-0">
        <span className="px-3 py-1.5 rounded-lg bg-white/95 dark:bg-[#1a1625]/95 text-[11px] font-medium text-gray-500 dark:text-white/45 shadow-sm backdrop-blur-sm border border-gray-200/60 dark:border-white/10">
            {label}
        </span>
    </div>
);

export default ChatDateSeparator;
