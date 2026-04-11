import React, { useRef, useEffect, useCallback } from 'react';
import { Bold, Italic, List, ListOrdered } from 'lucide-react';
import {
  sanitizeCourseDescriptionHtml,
  courseDescriptionToEditorHtml,
} from '@/utils/courseDescriptionHtml';

/**
 * Rich course description: bullet / numbered lists via execCommand.
 * Value is sanitized HTML string.
 */
const CourseDescriptionRichEditor = ({
  value,
  onChange,
  placeholder = 'Describe what learners will learn in this course...',
  className = '',
}) => {
  const editorRef = useRef(null);
  const focusedRef = useRef(false);

  const syncFromValue = useCallback(() => {
    const el = editorRef.current;
    if (!el || focusedRef.current) return;
    const displayHtml = courseDescriptionToEditorHtml(value);
    if (el.innerHTML !== displayHtml) {
      el.innerHTML = displayHtml;
    }
  }, [value]);

  useEffect(() => {
    syncFromValue();
  }, [syncFromValue]);

  const runFormat = (e, command) => {
    e.preventDefault();
    const el = editorRef.current;
    if (!el) return;
    el.focus();
    document.execCommand(command, false, null);
    onChange(sanitizeCourseDescriptionHtml(el.innerHTML));
  };

  const handleInput = () => {
    const el = editorRef.current;
    if (!el) return;
    onChange(sanitizeCourseDescriptionHtml(el.innerHTML));
  };

  return (
    <div
      className={`rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#3A3A3A] overflow-hidden focus-within:border-primary-pink transition-all duration-300 ${className}`}
    >
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-gray-200 dark:border-white/10 bg-gray-100/80 dark:bg-white/[0.04]">
        <button
          type="button"
          onMouseDown={(e) => runFormat(e, 'bold')}
          className="p-2 rounded-lg text-gray-700 dark:text-white/80 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
          title="Bold"
          aria-label="Bold"
        >
          <Bold size={16} />
        </button>
        <button
          type="button"
          onMouseDown={(e) => runFormat(e, 'italic')}
          className="p-2 rounded-lg text-gray-700 dark:text-white/80 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
          title="Italic"
          aria-label="Italic"
        >
          <Italic size={16} />
        </button>
        <button
          type="button"
          onMouseDown={(e) => runFormat(e, 'insertUnorderedList')}
          className="p-2 rounded-lg text-gray-700 dark:text-white/80 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
          title="Bullet list"
          aria-label="Bullet list"
        >
          <List size={16} />
        </button>
        <button
          type="button"
          onMouseDown={(e) => runFormat(e, 'insertOrderedList')}
          className="p-2 rounded-lg text-gray-700 dark:text-white/80 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
          title="Numbered list"
          aria-label="Numbered list"
        >
          <ListOrdered size={16} />
        </button>
        <span className="ml-auto text-[10px] text-gray-500 dark:text-white/35 pr-1 hidden sm:inline">
          Bullet or numbered list for multiple points
        </span>
      </div>
      <div
        ref={editorRef}
        role="textbox"
        tabIndex={0}
        aria-multiline="true"
        aria-label="Course description"
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={handleInput}
        onFocus={() => {
          focusedRef.current = true;
        }}
        onBlur={() => {
          focusedRef.current = false;
        }}
        className="min-h-[220px] max-h-[min(50vh,420px)] overflow-y-auto px-4 py-3 text-gray-900 dark:text-white text-[15px] leading-relaxed outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 empty:before:dark:text-white/25 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-2 [&_li]:my-1 [&_a]:text-primary-pink [&_a]:underline [scrollbar-width:thin] [scrollbar-color:#e2e2e2_transparent] dark:[scrollbar-color:rgba(255,255,255,0.15)_transparent] [&::-webkit-scrollbar]:w-[5px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full dark:[&::-webkit-scrollbar-thumb]:bg-white/20"
      />
    </div>
  );
};

export default CourseDescriptionRichEditor;
