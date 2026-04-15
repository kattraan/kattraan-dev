import React, { Suspense, lazy } from "react";
import { useEditorContext } from "../context/EditorContext";

const InformationTab = lazy(
  () =>
    import("@/features/instructor/components/course-editor/tabs/InformationTab"),
);
const CurriculumTab = lazy(
  () =>
    import("@/features/instructor/components/course-editor/tabs/CurriculumTab"),
);
const LiveSessionsTab = lazy(
  () =>
    import("@/features/instructor/components/course-editor/tabs/LiveSessionsTab"),
);
const DripTab = lazy(
  () => import("@/features/instructor/components/course-editor/tabs/DripTab"),
);
const ReportTab = lazy(
  () => import("@/features/instructor/components/course-editor/tabs/ReportTab"),
);
const ChapterEngagementTab = lazy(
  () =>
    import("@/features/instructor/components/course-editor/tabs/ChapterEngagementTab"),
);
const CommentsTab = lazy(
  () =>
    import("@/features/instructor/components/course-editor/tabs/CommentsTab"),
);
const QnATab = lazy(
  () => import("@/features/instructor/components/course-editor/tabs/QnATab"),
);
const AssignmentResponsesTab = lazy(
  () =>
    import("@/features/instructor/components/course-editor/tabs/AssignmentResponsesTab"),
);
const ReviewsTab = lazy(
  () =>
    import("@/features/instructor/components/course-editor/tabs/ReviewsTab"),
);
const ChatBotAnalyticsTab = lazy(
  () =>
    import("@/features/instructor/components/course-editor/tabs/ChatBotAnalyticsTab"),
);

function EditorTabPanelsFallback() {
  return (
    <div className="flex items-center justify-center min-h-[280px] text-gray-500 dark:text-white/50 font-medium">
      Loading…
    </div>
  );
}

const EditorTabPanels = React.memo(function EditorTabPanels() {
  const editor = useEditorContext();
  const {
    activeTab,
    courseDetails,
    setCourseDetails,
    setActiveReportSubTab,
    setActiveCommentStatus,
    setActiveDripType,
    setExpandedChapterId,
    setSelectionChapterId,
    setActiveFileUploadType,
    expandedChapterId,
    selectionChapterId,
    activeReportSubTab,
    activeCommentStatus,
    activeDripType,
    isSaving,
    id,
    fileInputRef,
    handleSave,
    loadCourse,
    handleUpdateDetails,
    addSection,
    deleteSection,
    updateSection,
    addChapter,
    updateChapter,
    deleteChapter,
    deleteContent,
    moveSection,
    moveChapter,
    handleContentTrigger,
    videoUploadState,
    retryVideoUpload,
    updateVideoDescription,
    openResourceUpload,
  } = editor;

  return (
    <div className="w-full flex-1 min-h-0 flex flex-col min-w-0">
      <Suspense fallback={<EditorTabPanelsFallback />}>
        {activeTab === "Curriculum" && (
          <CurriculumTab
            sections={courseDetails.sections}
            courseDetails={courseDetails}
            handleUpdateDetails={handleUpdateDetails}
            onAddSection={addSection}
            onAddChapter={addChapter}
            onDeleteSection={deleteSection}
            onUpdateSection={updateSection}
            onDeleteChapter={deleteChapter}
            onUpdateChapter={updateChapter}
            onTriggerContent={handleContentTrigger}
            onDeleteContent={deleteContent}
            expandedChapterId={expandedChapterId}
            setExpandedChapterId={setExpandedChapterId}
            selectionChapterId={selectionChapterId}
            setSelectionChapterId={setSelectionChapterId}
            isSaving={isSaving}
            onMoveSection={moveSection}
            onMoveChapter={moveChapter}
            videoUploadState={videoUploadState}
            retryVideoUpload={retryVideoUpload}
            onOpenResourceUpload={openResourceUpload}
            onUpdateDescription={updateVideoDescription}
          />
        )}
        {activeTab === "Live sessions" && (
          <LiveSessionsTab
            courseId={id}
            courseDetails={courseDetails}
            loadCourse={loadCourse}
            isSaving={isSaving}
          />
        )}
        {activeTab === "Information" && (
          <InformationTab
            courseDetails={courseDetails}
            setCourseDetails={setCourseDetails}
            handleUpdateDetails={handleUpdateDetails}
            fileInputRef={fileInputRef}
            setActiveFileUploadType={setActiveFileUploadType}
            handleSave={handleSave}
            isSaving={isSaving}
          />
        )}
        {activeTab === "Drip" && (
          <DripTab
            courseDetails={courseDetails}
            setCourseDetails={setCourseDetails}
            activeDripType={activeDripType}
            setActiveDripType={setActiveDripType}
            handleSave={handleSave}
            isSaving={isSaving}
          />
        )}
        {activeTab === "Report" && (
          <ReportTab
            courseId={courseDetails?._id}
            activeReportSubTab={activeReportSubTab}
            setActiveReportSubTab={setActiveReportSubTab}
          />
        )}
        {activeTab === "Chapter Engagement" && (
          <ChapterEngagementTab
            courseId={id}
            courseDetails={courseDetails}
            loadCourse={loadCourse}
            engagementTemplates={editor.engagementTemplates}
            setEngagementTemplates={editor.setEngagementTemplates}
          />
        )}
        {activeTab === "Comments" && (
          <CommentsTab
            activeCommentStatus={activeCommentStatus}
            setActiveCommentStatus={setActiveCommentStatus}
          />
        )}
        {activeTab === "QnA" && <QnATab />}
        {activeTab === "Assignment Responses" && <AssignmentResponsesTab />}
        {activeTab === "Reviews" && <ReviewsTab courseId={id} />}
        {activeTab === "QnA Chatbot" && <ChatBotAnalyticsTab />}
      </Suspense>
    </div>
  );
});

export default EditorTabPanels;
