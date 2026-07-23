import React, { useEffect, useState } from 'react';
import { renderCertificateToDataUrl } from '@/features/courses/utils/renderCertificate';

/**
 * Renders a scaled certificate preview using the same template + layout as the PDF download.
 */
export default function CertificatePreview({
  courseTitle,
  learnerName,
  instructorName,
  issuedDate,
  durationMinutes,
  layout,
  className = '',
}) {
  const [src, setSrc] = useState('');
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setFailed(false);
    setSrc('');

    renderCertificateToDataUrl(
      {
        courseTitle,
        learnerName,
        instructorName,
        issuedDate,
        durationMinutes,
      },
      layout ? { layout } : undefined,
    )
      .then((url) => {
        if (!cancelled) setSrc(url);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [courseTitle, learnerName, instructorName, issuedDate, durationMinutes, layout]);

  if (failed) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 dark:bg-white/5 text-gray-400 text-sm ${className}`}>
        Preview unavailable
      </div>
    );
  }

  if (!src) {
    return (
      <div className={`animate-pulse bg-gray-100 dark:bg-white/5 ${className}`} />
    );
  }

  return (
    <img
      src={src}
      alt={`Certificate for ${courseTitle || 'course'}`}
      className={`w-full h-full object-contain ${className}`}
      loading="lazy"
    />
  );
}
