import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { googleOneTapLoginAction } from '@/features/auth/store/authSlice';
import { logger } from '@/utils/logger';

const GSI_SRC = 'https://accounts.google.com/gsi/client';

function loadGoogleScript() {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.google?.accounts?.id) return Promise.resolve();
  if (window._gsiScriptPromise) return window._gsiScriptPromise;

  window._gsiScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${GSI_SRC}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', reject);
      if (window.google?.accounts?.id) resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = GSI_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = reject;
    document.head.appendChild(script);
  });

  return window._gsiScriptPromise;
}

const useGoogleOneTap = (buttonElementId = null) => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) return undefined;
    if (window._googleOneTapInitialized && !buttonElementId) return undefined;

    let cancelled = false;
    let idleId;

    const run = async () => {
      try {
        await loadGoogleScript();
        if (cancelled || !window.google?.accounts) return;

        window.google.accounts.id.initialize({
          client_id: '970717026891-ajprfn2rn2af6jeal0jjm0s577bs363h.apps.googleusercontent.com',
          callback: (response) => {
            logger.debug('Google One Tap: Credential received');
            dispatch(googleOneTapLoginAction(response.credential));
          },
          auto_select: false,
          itp_support: true,
          context: 'signin',
          use_fedcm_for_prompt: false,
        });

        window._googleOneTapInitialized = true;

        if (buttonElementId) {
          const targetElem = document.getElementById(buttonElementId);
          if (targetElem) {
            window.google.accounts.id.renderButton(targetElem, {
              theme: 'outline',
              size: 'large',
              type: 'standard',
              shape: 'pill',
              text: 'continue_with',
              width: targetElem.clientWidth || 400,
            });
          }
        }

        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed()) {
            const reason = notification.getNotDisplayedReason();
            logger.warn('One Tap excluded:', reason);
            if (reason === 'origin_mismatch') {
              logger.error(
                'CRITICAL: Authorized JavaScript Origins mismatch. Please add ' +
                  window.location.origin +
                  ' to your Google Cloud Console.',
              );
            }
          }
          if (notification.isSkippedMoment()) {
            logger.warn('One Tap skipped:', notification.getSkippedReason());
          }
          if (notification.isDismissedMoment()) {
            logger.debug('One Tap dismissed:', notification.getDismissedReason());
          }
        });
      } catch (err) {
        logger.error('Google One Tap initialization error:', err);
      }
    };

    // Defer until the browser is idle so hero/LCP isn't competing with GSI.
    if (typeof window.requestIdleCallback === 'function') {
      idleId = window.requestIdleCallback(() => run(), { timeout: 4000 });
    } else {
      idleId = window.setTimeout(run, 2000);
    }

    return () => {
      cancelled = true;
      if (typeof window.cancelIdleCallback === 'function' && typeof idleId === 'number') {
        window.cancelIdleCallback(idleId);
      } else {
        clearTimeout(idleId);
      }
    };
  }, [isAuthenticated, dispatch, buttonElementId]);
};

export default useGoogleOneTap;
