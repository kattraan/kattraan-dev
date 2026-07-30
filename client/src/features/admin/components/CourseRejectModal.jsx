import React, { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';

/**
 * Modal for admin to reject a course with a required feedback comment.
 */
export default function CourseRejectModal({ isOpen, onClose, onConfirm, isLoading }) {
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (!isOpen) setReason('');
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60" onClick={onClose}>
      <div
        className="bg-white dark:bg-[#1a1625] rounded-2xl shadow-xl max-w-md w-full p-6 border border-gray-200 dark:border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Reject course</h3>
        <p className="text-sm text-gray-500 dark:text-white/50 mb-4">
          Tell the instructor what needs to be fixed before they can resubmit.
        </p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Add at least one quiz, improve the course description, and fix audio quality in lesson 2."
          className="w-full h-28 px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 resize-none focus:outline-none focus:border-primary-pink"
          autoFocus
        />
        <div className="flex gap-3 mt-4">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={() => onConfirm(reason)}
            disabled={!reason.trim() || isLoading}
            className="flex-1 bg-red-600 hover:bg-red-500 text-white border-0"
          >
            {isLoading ? 'Rejecting…' : 'Reject course'}
          </Button>
        </div>
      </div>
    </div>
  );
}
