import React from 'react';
import { PlayCircle } from 'lucide-react';

export default function CourseViewPreviewVideo({ activeChapter, posterUrl }) {
  const videoContent = activeChapter?.contents?.find((c) => c.type === 'video');
  if (videoContent?.videoUrl) {
    return (
      <video key={videoContent.videoUrl} src={videoContent.videoUrl} className="w-full h-full object-contain" controls autoPlay poster={posterUrl} title={activeChapter?.title || 'Lesson video'} />
    );
  }
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-6">
      <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center animate-pulse">
        <PlayCircle size={48} className="text-white/10" aria-hidden />
      </div>
      <div className="text-center space-y-2">
        <h3 className="text-xl font-bold text-white/40">Lesson content not available</h3>
        <p className="text-sm text-white/20 px-12">This lesson might contain a quiz or resource instead of a video player.</p>
      </div>
    </div>
  );
}
