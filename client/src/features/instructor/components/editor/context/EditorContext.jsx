import React, { createContext, useContext } from 'react';

/**
 * Course editor context: provides useCourseEditor() return value to tab panels and modals
 * so we avoid prop drilling. CourseEditor provides; EditorTabPanels and EditorModals consume.
 */
const EditorContext = createContext(null);

export function useEditorContext() {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error('useEditorContext must be used within EditorProvider');
  return ctx;
}

export const EditorProvider = EditorContext.Provider;
