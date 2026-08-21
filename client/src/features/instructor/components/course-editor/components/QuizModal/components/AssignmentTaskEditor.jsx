import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, Plus, Trash2, Link2, Type, FileUp, Check, Loader2, FileText } from 'lucide-react';
import courseService from '@/features/courses/services/courseService';
import FileTypePicker, {
  FILE_TYPE_OPTIONS,
  ALL_FILE_TYPE_IDS,
} from './FileTypePicker';

const SUBMISSION_FORMATS = [
  { id: 'text', label: 'Text', icon: Type },
  { id: 'file', label: 'File', icon: FileUp },
  { id: 'link', label: 'Link', icon: Link2 },
];

const FILE_TYPE_IDS = new Set(ALL_FILE_TYPE_IDS);

const fieldLabel = 'text-sm font-bold text-gray-500 dark:text-white/60';
const fieldInput =
  'w-full h-12 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-xl px-4 text-[13px] font-bold text-gray-900 dark:text-white focus:border-primary-pink focus:ring-1 focus:ring-primary-pink/25 focus:bg-white dark:focus:bg-[#222222] focus:outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-white/30';
const fieldArea =
  'w-full bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-[13px] font-medium text-gray-800 dark:text-white/80 focus:border-primary-pink focus:ring-1 focus:ring-primary-pink/25 focus:bg-white dark:focus:bg-[#222222] focus:outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-white/30 resize-y min-h-[96px] leading-relaxed';

const emptyAttachment = () => ({ id: `att-${Date.now()}`, label: '', url: '' });

function asStringArray(value, fallback = []) {
  if (Array.isArray(value)) return value.filter((v) => typeof v === 'string');
  if (typeof value === 'string' && value.trim()) return [value.trim()];
  return [...fallback];
}

function normalizeFormats(formats) {
  const list = asStringArray(formats);
  if (!list.length) {
    return { modes: [], fileTypes: [...ALL_FILE_TYPE_IDS] };
  }
  const modes = new Set();
  const fileTypes = new Set();
  list.forEach((f) => {
    if (f === 'text' || f === 'link') modes.add(f);
    else if (f === 'file') modes.add('file');
    else if (FILE_TYPE_IDS.has(f)) {
      modes.add('file');
      fileTypes.add(f);
    }
  });
  if (modes.has('file') && !fileTypes.size) {
    ALL_FILE_TYPE_IDS.forEach((id) => fileTypes.add(id));
  }
  return { modes: [...modes], fileTypes: [...fileTypes] };
}

