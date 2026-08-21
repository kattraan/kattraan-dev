import React from "react";
import {
  ChevronRight,
  BookOpen,
  Layout,
  Zap,
  BarChart2,
  MessageSquare,
  HelpCircle,
  FileCheck,
  Star,
  Bot,
  Video,
  Sparkles,
} from "lucide-react";

// value = internal tab id (used for activeTab state); label = display text in sidebar
const SIDEBAR_ITEMS = [
  { value: "Information", label: "Course Information", icon: Layout, shortLabel: "Info" },
  { value: "Curriculum", label: "Curriculum", icon: BookOpen, shortLabel: "Curriculum" },
  { value: "Chapter Engagement", label: "Chapter Engagement", icon: Sparkles, shortLabel: "Engagement" },
  { value: "Live sessions", label: "Live sessions", icon: Video, shortLabel: "Live" },
  { value: "Drip", label: "Content schedule", icon: Zap, badge: "BETA", shortLabel: "Schedule" },
  { value: "Report", label: "Analytics", icon: BarChart2, shortLabel: "Analytics" },
  { value: "Comments", label: "Comments", icon: MessageSquare, shortLabel: "Comments" },
  { value: "QnA", label: "Q&A", icon: HelpCircle, shortLabel: "Q&A" },
  { value: "Assignment Responses", label: "Submissions", icon: FileCheck, shortLabel: "Submissions" },
  { value: "Reviews", label: "Reviews", icon: Star, shortLabel: "Reviews" },
  {
    value: "QnA Chatbot",
    label: "AI assistant",
    icon: Bot,
    badge: "EXPERIMENTAL",
    shortLabel: "AI",
  },
];

function TabButton({ item, activeTab, onTabChange, compact = false }) {
  const isActive = activeTab === item.value;

  if (compact) {
    return (
      <button
        key={item.value}
        type="button"
        onClick={() => onTabChange(item.value)}
        className={`sidebar-nav-link flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap select-none ${
          isActive
            ? "inner-nav-active text-white"
            : "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-white/60 hover:bg-gray-200 dark:hover:bg-white/10"
        }`}
      >
        <item.icon size={14} className={isActive ? "text-white" : ""} />
        {item.shortLabel || item.label}
        {item.badge && (
          <span className="text-[8px] font-black uppercase tracking-wider opacity-80">
            {item.badge === "BETA" ? "β" : "α"}
          </span>
        )}
      </button>
    );
  }

  return (
    <button
      key={item.value}
      type="button"
      onClick={() => onTabChange(item.value)}
      className={`sidebar-nav-link w-full flex items-center justify-between px-4 py-3 mb-1 group rounded-2xl select-none ${
        isActive
          ? "inner-nav-active text-white"
          : "hover:bg-gray-100 dark:hover:bg-white/5"
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors flex-shrink-0 ${
            isActive
              ? "bg-white/20 text-white"
              : "bg-gray-100 dark:bg-[#3A3A3A] text-gray-500 dark:text-white/70"
          }`}
        >
          <item.icon size={18} className={isActive ? "text-white" : ""} />
        </div>
        <span
          className={`text-[14px] font-bold truncate ${
            isActive ? "text-white" : "text-gray-600 dark:text-white/60"
          }`}
        >
          {item.label}
        </span>
      </div>
      <ChevronRight
        size={16}
        className={
          isActive ? "flex-shrink-0 text-white" : "text-gray-300 dark:text-white/20 flex-shrink-0"
        }
      />
    </button>
  );
}

/**
 * Tab sidebar for course editor. Horizontal scroll on mobile/tablet, vertical sidebar on desktop.
 */
const EditorTabs = React.memo(({ activeTab, onTabChange }) => (
  <>
    {/* Mobile & tablet: horizontal scroll tab bar */}
    <div className="lg:hidden flex-shrink-0 border-b border-gray-200 dark:border-white/10 bg-white dark:bg-black px-3 py-2 overflow-x-auto scrollbar-hide">
      <div className="flex gap-2 min-w-max">
        {SIDEBAR_ITEMS.map((item) => (
          <TabButton
            key={item.value}
            item={item}
            activeTab={activeTab}
            onTabChange={onTabChange}
            compact
          />
        ))}
      </div>
    </div>

    {/* Desktop: vertical sidebar */}
    <aside className="hidden lg:flex w-[300px] min-h-0 flex-shrink-0 mr-0 bg-white dark:bg-black border-r border-gray-200 dark:border-white/10 flex-col py-4 px-3 overflow-y-auto transition-colors duration-300">
      {SIDEBAR_ITEMS.map((item) => (
        <TabButton
          key={item.value}
          item={item}
          activeTab={activeTab}
          onTabChange={onTabChange}
        />
      ))}
    </aside>
  </>
));

EditorTabs.displayName = "EditorTabs";

export default EditorTabs;
