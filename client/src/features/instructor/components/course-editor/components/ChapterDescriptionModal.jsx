import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Modal for editing chapter description (Tagmango-style).
 * Title "Chapter description", text area with placeholder, Cancel and Save.
 * Styled to match app theme (dark bg, primary gradient for Save).
 */
const ChapterDescriptionModal = ({ isOpen, onClose, content, onSave, isSaving }) => {
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (isOpen) setDescription(content?.description || '');
  }, [isOpen, content?.description]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (typeof onSave === 'function') await onSave(content?._id, description);
    // Parent typically closes modal after save
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-white/5">
          <h2 className="text-[17px] font-bold text-gray-900 dark:text-white tracking-tight">
            Chapter description
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-500 dark:text-white/40 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe this chapter and highlight what learners will achieve after completing it."
            rows={6}
            className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-[13px] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary-pink/40 focus:border-primary-pink/30 resize-none transition-colors"
          />
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-700 dark:text-white/80 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors text-[13px] font-bold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF8C42] to-[#FF3FB4] hover:opacity-95 disabled:opacity-50 text-white text-[13px] font-bold transition-all shadow-lg shadow-primary-pink/20"
            >
              {isSaving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChapterDescriptionModal;
