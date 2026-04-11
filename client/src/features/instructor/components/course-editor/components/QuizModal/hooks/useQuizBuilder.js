import { useState, useEffect, useRef, useCallback } from 'react';
import { logger } from '@/utils/logger';

const INITIAL_QUIZ_DATA = {
  title: '',
  description: '',
  passingPercentage: 75,
  enforcePassingGrade: false,
  enableCountdown: false,
  allowRetake: false,
  /** 'quiz' = in-course instant scoring; 'assignment' = graded via Assignments area */
  assessmentMode: 'quiz',
  questions: [],
};

function formatQuestionsFromInitial(initialQuestions, chapterName) {
  return (initialQuestions || []).map((q) => ({
    ...q,
    marks: q.marks || 1,
    id: q._id || q.id || `q-${Date.now()}-${Math.random()}`,
    options: (q.options || []).map((opt, oIdx) => {
      if (typeof opt === 'string') {
        return { id: `opt-${Date.now()}-${oIdx}`, content: opt, type: 'Text' };
      }
      const contentStr = typeof opt.content === 'string' ? opt.content : (typeof opt === 'string' ? opt : '');
      return {
        id: opt.id || `opt-${Date.now()}-${oIdx}`,
        content: contentStr,
        type: opt.type || 'Text',
      };
    }),
  }));
}

/**
 * Hook encapsulating all QuizModal business logic.
 * Manages quiz data, question CRUD, drag-and-drop, persistence.
 */
