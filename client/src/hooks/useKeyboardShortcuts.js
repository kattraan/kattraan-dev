import { useEffect, useCallback } from 'react';

/**
 * Keyboard shortcuts for video player. Only active when containerRef is focused or document has no focused input/textarea.
 *
 * @param {React.RefObject<HTMLElement>} containerRef - Player container (for focus check)
 * @param {{
 *   onPlayPause: () => void,
 *   onSeekForward: () => void,
 *   onSeekBackward: () => void,
 *   onFullscreen: () => void,
 *   onMute: () => void,
 * }} handlers
 */
export function useKeyboardShortcuts(containerRef, handlers) {
  const {
    onPlayPause,
    onSeekForward,
    onSeekBackward,
    onFullscreen,
    onMute,
  } = handlers || {};

  const handleKeyDown = useCallback(
    (e) => {
      const target = e.target;
      const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
      if (isInput) return;

      const container = containerRef?.current;
      const focusInPlayer = container && container.contains(document.activeElement);
      const bodyFocused = document.activeElement === document.body;
      if (!focusInPlayer && !bodyFocused) return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          onPlayPause?.();
          break;
        case 'ArrowRight':
          e.preventDefault();
          onSeekForward?.();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          onSeekBackward?.();
          break;
        case 'KeyF':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            onFullscreen?.();
          }
          break;
        case 'KeyM':
          e.preventDefault();
          onMute?.();
          break;
        default:
          break;
      }
    },
    [containerRef, onPlayPause, onSeekForward, onSeekBackward, onFullscreen, onMute]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
