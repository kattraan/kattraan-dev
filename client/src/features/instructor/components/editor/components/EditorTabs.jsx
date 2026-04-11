import React from 'react';
import { ChevronRight, BookOpen, Layout, Zap, BarChart2, MessageSquare, HelpCircle, FileCheck, Star, Bot, Video } from 'lucide-react';

// value = internal tab id (used for activeTab state); label = display text in sidebar
const SIDEBAR_ITEMS = [
  { value: 'Information', label: 'Course Information', icon: Layout },
  { value: 'Curriculum', label: 'Curriculum', icon: BookOpen },
  { value: 'Live sessions', label: 'Live sessions', icon: Video },
  { value: 'Drip', label: 'Content schedule', icon: Zap, badge: 'BETA' },
  { value: 'Report', label: 'Analytics', icon: BarChart2 },
  { value: 'Comments', label: 'Comments', icon: MessageSquare },
  { value: 'QnA', label: 'Q&A', icon: HelpCircle },
  { value: 'Assignment Responses', label: 'Submissions', icon: FileCheck },
  { value: 'Reviews', label: 'Reviews', icon: Star },
  { value: 'QnA Chatbot', label: 'AI assistant', icon: Bot, badge: 'EXPERIMENTAL' },
];

/**
 * Tab sidebar for course editor. Memoized to prevent re-renders on content change.
 */
const EditorTabs = React.memo(({ activeTab, onTabChange }) => (
  <aside className="w-[300px] min-h-0 flex-shrink-0 mr-0 bg-white dark:bg-black border-r border-gray-200 dark:border-white/10 flex flex-col py-4 px-3 overflow-y-auto transition-colors duration-300">
    {SIDEBAR_ITEMS.map((item) => (
      <button
        key={item.value}
        type="button"
        onClick={() => onTabChange(item.value)}
        className={`w-full flex items-center justify-between px-4 py-3 mb-1 transition-all group rounded-2xl ${
          activeTab === item.value
            ? 'bg-gradient-to-r from-[#FF8C42] to-[#FF3FB4] shadow-[0_10px_20px_rgba(255,63,180,0.3)]'
            : 'hover:bg-gray-100 dark:hover:bg-white/5'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
              activeTab === item.value ? 'bg-white text-primary-pink' : 'bg-gray-100 dark:bg-[#3A3A3A] text-gray-500 dark:text-white/70'
            }`}
          >
            <item.icon size={18} />
          </div>
          <span
            className={`text-[14px] font-bold ${
              activeTab === item.value ? 'text-white' : 'text-gray-600 dark:text-white/60'
            }`}
          >
            {item.label}
          </span>
        </div>
        <ChevronRight size={16} className={activeTab === item.value ? 'text-white' : 'text-gray-300 dark:text-white/20'} />
      </button>
    ))}
  </aside>
));

EditorTabs.displayName = 'EditorTabs';

export default EditorTabs;
