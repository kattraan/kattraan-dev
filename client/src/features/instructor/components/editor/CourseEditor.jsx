import React, { useCallback } from 'react';
import { useCourseEditor } from './hooks/useCourseEditor';
import { ROUTES } from '@/config/routes';
import { EditorProvider, useEditorContext } from './context/EditorContext';
import EditorHeader from './components/EditorHeader';
import EditorTabs from './components/EditorTabs';
import EditorLoadingScreen from './components/EditorLoadingScreen';
import EditorFileInput from './components/EditorFileInput';
import EditorTabPanels from './components/EditorTabPanels';
import EditorModals from './components/EditorModals';

function CourseEditorContent() {
  const editor = useEditorContext();
  const {
    id: courseId,
    courseDetails,
    activeTab,
    isLoadingData,
    setActiveTab,
    fileInputRef,
    onFileChange,
    fileInputAccept,
    handleSave,
    handleSubmitForReview,
    isSubmittingForReview,
    isSaving,
  } = editor;
  const onBack = useCallback(() => editor.navigate(ROUTES.INSTRUCTOR_MY_COURSES), [editor]);
  const onPreview = useCallback(() => {
    if (courseId) window.open(`${ROUTES.COURSE_DETAILS}/${courseId}`, '_blank');
  }, [courseId]);
  const isPending = courseDetails.status === 'pending_approval';

  return (
    <div className="h-screen bg-gray-50 dark:bg-black flex flex-col font-satoshi text-gray-900 dark:text-white overflow-hidden transition-colors duration-300">
      <EditorFileInput fileInputRef={fileInputRef} onChange={onFileChange} accept={fileInputAccept} />
      <EditorHeader
        courseTitle={courseDetails.title}
        status={courseDetails.status}
        rejectionReason={courseDetails.rejectionReason}
        onBack={onBack}
        onSubmitForReview={handleSubmitForReview}
        isSubmitting={isSubmittingForReview}
        onSaveDraft={handleSave}
        onPreview={onPreview}
        isSaving={isSaving}
      />
      {isPending && (
        <div className="flex-shrink-0 bg-amber-500/10 border-b border-amber-500/20 px-6 py-3 text-amber-800 dark:text-amber-200 text-sm font-medium">
          Your course is under review. You cannot edit the curriculum until admin approves or rejects it.
        </div>
      )}
      {courseDetails.status === 'rejected' && courseDetails.rejectionReason && (
        <div className="flex-shrink-0 bg-red-500/10 border-b border-red-500/20 px-6 py-3 text-red-800 dark:text-red-200 text-sm">
          <span className="font-medium">Course rejected. </span>
          <span>Admin feedback: {courseDetails.rejectionReason}</span>
        </div>
      )}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <EditorTabs activeTab={activeTab} onTabChange={setActiveTab} />
        {/* Outer gap – gray bg peeks as top/side margin */}
        <div className="flex-1 min-h-0 overflow-hidden px-4 pt-4 pb-0 bg-gray-50 dark:bg-black transition-colors duration-300">
          {/* White scrollable container – rounded top, flush bottom, no scrollbar */}
          <div className="h-full bg-white dark:bg-[#111111] rounded-t-2xl overflow-y-auto scrollbar-hide border border-b-0 border-gray-200 dark:border-white/[0.06] shadow-sm dark:shadow-none">
            {isPending ? (
              <div className="flex items-center justify-center min-h-[200px] text-gray-500 dark:text-white/50">
                <p>Edits are disabled while your course is under admin review.</p>
              </div>
            ) : (
              <EditorTabPanels />
            )}
          </div>
        </div>
      </div>
      <EditorModals />
    </div>
  );
}

/**
 * Course Editor container. All logic in useCourseEditor; UI uses EditorContext to avoid prop drilling.
 */
const CourseEditor = () => {
  const editor = useCourseEditor();

  if (editor.isLoadingData) {
    return <EditorLoadingScreen />;
  }

  return (
    <EditorProvider value={editor}>
      <CourseEditorContent />
    </EditorProvider>
  );
};

export default CourseEditor;
