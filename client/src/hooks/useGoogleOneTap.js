import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { googleOneTapLoginAction } from '@/features/auth/store/authSlice';
import { logger } from '@/utils/logger';

const useGoogleOneTap = (buttonElementId = null) => {
    const dispatch = useDispatch();
    const { isAuthenticated } = useSelector((state) => state.auth);

    useEffect(() => {
        // If already authenticated, do nothing
        if (isAuthenticated) return;

        // Prevent multiple simultaneous initializations
        if (window._googleOneTapInitialized && !buttonElementId) return;

        let checkInterval;

        const initializeOneTap = () => {
            if (window.google && window.google.accounts) {
                clearInterval(checkInterval);

                try {
                    window.google.accounts.id.initialize({
                        client_id: "970717026891-ajprfn2rn2af6jeal0jjm0s577bs363h.apps.googleusercontent.com",
                        callback: (response) => {
                            logger.debug("Google One Tap: Credential received");
                            dispatch(googleOneTapLoginAction(response.credential));
                        },
                        auto_select: false,
                        itp_support: true,
                        context: 'signin',
                        use_fedcm_for_prompt: false // Disable FedCM on localhost to prevent "Something went wrong" errors
                    });

                    window._googleOneTapInitialized = true;

                    // Support for the Google Sign-In button if an ID is provided
                    if (buttonElementId) {
                        const targetElem = document.getElementById(buttonElementId);
                        if (targetElem) {
                            window.google.accounts.id.renderButton(
                                targetElem,
                                {
                                    theme: "outline",
                                    size: "large",
                                    type: "standard",
                                    shape: "pill",
                                    text: "continue_with",
                                    width: targetElem.clientWidth || 400
                                }
                            );
                        }
                    }

                    // Only trigger the prompt if we haven't already or if we are the main prompter
                    window.google.accounts.id.prompt((notification) => {
                        if (notification.isNotDisplayed()) {
                            const reason = notification.getNotDisplayedReason();
                            logger.warn("One Tap excluded:", reason);
                            if (reason === 'origin_mismatch') {
                                logger.error("CRITICAL: Authorized JavaScript Origins mismatch. Please add " + window.location.origin + " to your Google Cloud Console.");
                            }
                        }
                        if (notification.isSkippedMoment()) {
                            logger.warn("One Tap skipped:", notification.getSkippedReason());
                        }
                        if (notification.isDismissedMoment()) {
                            logger.debug("One Tap dismissed:", notification.getDismissedReason());
                        }
                    });
                } catch (err) {
                    logger.error("Google One Tap initialization error:", err);
                }
            }
        };

        checkInterval = setInterval(initializeOneTap, 1000);
        return () => clearInterval(checkInterval);
    }, [isAuthenticated, dispatch, buttonElementId]);
};

export default useGoogleOneTap;
