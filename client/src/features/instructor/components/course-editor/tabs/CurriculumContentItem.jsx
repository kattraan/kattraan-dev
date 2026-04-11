import React, { useState, useCallback } from 'react';
import { PlayCircle, Headphones, ImageIcon, FileText, LinkIcon, FileEdit, Edit2, Trash2, Loader2, RefreshCw, Upload, Check, X, AlignLeft } from 'lucide-react';

/**
 * Memoized single content item (video, audio, quiz, article, image, link, resource) in curriculum.
 * Used inside chapter.contents.map to avoid re-rendering all items when parent state changes.
 * When uploadState is provided for a video, shows inline upload/processing progress or error + retry.
 */
const CurriculumContentItem = React.memo(function CurriculumContentItem({
  content,
  chapterId,
  onTriggerContent,
  onDeleteContent,
  onUpdateDescription,
  onOpenResourceUpload,
  uploadState,
  onRetryUpload,
}) {
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [localDesc, setLocalDesc] = useState(content.description ?? '');

  const handleDescSave = useCallback(() => {
    setIsEditingDesc(false);
    if (typeof onUpdateDescription === 'function') {
      onUpdateDescription(content._id, localDesc);
    }
  }, [content._id, localDesc, onUpdateDescription]);

  const handleDescCancel = useCallback(() => {
    setLocalDesc(content.description ?? '');
    setIsEditingDesc(false);
  }, [content.description]);
  const chId = chapterId;
  const isVideoUploading =
    content.type === 'video' &&
    uploadState &&
    ['uploading', 'processing', 'error'].includes(uploadState.status);

  if (content.type === 'quiz') {
    return (
      <div className="bg-gray-50 dark:bg-white/[0.03] backdrop-blur-xl rounded-2xl p-6 border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-lg group/quiz relative overflow-hidden hover:bg-gray-100 dark:hover:bg-white/[0.05] hover:border-primary-pink/30 dark:hover:border-primary-pink/30 transition-all duration-500">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-pink/5 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-center justify-between relative z-10">
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-lg bg-primary-pink/10 dark:bg-primary-pink/20 flex items-center justify-center text-primary-pink border border-primary-pink/20 transition-colors duration-300">
                  <FileText size={16} />
                </div>
                <h4 className="text-[16px] font-bold text-gray-900 dark:text-white tracking-tight transition-colors duration-300">{content.title || 'Untitled Assignment'}</h4>
              </div>
              <div className="flex items-center gap-4 text-gray-500 dark:text-white/40 text-[11px] font-black uppercase tracking-[0.2em] ml-10 transition-colors duration-300">
                <div className="flex items-center gap-2">
                  <span>Question(s):</span>
                  <span className="text-gray-900 dark:text-white transition-colors duration-300">{content.questions?.length || 0}</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-gray-300 dark:bg-white/10 transition-colors duration-300" />
                <div className="flex items-center gap-2">
                  <span>Total marks:</span>
                  <span className="text-primary-pink">{content.questions?.reduce((s, q) => s + (q.marks || 1), 0) || 0}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); onTriggerContent('quiz', chId); }}
                className="px-6 py-2.5 rounded-xl bg-white dark:bg-white/[0.05] border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10 hover:border-primary-pink/50 text-gray-600 dark:text-white/60 hover:text-gray-900 dark:hover:text-white transition-all duration-300 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest shadow-sm dark:shadow-2xl group/edit"
                title="Edit Quiz"
              >
                <Edit2 size={14} className="group-hover/edit:text-primary-pink transition-colors" />
                Edit Assignment
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDeleteContent('quiz', content._id); }}
                className="w-10 h-10 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-transparent flex items-center justify-center text-gray-400 dark:text-white/20 hover:bg-red-50 dark:hover:bg-red-500/20 hover:text-red-500 transition-colors duration-300 shadow-sm dark:shadow-none"
                title="Delete Quiz"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#2A2A2A] rounded-xl p-4 border border-gray-200 dark:border-white/5 transition-colors duration-300 shadow-sm dark:shadow-none">
      <div className="space-y-4">
        {content.type === 'video' && (
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-4 flex items-center justify-between group/vcard hover:bg-gray-100 dark:hover:bg-white/[0.08] transition-all duration-300">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                {content.thumbnail && !isVideoUploading ? (
                  <div
                    onClick={(e) => { e.stopPropagation(); onTriggerContent('video', chId); }}
                    className="w-14 h-14 rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 shrink-0 cursor-pointer hover:opacity-80 hover:ring-2 hover:ring-primary-pink/40 transition-all duration-200"
                  >
                    <img src={content.thumbnail} alt={content.title} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-primary-pink/10 dark:bg-primary-pink/20 flex items-center justify-center text-primary-pink transition-colors duration-300 shrink-0">
                    {isVideoUploading && uploadState?.status !== 'error' ? (
                      <Loader2 size={24} className="animate-spin" />
                    ) : (
                      <PlayCircle size={24} />
                    )}
                  </div>
                )}
                <div className="overflow-hidden min-w-0">
                  <p className="text-[14px] font-bold text-gray-900 dark:text-white truncate max-w-[400px] transition-colors duration-300">
                    {uploadState?.title || content.title || 'Untitled Video'}
                  </p>
                  {isVideoUploading && uploadState ? (
                    <div className="mt-2 space-y-1.5">
                      <div className="flex items-center justify-between gap-2 text-[11px]">
                        <span className="font-bold uppercase tracking-wider text-gray-500 dark:text-white/40">
                          {(uploadState.status === 'uploading' && uploadState.progress < 100) && 'Uploading...'}
                          {(uploadState.status === 'processing' || (uploadState.status === 'uploading' && uploadState.progress >= 100)) && 'Processing...'}
                          {uploadState.status === 'error' && 'Upload failed. Retry.'}
                        </span>
                        {uploadState.status !== 'error' && (
                          <span className="font-black text-primary-pink tabular-nums">{uploadState.progress ?? 0}%</span>
                        )}
                      </div>
                      {(uploadState.status === 'uploading' || uploadState.status === 'processing') && (
                        <div className="h-1.5 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary-pink transition-all duration-300 ease-out"
                            style={{ width: `${uploadState.progress ?? 0}%` }}
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-[11px] font-black uppercase tracking-wider text-gray-500 dark:text-white/30 mt-0.5 transition-colors duration-300">
                      MP4 • {content.metadata?.fileSize ? (content.metadata.fileSize / (1024 * 1024)).toFixed(2) + ' MB' : 'Video Lesson'}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {uploadState?.status === 'error' && typeof onRetryUpload === 'function' && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onRetryUpload(content._id); }}
                    className="px-3 py-2 rounded-xl bg-primary-pink/10 hover:bg-primary-pink/20 border border-primary-pink/20 flex items-center gap-2 text-[12px] font-bold text-primary-pink transition-colors"
                  >
                    <RefreshCw size={14} /> Retry
                  </button>
                )}
                {!isVideoUploading && (
                  <>
                    <button onClick={(e) => { e.stopPropagation(); onTriggerContent('video', chId); }} className="w-10 h-10 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-transparent flex items-center justify-center text-gray-400 dark:text-white/20 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white transition-colors duration-300 shadow-sm dark:shadow-none"><Edit2 size={16} /></button>
                    <button onClick={(e) => { e.stopPropagation(); onDeleteContent('video', content._id); }} className="w-10 h-10 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-transparent flex items-center justify-center text-gray-400 dark:text-white/20 hover:bg-red-50 dark:hover:bg-red-500/20 hover:text-red-500 transition-colors duration-300 shadow-sm dark:shadow-none"><Trash2 size={16} /></button>
                  </>
                )}
              </div>
            </div>
            {/* Inline description + Upload resources */}
            {content._id && !String(content._id).startsWith('pending-') && (
              <>
                {/* Inline editable description */}
                <div
                  className="group/desc bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] rounded-xl overflow-hidden transition-all duration-200 hover:border-gray-200 dark:hover:border-white/10"
                  onClick={(e) => { e.stopPropagation(); if (!isEditingDesc) setIsEditingDesc(true); }}
                >
                  {isEditingDesc ? (
                    <div onClick={(e) => e.stopPropagation()}>
                      <textarea
                        autoFocus
                        rows={3}
                        className="w-full bg-transparent px-4 pt-3 pb-2 text-[13px] text-gray-700 dark:text-white/70 placeholder:text-gray-400 dark:placeholder:text-white/25 outline-none resize-none leading-relaxed [scrollbar-width:thin] [scrollbar-color:#e2e2e2_transparent] [&::-webkit-scrollbar]:w-[4px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full"
                        placeholder="Add a chapter description..."
                        value={localDesc}
                        onChange={(e) => setLocalDesc(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Escape') handleDescCancel();
                        }}
                      />
                      <div className="flex items-center justify-end gap-1.5 px-3 pb-2.5">
                        <button
                          onClick={handleDescCancel}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium text-gray-400 dark:text-white/35 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/8 transition-colors"
                        >
                          <X size={13} /> Cancel
                        </button>
                        <button
                          onClick={handleDescSave}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-gray-600 dark:text-white/60 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-white/8 hover:bg-gray-200 dark:hover:bg-white/15 transition-colors"
                        >
                          <Check size={13} /> Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3 px-4 py-3 cursor-text">
                      <AlignLeft size={14} className="mt-0.5 flex-shrink-0 text-gray-300 dark:text-white/20 group-hover/desc:text-gray-400 dark:group-hover/desc:text-white/35 transition-colors" />
                      <p className={`flex-1 text-[13px] leading-relaxed ${localDesc ? 'text-gray-600 dark:text-white/60' : 'text-gray-400 dark:text-white/25 italic'}`}>
                        {localDesc || 'Add a chapter description...'}
                      </p>
                      <Edit2 size={13} className="mt-0.5 flex-shrink-0 opacity-0 group-hover/desc:opacity-100 text-gray-400 dark:text-white/35 transition-opacity duration-150" />
                    </div>
                  )}
                </div>

                {/* Upload resources button */}
                {typeof onOpenResourceUpload === 'function' && (
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onOpenResourceUpload(content); }}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF8C42] to-[#FF3FB4] hover:opacity-95 text-white text-[13px] font-medium transition-all shadow-md shadow-primary-pink/20"
                    >
                      <Upload size={15} /> Upload resources
                    </button>
                  </div>
                )}

                {content.resources?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {content.resources.map((res, ridx) => (
                      <a key={ridx} href={res.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 bg-[#4A69FF]/5 hover:bg-[#4A69FF]/10 border border-[#4A69FF]/10 rounded-lg text-[#4A69FF] transition-all group/res">
                        <FileText size={14} className="group-hover/res:scale-110 transition-transform" />
                        <span className="text-[11px] font-bold truncate max-w-[140px]">{res.title}</span>
                      </a>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
        {content.type === 'audio' && (
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-4 flex items-center justify-between group/acard hover:bg-gray-100 dark:hover:bg-white/[0.08] transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#FF9F00]/10 dark:bg-[#FF9F00]/20 flex items-center justify-center text-[#FF9F00] transition-colors duration-300"><Headphones size={24} /></div>
                <div className="overflow-hidden">
                  <p className="text-[14px] font-bold text-gray-900 dark:text-white truncate max-w-[400px] transition-colors duration-300">{content.title || 'Untitled Audio'}</p>
                  <p className="text-[11px] font-black uppercase tracking-wider text-gray-500 dark:text-white/30 mt-0.5 transition-colors duration-300">Audio • {content.metadata?.fileSize ? (content.metadata.fileSize / (1024 * 1024)).toFixed(2) + ' MB' : 'Audio Lesson'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={(e) => { e.stopPropagation(); onTriggerContent('audio', chId); }} className="w-10 h-10 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-transparent flex items-center justify-center text-gray-400 dark:text-white/20 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white transition-colors duration-300 shadow-sm dark:shadow-none"><Edit2 size={16} /></button>
                <button onClick={(e) => { e.stopPropagation(); onDeleteContent('audio', content._id); }} className="w-10 h-10 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-transparent flex items-center justify-center text-gray-400 dark:text-white/20 hover:bg-red-50 dark:hover:bg-red-500/20 hover:text-red-500 transition-colors duration-300 shadow-sm dark:shadow-none"><Trash2 size={16} /></button>
              </div>
            </div>
          </div>
        )}
        {content.type === 'image' && (
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-4 flex items-center justify-between group/icard hover:bg-gray-100 dark:hover:bg-white/[0.08] transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#00C9FF]/10 dark:bg-[#00C9FF]/20 flex items-center justify-center text-[#00C9FF] transition-colors duration-300"><ImageIcon size={24} /></div>
                <div className="overflow-hidden">
                  <p className="text-[14px] font-bold text-gray-900 dark:text-white truncate max-w-[400px] transition-colors duration-300">{content.title || 'Untitled Image'}</p>
                  <p className="text-[11px] font-black uppercase tracking-wider text-gray-500 dark:text-white/30 mt-0.5 transition-colors duration-300">Image • {content.metadata?.fileSize ? (content.metadata.fileSize / (1024 * 1024)).toFixed(2) + ' MB' : 'Image Content'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={(e) => { e.stopPropagation(); onTriggerContent('image', chId); }} className="w-10 h-10 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-transparent flex items-center justify-center text-gray-400 dark:text-white/20 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white transition-colors duration-300 shadow-sm dark:shadow-none"><Edit2 size={16} /></button>
                <button onClick={(e) => { e.stopPropagation(); onDeleteContent('image', content._id); }} className="w-10 h-10 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-transparent flex items-center justify-center text-gray-400 dark:text-white/20 hover:bg-red-50 dark:hover:bg-red-500/20 hover:text-red-500 transition-colors duration-300 shadow-sm dark:shadow-none"><Trash2 size={16} /></button>
              </div>
            </div>
            {content.imageUrl && (
              <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 max-h-48">
                <img src={content.imageUrl} alt={content.title} className="w-full h-full object-contain bg-gray-100 dark:bg-black/30" loading="lazy" />
              </div>
            )}
            {/* Add description + Upload resources – below image (TagMango-style) */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onTriggerContent('image', chId); }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#2A2A2A] text-gray-800 dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 text-[13px] font-semibold transition-colors"
              >
                <Plus size={16} className="shrink-0" />
                <span className="whitespace-nowrap">Add description</span>
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onTriggerContent('image', chId); }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#3498DB] hover:bg-[#2980B9] text-white text-[13px] font-medium transition-colors shadow-sm"
              >
                <Upload size={16} /> Upload resources
              </button>
            </div>
          </div>
        )}
        {content.type === 'resource' && content.fileType === 'link' && (
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-4 flex items-center justify-between group/lcard hover:bg-gray-100 dark:hover:bg-white/[0.08] transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#4A69FF]/10 dark:bg-[#4A69FF]/20 flex items-center justify-center text-[#4A69FF] transition-colors duration-300"><LinkIcon size={24} /></div>
                <div className="overflow-hidden">
                  <p className="text-[14px] font-bold text-gray-900 dark:text-white truncate max-w-[400px] transition-colors duration-300">{content.title || 'External Link'}</p>
                  <p className="text-[11px] font-black uppercase tracking-wider text-gray-500 dark:text-white/30 mt-0.5 transition-colors duration-300 truncate max-w-[300px]">{content.fileUrl}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={(e) => { e.stopPropagation(); onTriggerContent('link', chId); }} className="w-10 h-10 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-transparent flex items-center justify-center text-gray-400 dark:text-white/20 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white transition-colors duration-300 shadow-sm dark:shadow-none"><Edit2 size={16} /></button>
                <button onClick={(e) => { e.stopPropagation(); onDeleteContent('resource', content._id); }} className="w-10 h-10 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-transparent flex items-center justify-center text-gray-400 dark:text-white/20 hover:bg-red-50 dark:hover:bg-red-500/20 hover:text-red-500 transition-colors duration-300 shadow-sm dark:shadow-none"><Trash2 size={16} /></button>
              </div>
            </div>
          </div>
        )}
        {content.type === 'resource' && content.fileType !== 'link' && (
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-4 flex items-center justify-between group/rcard hover:bg-gray-100 dark:hover:bg-white/[0.08] transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-300 ${content.fileType === 'pdf' ? 'bg-[#FF1E6D]/10 dark:bg-[#FF1E6D]/20 text-[#FF1E6D]' : 'bg-[#00D285]/10 dark:bg-[#00D285]/20 text-[#00D285]'}`}><FileText size={24} /></div>
                <div className="overflow-hidden">
                  <p className="text-[14px] font-bold text-gray-900 dark:text-white truncate max-w-[400px] transition-colors duration-300">{content.title || 'Untitled Document'}</p>
                  <p className="text-[11px] font-black uppercase tracking-wider text-gray-500 dark:text-white/30 mt-0.5 transition-colors duration-300">{content.fileType?.toUpperCase() || 'Document'} • {content.metadata?.fileSize ? (content.metadata.fileSize / (1024 * 1024)).toFixed(2) + ' MB' : 'File'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {content.fileUrl && (
                  <a href={content.fileUrl} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-transparent flex items-center gap-2 text-gray-500 dark:text-white/40 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white transition-colors duration-300 shadow-sm dark:shadow-none text-[12px] font-bold" onClick={(e) => e.stopPropagation()}><LinkIcon size={14} /> Open</a>
                )}
                <button onClick={(e) => { e.stopPropagation(); onDeleteContent('resource', content._id); }} className="w-10 h-10 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-transparent flex items-center justify-center text-gray-400 dark:text-white/20 hover:bg-red-50 dark:hover:bg-red-500/20 hover:text-red-500 transition-colors duration-300 shadow-sm dark:shadow-none"><Trash2 size={16} /></button>
              </div>
            </div>
          </div>
        )}
        {content.type === 'article' && (
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-4 flex items-center justify-between group/tcard hover:bg-gray-100 dark:hover:bg-white/[0.08] transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#FF4B2B]/10 dark:bg-[#FF4B2B]/20 flex items-center justify-center text-[#FF4B2B] transition-colors duration-300"><FileEdit size={24} /></div>
                <div className="overflow-hidden">
                  <p className="text-[14px] font-bold text-gray-900 dark:text-white truncate max-w-[400px] transition-colors duration-300">{content.title || 'Untitled Text'}</p>
                  <p className="text-[11px] font-black uppercase tracking-wider text-gray-500 dark:text-white/30 mt-0.5 transition-colors duration-300">Text Lesson • {content.body?.length || 0} characters</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={(e) => { e.stopPropagation(); onTriggerContent('article', chId); }} className="w-10 h-10 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-transparent flex items-center justify-center text-gray-400 dark:text-white/20 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white transition-colors duration-300 shadow-sm dark:shadow-none"><Edit2 size={16} /></button>
                <button onClick={(e) => { e.stopPropagation(); onDeleteContent('article', content._id); }} className="w-10 h-10 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-transparent flex items-center justify-center text-gray-400 dark:text-white/20 hover:bg-red-50 dark:hover:bg-red-500/20 hover:text-red-500 transition-colors duration-300 shadow-sm dark:shadow-none"><Trash2 size={16} /></button>
              </div>
            </div>
          </div>
        )}
        {!['quiz', 'video', 'audio', 'image', 'article', 'resource'].includes(content.type) && (
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-pink/10 dark:bg-primary-pink/20 flex items-center justify-center text-primary-pink border border-primary-pink/20 transition-colors duration-300"><FileText size={20} /></div>
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white transition-colors duration-300">{content.title || `${content.type} Content`}</p>
                {content.description && <p className="text-xs text-gray-500 dark:text-white/40 mt-0.5 transition-colors duration-300">{content.description}</p>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={(e) => { e.stopPropagation(); onTriggerContent('edit', chId); }} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 dark:text-white/40 hover:text-[#3498DB] transition-colors duration-300"><Edit2 size={14} /></button>
              <button onClick={(e) => { e.stopPropagation(); onDeleteContent(content.type, content._id); }} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-white/5 text-gray-400 dark:text-white/40 hover:text-red-500 transition-colors duration-300"><Trash2 size={14} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default CurriculumContentItem;
