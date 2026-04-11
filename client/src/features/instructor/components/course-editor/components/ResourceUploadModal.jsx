import React, { useRef, useState } from 'react';
import { X, Upload, FileText } from 'lucide-react';

/**
 * "Upload files" modal: single option – Upload from Computer.
 * Styled to match app theme.
 */
const ResourceUploadModal = ({ isOpen, onClose, content, onSave, isSaving }) => {
  const fileInputRef = useRef(null);
  const [selectedFiles, setSelectedFiles] = useState([]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (selectedFiles.length === 0) return;
    onSave(content._id, selectedFiles);
    setSelectedFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClose = () => {
    setSelectedFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative w-full max-w-lg bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-white/5">
          <h2 className="text-[17px] font-bold text-gray-900 dark:text-white tracking-tight">
            Upload files
          </h2>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-full text-gray-500 dark:text-white/40 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          {content?.title && (
            <p className="text-[13px] text-gray-500 dark:text-white/50 mb-4">Adding to: {content.title}</p>
          )}

          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-white/[0.02] hover:border-primary-pink/40 hover:bg-primary-pink/5 dark:hover:bg-primary-pink/10 transition-all text-gray-700 dark:text-white/80"
          >
            <div className="w-14 h-14 rounded-xl bg-gray-200 dark:bg-white/10 flex items-center justify-center text-gray-600 dark:text-white/60">
              <Upload size={28} />
            </div>
            <span className="text-[13px] font-bold text-center">Upload from Computer</span>
          </button>

          {selectedFiles.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-white/5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-white/40">
                Selected ({selectedFiles.length})
              </p>
              <ul className="space-y-1.5 max-h-32 overflow-y-auto">
                {selectedFiles.map((file, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg"
                  >
                    <FileText size={14} className="text-primary-pink shrink-0" />
                    <span className="text-[12px] font-medium text-gray-800 dark:text-white/80 truncate flex-1">
                      {file.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(idx)}
                      className="text-gray-400 dark:text-white/40 hover:text-red-500 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </li>
                ))}
              </ul>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 py-2.5 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-700 dark:text-white/80 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors text-[13px] font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSaving}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#FF8C42] to-[#FF3FB4] hover:opacity-95 disabled:opacity-50 text-white text-[13px] font-bold transition-all shadow-md shadow-primary-pink/20"
                >
                  {isSaving ? 'Adding…' : 'Add resources'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResourceUploadModal;
