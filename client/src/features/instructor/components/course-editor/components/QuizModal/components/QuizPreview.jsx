import React from 'react';
import QuizLearnerPreview from '@/features/instructor/components/course-editor/components/QuizLearnerPreview';

/**
 * Wrapper for QuizLearnerPreview. Provides consistent API for the QuizModal structure.
 */
const QuizPreview = ({ quizData, onClose }) => (
  <QuizLearnerPreview quizData={quizData} onClose={onClose} />
);

export default QuizPreview;
