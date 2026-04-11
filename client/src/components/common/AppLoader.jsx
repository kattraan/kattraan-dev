import React from 'react';
import { LOADING } from '@/utils/constants';

/**
 * Full-screen loading screen. Used by App (auth check) and Suspense fallback.
 */
function AppLoader({ message = LOADING.APP }) {
  return (
    <div className="min-h-screen bg-[#0c091a] flex items-center justify-center text-white" role="status" aria-live="polite">
      {message}
    </div>
  );
}

export default AppLoader;
