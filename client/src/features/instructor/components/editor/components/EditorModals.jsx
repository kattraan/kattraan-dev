import React from "react";
import {
  CourseViewPreview,
  QuizModal,
  VideoUploadModal,
  ResourceUploadModal,
  ArticleModal,
  LinkModal,
} from "@/features/instructor/components/course-editor";
import { useEditorContext } from "../context/EditorContext";

const EditorModals = React.memo(function EditorModals() {
  const {
    showCoursePreview,
    closeCoursePreview,
    courseDetails,
    isQuizModalOpen,
    closeQuizModal,
    handleSaveQuiz,
    quizChapterId,
    currentEditingQuiz,
    quizSectionName,
    quizChapterName,
    quizPreferredAssessmentMode,
    isVideoModalOpen,
    closeVideoModal,
    handleSaveVideo,
    isSaving,
    editingVideoContent,
    uploadingChapterTitle,
    engagementTemplates,
    resourceUploadContent,
    closeResourceUpload,
    handleSaveResources,
    isArticleModalOpen,
    closeArticleModal,
    handleSaveArticle,
    editingArticleContent,
    isLinkModalOpen,
    closeLinkModal,
    handleSaveLink,
    editingLinkContent,
  } = useEditorContext();

  return (
    <>
      <QuizModal
        isOpen={isQuizModalOpen}
        onClose={closeQuizModal}
        onSave={handleSaveQuiz}
        chapterId={quizChapterId}
        initialData={currentEditingQuiz}
        sectionName={quizSectionName}
        chapterName={quizChapterName}
        preferredAssessmentMode={quizPreferredAssessmentMode}
      />
      <CourseViewPreview
        isOpen={showCoursePreview}
        onClose={closeCoursePreview}
        courseData={courseDetails}
      />
      <VideoUploadModal
        isOpen={isVideoModalOpen}
        onClose={closeVideoModal}
        onSave={handleSaveVideo}
        isSaving={isSaving}
        existingContent={editingVideoContent}
        chapterTitle={uploadingChapterTitle}
        templates={engagementTemplates || []}
      />
      <ResourceUploadModal
        isOpen={!!resourceUploadContent}
        onClose={closeResourceUpload}
        content={resourceUploadContent}
        onSave={handleSaveResources}
        isSaving={isSaving}
      />
      <ArticleModal
        isOpen={isArticleModalOpen}
        isSaving={isSaving}
        onSave={handleSaveArticle}
        existingContent={editingArticleContent}
        onClose={closeArticleModal}
      />
      <LinkModal
        isOpen={isLinkModalOpen}
        isSaving={isSaving}
        onSave={handleSaveLink}
        existingContent={editingLinkContent}
        onClose={closeLinkModal}
      />
    </>
  );
});

export default EditorModals;