function toSavePayload(task) {
  const evaluationCriteria = (task.criteriaText || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((label) => ({ label, description: '' }));

  const modes = asStringArray(task.submissionFormats);
  const fileTypes = asStringArray(task.fileTypes, ALL_FILE_TYPE_IDS);
  const formats = [
    ...modes.filter((m) => m === 'text' || m === 'link' || m === 'file'),
    ...(modes.includes('file') ? fileTypes : []),
  ];

  return {
    question: task.question,
    instructions: task.instructions,
    type: 'subjective',
    marks: task.marks,
    options: [],
    submissionFormats: formats,
    attachments: (task.attachments || []).filter((a) => a.label?.trim() || a.url?.trim()),
    evaluationCriteria,
  };
}

function acceptFromFileTypes(fileTypes = []) {
  const selected = FILE_TYPE_OPTIONS.filter((t) => fileTypes.includes(t.id));
  const list = selected.length ? selected : FILE_TYPE_OPTIONS;
  return list.map((t) => t.accept).join(',');
}

/**
 * Assignment task editor — File enables allowed-type picker + optional sample upload.
 */
const AssignmentTaskEditor = ({
  onCancel,
  onSave,
  initialData = null,
  onStateChange,
  courseId = null,
}) => {
  const getInitialState = useCallback(() => {
    if (initialData) {
      const criteria = (initialData.evaluationCriteria || [])
        .map((c) => (typeof c === 'string' ? c : c?.label || ''))
        .filter(Boolean);
      const { modes, fileTypes } = normalizeFormats(initialData.submissionFormats);
      return {
        question: initialData.question || '',
        instructions: initialData.instructions || '',
        type: 'subjective',
        marks: initialData.marks ?? 10,
        options: [],
        submissionFormats: modes,
        fileTypes,
        attachments:
          Array.isArray(initialData.attachments) && initialData.attachments.length
            ? initialData.attachments.map((a, i) => ({
                id: a.id || `att-${i}`,
                label: a.label || '',
                url: a.url || '',
              }))
            : [],
        criteriaText: criteria.join('\n'),
      };
    }
    return {
      question: '',
      instructions: '',
      type: 'subjective',
      marks: 10,
      options: [],
      submissionFormats: [],
      fileTypes: [...ALL_FILE_TYPE_IDS],
      attachments: [],
      criteriaText: '',
    };
  }, [initialData?.id]);

  const [task, setTask] = useState(getInitialState);
  const [showExtras, setShowExtras] = useState(
    () =>
      !!(
        initialData?.attachments?.length ||
        initialData?.evaluationCriteria?.some(
          (c) => c?.label?.trim?.() || (typeof c === 'string' && c.trim())
        )
      )
  );
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);
  const filePanelRef = useRef(null);
  const onStateChangeRef = useRef(onStateChange);
  onStateChangeRef.current = onStateChange;

  useEffect(() => {
    onStateChangeRef.current?.(toSavePayload(task));
  }, [task]);

  const toggleFormat = (id) => {
    const turningFileOn = id === 'file' && !asStringArray(task.submissionFormats).includes(id);

    setTask((prev) => {
      const current = asStringArray(prev.submissionFormats);
      const currentlyOn = current.includes(id);
      const next = currentlyOn ? current.filter((f) => f !== id) : [...current, id];
      const existingTypes = asStringArray(prev.fileTypes);

      return {
        ...prev,
        submissionFormats: next,
        fileTypes:
          next.includes('file') && existingTypes.length === 0
            ? [...ALL_FILE_TYPE_IDS]
            : existingTypes.length
              ? existingTypes
              : prev.fileTypes,
      };
    });

    if (id === 'file') setUploadError('');
    if (turningFileOn) {
      requestAnimationFrame(() => {
        filePanelRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'nearest' });
      });
    }
  };

  const removeFileMode = () => {
    setTask((prev) => ({
      ...prev,
      submissionFormats: asStringArray(prev.submissionFormats).filter((f) => f !== 'file'),
    }));
  };

  const setFileTypes = (nextTypes) => {
    setTask((prev) => ({
      ...prev,
      fileTypes: asStringArray(nextTypes, ALL_FILE_TYPE_IDS),
    }));
  };

  const openFilePicker = () => {
    setUploadError('');
    requestAnimationFrame(() => {
      fileInputRef.current?.click();
    });
  };

  const updateAttachment = (idx, key, value) => {
    setTask((prev) => {
      const attachments = [...(prev.attachments || [])];
      attachments[idx] = { ...attachments[idx], [key]: value };
      return { ...prev, attachments };
    });
  };

  const handleResourceFile = async (file) => {
    if (!file) return;
    if (!courseId) {
      setShowExtras(true);
      setTask((prev) => ({
        ...prev,
        attachments: [
          ...(prev.attachments || []),
          { id: `att-${Date.now()}`, label: file.name, url: '' },
        ],
      }));
      setUploadError(
        'Add the file URL in Resources, or reopen this course editor with a saved course to upload directly.'
      );
      return;
    }

    setUploading(true);
    setUploadError('');
    try {
      const res = await courseService.uploadMedia(file, courseId);
      if (!res?.success || !res?.data?.url) {
        throw new Error(res?.message || 'Upload failed');
      }
      setShowExtras(true);
      setTask((prev) => ({
        ...prev,
        attachments: [
          ...(prev.attachments || []),
          {
            id: `att-${Date.now()}`,
            label: file.name,
            url: res.data.url,
          },
        ],
      }));
    } catch (err) {
      setUploadError(err?.response?.data?.message || err?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = () => {
    onSave(toSavePayload(task));
  };

  const submissionFormats = asStringArray(task.submissionFormats);
  const fileTypes = asStringArray(task.fileTypes, ALL_FILE_TYPE_IDS);
  const fileSelected = submissionFormats.includes('file');

  return (
    <div className="w-full mb-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1f1f1f] p-4 sm:p-5 font-satoshi animate-in fade-in slide-in-from-bottom-2 duration-200">
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept={acceptFromFileTypes(fileTypes)}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleResourceFile(file);
          e.target.value = '';
        }}
      />

      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
            {initialData ? 'Edit task' : 'Add task'}
          </h3>
          <p className="text-[13px] text-gray-500 dark:text-white/45 mt-1">
            Tell learners what to submit and how you’ll grade it.
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="p-2 rounded-xl text-gray-400 dark:text-white/30 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
          aria-label="Close"
        >
          <X size={18} />
        </button>
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
          <label className={fieldLabel}>
            Task title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={task.question}
            onChange={(e) => setTask((p) => ({ ...p, question: e.target.value }))}
            placeholder="e.g. Case study write-up"
            className={fieldInput}
          />
        </div>

        <div className="space-y-2">
          <label className={fieldLabel}>Instructions</label>
          <textarea
            value={task.instructions}
            onChange={(e) => setTask((p) => ({ ...p, instructions: e.target.value }))}
            rows={4}
            placeholder="Steps, constraints, and what a good submission looks like…"
            className={fieldArea}
          />
        </div>

        <div className="space-y-3">
          <label className={fieldLabel}>Learners submit</label>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Submission formats">
            {SUBMISSION_FORMATS.map(({ id, label, icon: Icon }) => {
              const active = submissionFormats.includes(id);
              return (
                <button
                  key={id}
                  type="button"
                  aria-pressed={active}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleFormat(id);
                  }}
                  className={`chip-submit inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-[13px] font-bold transition-colors ${
                    active ? 'is-active' : ''
                  }`}
                >
                  {active ? (
                    <Check size={14} strokeWidth={2.5} />
                  ) : (
                    <Icon size={14} />
                  )}
                  <span className="chip-submit-label">{label}</span>
                </button>
              );
            })}
          </div>

          {fileSelected && (
            <div ref={filePanelRef} className="space-y-3 relative z-20">
              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    removeFileMode();
                  }}
                  className="text-[11px] font-bold text-gray-400 dark:text-white/40 hover:text-gray-900 dark:hover:text-white"
                >
                  Remove file submission
                </button>
              </div>

              <FileTypePicker value={fileTypes} onChange={setFileTypes} />

              <button
                type="button"
                disabled={uploading}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  openFilePicker();
                }}
                className="w-full rounded-xl border border-dashed border-gray-300 dark:border-white/20 bg-gray-50 dark:bg-[#1a1a1a] px-4 py-5 flex flex-col items-center gap-2 hover:border-primary-pink/50 hover:bg-gradient-to-r hover:from-[#FF8C42]/[0.06] hover:to-[#FF3FB4]/[0.06] transition-all disabled:opacity-60"
              >
                {uploading ? (
                  <Loader2 size={20} className="animate-spin text-primary-pink" />
                ) : (
                  <FileUp size={20} className="text-primary-pink" />
                )}
                <span className="text-[13px] font-bold text-gray-800 dark:text-white/80">
                  {uploading ? 'Uploading…' : 'Attach sample / template file'}
                </span>
                <span className="text-[11px] text-gray-400 dark:text-white/35">
                  Optional · Learners can download this while working · Max 50 MB
                </span>
              </button>

              {uploadError && (
                <p className="text-[12px] text-red-400 font-medium">{uploadError}</p>
              )}

              {(task.attachments || []).filter((a) => a.url || a.label).length > 0 && (
                <div className="space-y-2">
                  {(task.attachments || []).map((att, idx) => (
                    <div
                      key={att.id}
                      className="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#1a1a1a] px-3 py-2"
                    >
                      <FileText size={14} className="text-primary-pink shrink-0" />
                      {att.url ? (
                        <a
                          href={att.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 text-[12px] font-bold text-gradient-brand truncate hover:underline"
                        >
                          {att.label || att.url}
                        </a>
                      ) : (
                        <span className="flex-1 text-[12px] font-bold text-gray-600 dark:text-white/70 truncate">
                          {att.label || 'Untitled resource'}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setTask((p) => ({
                            ...p,
                            attachments: p.attachments.filter((_, i) => i !== idx),
                          }));
                        }}
                        className="p-1.5 text-red-400/50 hover:text-red-400"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <label className={`${fieldLabel} shrink-0`}>Points</label>
          <div className="relative w-24 h-11 rounded-xl field-brand-rest">
            <input
              type="number"
              min={0}
              value={task.marks}
              onChange={(e) =>
                setTask((p) => ({ ...p, marks: parseInt(e.target.value, 10) || 0 }))
              }
              className="absolute inset-0 w-full h-full bg-transparent px-3 text-center text-[15px] font-black text-transparent caret-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span
              aria-hidden
              className="field-brand-value pointer-events-none absolute inset-0 flex items-center justify-center text-[15px] font-black"
            >
              {task.marks}
            </span>
          </div>
        </div>

        {!showExtras ? (
          <button
            type="button"
            onClick={() => setShowExtras(true)}
            className="text-[13px] font-bold text-gray-500 dark:text-white/45 hover:text-transparent hover:bg-gradient-to-r hover:from-gradient-start hover:via-gradient-mid hover:to-gradient-end hover:bg-clip-text transition-colors"
          >
            + Add resources or grading criteria
          </button>
        ) : (
          <div className="space-y-5 pt-2 border-t border-gray-200 dark:border-white/10">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className={fieldLabel}>Resources</label>
                <button
                  type="button"
                  onClick={() =>
                    setTask((p) => ({
                      ...p,
                      attachments: [...(p.attachments || []), emptyAttachment()],
                    }))
                  }
                  className="inline-flex items-center gap-1 text-[12px] font-bold text-transparent bg-gradient-to-r from-gradient-start via-gradient-mid to-gradient-end bg-clip-text hover:opacity-80"
                >
                  <Plus size={14} /> Add link
                </button>
              </div>
              {(task.attachments || []).length === 0 ? (
                <p className="text-[12px] text-gray-400 dark:text-white/35">
                  Optional links to briefs, templates, or readings.
                </p>
              ) : (
                <div className="space-y-2">
                  {task.attachments.map((att, idx) => (
                    <div key={att.id} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={att.label}
                        onChange={(e) => updateAttachment(idx, 'label', e.target.value)}
                        placeholder="Label"
                        className={`${fieldInput} w-[32%] shrink-0`}
                      />
                      <input
                        type="url"
                        value={att.url}
                        onChange={(e) => updateAttachment(idx, 'url', e.target.value)}
                        placeholder="https://…"
                        className={`${fieldInput} flex-1`}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setTask((p) => ({
                            ...p,
                            attachments: p.attachments.filter((_, i) => i !== idx),
                          }))
                        }
                        className="p-3 rounded-xl text-red-400/50 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className={fieldLabel}>Grading criteria</label>
              <textarea
                value={task.criteriaText}
                onChange={(e) => setTask((p) => ({ ...p, criteriaText: e.target.value }))}
                rows={3}
                placeholder={'One criterion per line\ne.g. Clarity\nEvidence used'}
                className={fieldArea}
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-3 mt-7 pt-5 border-t border-gray-200 dark:border-white/10">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-[13px] font-bold text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="px-6 py-2.5 rounded-xl btn-gradient text-[13px] font-bold transition-all active:scale-[0.98]"
        >
          Save task
        </button>
      </div>
    </div>
  );
};

export default AssignmentTaskEditor;
