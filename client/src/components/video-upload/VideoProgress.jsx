import React from 'react';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

const STATUS_LABELS = {
  idle: 'Ready',
  creating: 'Preparing upload…',
  uploading: 'Uploading',
  processing: 'Processing',
  completed: 'Completed',
  error: 'Error',
};

/** Rough upload speed for estimate: 2 Mbps = 0.25 MB/s (conservative). */
const ESTIMATE_MB_PER_SEC = 0.25;

/**
 * Displays upload progress and status for a single file.
 * @param {object} props
 * @param {'idle'|'creating'|'uploading'|'processing'|'completed'|'error'} props.status
 * @param {number} props.progress - 0–100
 * @param {string} [props.errorMessage]
 * @param {string} [props.fileName]
 * @param {number} [props.fileSize] - bytes, for estimated time
 */
export function VideoProgress({ status, progress, errorMessage, fileName, fileSize }) {
  const estimatedSeconds =
    fileSize && status === 'uploading' && progress < 100
      ? Math.ceil((fileSize * (1 - progress / 100)) / (ESTIMATE_MB_PER_SEC * 1024 * 1024))
      : null;
  const estimatedLabel =
    estimatedSeconds != null && estimatedSeconds > 0
      ? estimatedSeconds >= 60
        ? `~${Math.ceil(estimatedSeconds / 60)} min left`
        : `~${estimatedSeconds} s left`
      : null;
  const isComplete = status === 'completed';
  const isError = status === 'error';
  const isActive = status === 'uploading' || status === 'processing' || status === 'creating';

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
      {(fileName || status !== 'idle') && (
        <p className="text-sm font-medium text-white/90 truncate" title={fileName}>
          {fileName || STATUS_LABELS[status] || status}
        </p>
      )}
      <div className="flex items-center gap-3">
        {isActive && (
          <Loader2 className="h-5 w-5 shrink-0 animate-spin text-primary-pink" aria-hidden />
        )}
        {isComplete && (
          <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500" aria-hidden />
        )}
        {isError && (
          <AlertCircle className="h-5 w-5 shrink-0 text-red-500" aria-hidden />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-white/70 uppercase tracking-wider">
            {isError ? errorMessage || 'Upload failed' : STATUS_LABELS[status] || status}
          </p>
          {(status === 'uploading' || status === 'creating') && (
            <>
              <div className="mt-2 h-2 w-full rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary-pink to-[#FF8C42] transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.round(progress))}%` }}
                  role="progressbar"
                  aria-valuenow={progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
              {estimatedLabel && (
                <p className="mt-1 text-[10px] text-white/50">{estimatedLabel}</p>
              )}
            </>
          )}
          {(status === 'processing' || status === 'completed') && status !== 'error' && (
            <div className="mt-2 h-2 w-full rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary-pink to-[#FF8C42]"
                style={{ width: status === 'completed' ? '100%' : '100%' }}
              />
            </div>
          )}
        </div>
        {!isError && status !== 'idle' && (
          <span className="text-sm font-bold text-white/90 tabular-nums">
            {status === 'completed' ? '100%' : `${Math.min(100, Math.round(progress))}%`}
          </span>
        )}
      </div>
    </div>
  );
}

export default VideoProgress;