export function useQuizBuilder({
  isOpen,
  onClose,
  onSave,
  chapterId,
  initialData,
  chapterName,
  preferredAssessmentMode = 'quiz',
  toast,
}) {
  const [quizData, setQuizData] = useState(INITIAL_QUIZ_DATA);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isDescriptionFocused, setIsDescriptionFocused] = useState(false);
  const [tempDescription, setTempDescription] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [draggedItemIndex, setDraggedItemIndex] = useState(null);

  const initializedRef = useRef(false);
  const descRef = useRef(null);
  const pendingQuestionRef = useRef(null);

  useEffect(() => {
    if (isOpen && !initializedRef.current) {
      if (initialData) {
        const formattedQuestions = formatQuestionsFromInitial(initialData.questions, chapterName);
        setQuizData({
          title: initialData.title || chapterName || '',
          description: initialData.description || '',
          passingPercentage: initialData.metadata?.passingPercentage ?? 75,
          enforcePassingGrade: initialData.metadata?.enforcePassingGrade ?? false,
          enableCountdown: initialData.metadata?.enableCountdown ?? false,
          allowRetake: initialData.metadata?.allowRetake ?? false,
          assessmentMode:
            initialData.metadata?.assessmentMode === 'assignment'
              ? 'assignment'
              : 'quiz',
          questions: formattedQuestions,
        });
      } else {
        setQuizData({
          ...INITIAL_QUIZ_DATA,
          title: chapterName || '',
          assessmentMode: preferredAssessmentMode === 'assignment' ? 'assignment' : 'quiz',
        });
      }
      initializedRef.current = true;
    }
    if (!isOpen) {
      initializedRef.current = false;
    }
  }, [isOpen, initialData, chapterName, preferredAssessmentMode]);

  const persistQuiz = useCallback(
    async (updatedQuizData, shouldClose = false) => {
      if (isSaving) return;
        if (!updatedQuizData.title?.trim()) {
        toast?.error('Validation', 'Please enter an assignment title.');
        return;
      }
      if (updatedQuizData.questions.length === 0) {
        toast?.error('Validation', 'Please add at least one question.');
        return;
      }
      setIsSaving(true);
      try {
        const cleanQuizData = {
          ...updatedQuizData,
          questions: updatedQuizData.questions.map((q) => ({
            ...q,
            marks: Number(q.marks) || 1,
          })),
        };
        await onSave(chapterId, cleanQuizData);
        pendingQuestionRef.current = null;
        if (shouldClose) onClose();
      } catch (err) {
        logger.error('Persistence Failed:', err);
        toast?.error('Save Failed', 'Failed to save to database. Please check your connection.');
      } finally {
        setIsSaving(false);
      }
    },
    [chapterId, onSave, onClose, isSaving, toast]
  );

  const handleSaveNewQuestion = useCallback(
    async (newQ) => {
      if (!newQ.question?.trim()) {
        toast?.error('Validation', 'Please enter a question title.');
        return;
      }
      let newQuestions;
      if (editingQuestionId) {
        newQuestions = quizData.questions.map((q) =>
          q.id === editingQuestionId ? { ...newQ, id: editingQuestionId } : q
        );
        setEditingQuestionId(null);
      } else {
        const questionToSave = { ...newQ, id: `q-${Date.now()}-${Math.random()}` };
        newQuestions = [...quizData.questions, questionToSave];
        setIsAddingQuestion(false);
      }
      const updatedData = { ...quizData, questions: newQuestions };
      setQuizData(updatedData);
      await persistQuiz(updatedData, false);
    },
    [quizData, editingQuestionId, persistQuiz]
  );

  const handleDragStart = useCallback((e, index) => {
    setDraggedItemIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback(
    (e, index) => {
      e.preventDefault();
      if (draggedItemIndex === null || draggedItemIndex === index) return;
      setQuizData((p) => {
        const newQuestions = [...p.questions];
        const [itemToMove] = newQuestions.splice(draggedItemIndex, 1);
        newQuestions.splice(index, 0, itemToMove);
        return { ...p, questions: newQuestions };
      });
      setDraggedItemIndex(index);
    },
    [draggedItemIndex]
  );

  const handleDragEnd = useCallback(() => {
    setDraggedItemIndex(null);
  }, []);

  const handleCloneQuestion = useCallback((index) => {
    const questionToClone = quizData.questions[index];
    const clonedQuestion = {
      ...questionToClone,
      id: `q-${Date.now()}-${Math.random()}`,
      _id: undefined,
    };
    const newQuestions = [...quizData.questions];
    newQuestions.splice(index + 1, 0, clonedQuestion);
    setQuizData((p) => ({ ...p, questions: newQuestions }));
  }, [quizData.questions]);

  const handleEditQuestion = useCallback((id) => {
    setEditingQuestionId(id);
    setIsAddingQuestion(false);
  }, []);

  const startAdding = useCallback(() => {
    setEditingQuestionId(null);
    setIsAddingQuestion(true);
  }, []);

  const removeQuestion = useCallback(
    async (id) => {
      const updatedData = {
        ...quizData,
        questions: quizData.questions.filter((q) => q.id !== id),
      };
      setQuizData(updatedData);
      await persistQuiz(updatedData, false);
    },
    [quizData, persistQuiz]
  );

  const handleMainSave = useCallback(async () => {
    let finalQuestions = [...quizData.questions];
    if (pendingQuestionRef.current?.question?.trim()) {
      if (editingQuestionId) {
        finalQuestions = finalQuestions.map((q) =>
          q.id === editingQuestionId ? { ...pendingQuestionRef.current, id: editingQuestionId } : q
        );
      } else if (isAddingQuestion) {
        const alreadyPresent = finalQuestions.some(
          (q) =>
            q.question === pendingQuestionRef.current.question &&
            JSON.stringify(q.options) === JSON.stringify(pendingQuestionRef.current.options)
        );
        if (!alreadyPresent) {
          finalQuestions.push({ ...pendingQuestionRef.current, id: `q-auto-${Date.now()}` });
        }
      }
    }
    const finalQuizData = { ...quizData, questions: finalQuestions };
    await persistQuiz(finalQuizData, true);
  }, [quizData, editingQuestionId, isAddingQuestion, persistQuiz]);

  const cancelEdit = useCallback(() => {
    setEditingQuestionId(null);
    pendingQuestionRef.current = null;
  }, []);

  const cancelAdd = useCallback(() => {
    setIsAddingQuestion(false);
    pendingQuestionRef.current = null;
  }, []);

  const setPendingQuestion = useCallback((state) => {
    pendingQuestionRef.current = state;
  }, []);

  const totalMarks = quizData.questions.reduce((s, q) => s + (q.marks || 1), 0) + (isAddingQuestion ? (pendingQuestionRef.current?.marks || 1) : 0);

  return {
    quizData,
    setQuizData,
    isSaving,
    isAddingQuestion,
    editingQuestionId,
    showPreview,
    setShowPreview,
    isDescriptionFocused,
    setIsDescriptionFocused,
    tempDescription,
    setTempDescription,
    isImporting,
    setIsImporting,
    descRef,
    pendingQuestionRef,
    totalMarks,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleCloneQuestion,
    handleEditQuestion,
    handleSaveNewQuestion,
    startAdding,
    removeQuestion,
    handleMainSave,
    cancelEdit,
    cancelAdd,
    setPendingQuestion,
  };
}
