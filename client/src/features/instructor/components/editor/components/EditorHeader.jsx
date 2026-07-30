import React from "react";
import { ArrowLeft, Send, Loader2, Save, Eye } from "lucide-react";
import BrandLogo from "@/components/common/BrandLogo";

const STATUS_BADGES = {
  draft: {
    label: "Draft",
    className: "bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white/70",
  },
  pending_approval: {
    label: "Pending Admin Approval",
    className:
      "bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300",
  },
  published: {
    label: "Published",
    className:
      "bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-300",
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-100 dark:bg-red-500/20 text-red-800 dark:text-red-300",
  },
};

/**
 * Course editor header: back, logo, title, status; common actions (Save Draft, Preview, Publish) and Submit for Review.
 */
const EditorHeader = React.memo(
  ({
    courseTitle,
    status = "draft",
    rejectionReason,
    onBack,
    onSubmitForReview,
    isSubmitting,
    onSaveDraft,
    onPreview,
    isSaving,
  }) => {
    const badge = STATUS_BADGES[status] || STATUS_BADGES.draft;
    const canSubmit = status === "draft" || status === "rejected";
    return (
      <header className="min-h-[56px] sm:min-h-[72px] flex-shrink-0 bg-white dark:bg-black border-b border-gray-200 dark:border-white/10 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 sm:gap-4 px-3 sm:px-6 py-2 sm:py-0 z-50 transition-colors duration-300 shadow-sm dark:shadow-none">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
          <button
            type="button"
            onClick={onBack}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-gray-200 dark:border-white/10 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/5 transition-colors flex-shrink-0"
            aria-label="Back to my courses"
          >
            <ArrowLeft size={18} className="text-gray-600 dark:text-white/60 sm:w-5 sm:h-5" />
          </button>
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <BrandLogo className="hover:opacity-80 transition-opacity hidden sm:block flex-shrink-0" />
            <div className="hidden sm:block w-px h-6 bg-gray-200 dark:bg-white/10 flex-shrink-0" />
            <h1 className="text-[14px] sm:text-[17px] font-bold text-gray-900 dark:text-white/90 transition-colors duration-300 truncate max-w-[120px] xs:max-w-[180px] sm:max-w-[240px] md:max-w-none">
              {courseTitle || "Untitled Course"}
            </h1>
            <span
              className={`hidden md:inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${badge.className}`}
            >
              {badge.label}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={() => onSaveDraft?.("Draft")}
            disabled={isSaving}
            className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-gray-300 dark:border-white/20 text-gray-700 dark:text-white/90 text-xs sm:text-sm font-medium hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-60 transition-colors"
          >
            {isSaving ? (
              <Loader2 size={14} className="animate-spin sm:w-4 sm:h-4" />
            ) : (
              <Save size={14} className="sm:w-4 sm:h-4" />
            )}
            <span className="hidden sm:inline">Save Draft</span>
          </button>
          <button
            type="button"
            onClick={onPreview}
            className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-white text-xs sm:text-sm font-medium hover:bg-gray-200 dark:hover:bg-white/15 transition-colors"
          >
            <Eye size={14} className="sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Preview</span>
          </button>
          {canSubmit && (
            <button
              type="button"
              onClick={onSubmitForReview}
              disabled={isSubmitting}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-[#FF8C42] to-[#FF3FB4] text-white text-xs sm:text-sm font-semibold hover:opacity-95 disabled:opacity-60 transition-opacity shadow-lg shadow-primary-pink/20 border-0"
            >
              {isSubmitting ? (
                <Loader2 size={16} className="animate-spin sm:w-[18px] sm:h-[18px]" />
              ) : (
                <Send size={16} className="sm:w-[18px] sm:h-[18px]" />
              )}
              <span className="hidden xs:inline sm:inline">Submit</span>
            </button>
          )}
        </div>
      </header>
    );
  },
);

EditorHeader.displayName = "EditorHeader";

export default EditorHeader;
