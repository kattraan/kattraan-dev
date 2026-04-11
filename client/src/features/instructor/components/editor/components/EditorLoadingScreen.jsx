import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Full-screen loading state for the course editor.
 * Memoized to avoid re-renders; no props.
 */
const EditorLoadingScreen = React.memo(function EditorLoadingScreen() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0c091a] flex flex-col items-center justify-center gap-4 transition-colors duration-300">
      <Loader2 className="w-10 h-10 text-primary-pink animate-spin" />
      <p className="text-gray-500 dark:text-white/40 font-bold uppercase tracking-widest text-xs transition-colors duration-300">
        Loading Editor...
      </p>
    </div>
  );
});

export default EditorLoadingScreen;
