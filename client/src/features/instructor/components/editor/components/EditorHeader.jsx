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
      <header className="h-[72px] flex-shrink-0 bg-white dark:bg-black border-b border-gray-200 dark:border-white/10 flex items-center justify-between px-6 z-50 transition-colors duration-300 shadow-sm dark:shadow-none">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onBack}
            className="w-10 h-10 rounded-full border border-gray-200 dark:border-white/10 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            aria-label="Back to my courses"
          >
            <ArrowLeft size={20} className="text-gray-600 dark:text-white/60" />
          </button>
          <div className="flex items-center gap-3">
            <BrandLogo className="hover:opacity-80 transition-opacity" />
            <div className="w-px h-6 bg-gray-200 dark:bg-white/10" />
            <h1 className="text-[17px] font-bold text-gray-900 dark:text-white/90 transition-colors duration-300">
              {courseTitle || "Untitled Course"}
            </h1>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${badge.className}`}
            >
              {badge.label}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onSaveDraft?.("Draft")}
            disabled={isSaving}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-white/20 text-gray-700 dark:text-white/90 text-sm font-medium hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-60 transition-colors"
          >
            {isSaving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            Save Draft
          </button>
          <button
            type="button"
            onClick={onPreview}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-white text-sm font-medium hover:bg-gray-200 dark:hover:bg-white/15 transition-colors"
          >
            <Eye size={16} /> Preview
          </button>
          {canSubmit && (
            <button
              type="button"
              onClick={onSubmitForReview}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF8C42] to-[#FF3FB4] text-white text-sm font-semibold hover:opacity-95 disabled:opacity-60 transition-opacity shadow-lg shadow-primary-pink/20 border-0"
            >
              {isSubmitting ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
              Submit for Review
            </button>
          )}
        </div>
      </header>
    );
  },
);

EditorHeader.displayName = "EditorHeader";

export default EditorHeader;
