import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  ShieldCheck,
  Lock,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Info,
  Phone,
  X,
} from 'lucide-react';
import { load as loadCashfree } from '@cashfreepayments/cashfree-js';
import apiClient from '@/api/apiClient';
import { useCurrency } from '@/context/CurrencyContext';
import { ROUTES } from '@/config/routes';
import { useToast } from '@/components/ui/Toast';
import { courseDescriptionPreviewText } from '@/utils/courseDescriptionHtml';
import { updateProfile } from '@/features/auth/store/authSlice';
import { notifyEnrollmentChanged } from '@/features/learner/services/learnerCoursesService';

function isLocalDevHost() {
  if (typeof window === 'undefined') return false;
  return ['localhost', '127.0.0.1'].includes(window.location.hostname);
}

function localProductionCheckoutError() {
  return 'Production Cashfree checkout cannot run on localhost. Test on https://www.kattraan.com, or enable CASHFREE_MOCK=true / sandbox keys for local development.';
}
/** Valid Indian mobiles: 10 digits starting with 6–9 (or +91 / 91 prefix). */
function normalizeIndianPhone(phone) {
  let digits = String(phone || '').replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
  if (digits.length === 10 && /^[6-9]/.test(digits)) return `+91${digits}`;
  return null;
}

function digitsOnlyPhone(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  if (digits.length === 10) return digits;
  return digits.slice(-10);
}

/**
 * CheckoutPage — handles Cashfree payment for a paid course.
 * Route: /checkout/:courseId
 */
export default function CheckoutPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const toast = useToast();
  const user = useSelector((state) => state.auth?.user);
  const { formatPrice, formatINR, userCurrency, convertFromINR } = useCurrency();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState(null);
  const [paid, setPaid] = useState(false);
  const [cashfreeTestMode, setCashfreeTestMode] = useState(false);
  const [cashfreeMockMode, setCashfreeMockMode] = useState(false);
  const [cashfreeProductionMode, setCashfreeProductionMode] = useState(false);
  const [showPhonePopup, setShowPhonePopup] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  const [phoneError, setPhoneError] = useState(null);
  const [savingPhone, setSavingPhone] = useState(false);

  // Load course details
  useEffect(() => {
    if (!courseId) return;
    setLoading(true);
    apiClient.get(`/courses/${courseId}`)
      .then((res) => {
        const data = res.data?.data || res.data;
        setCourse(data);
      })
      .catch(() => setError('Failed to load course details. Please go back and try again.'))
      .finally(() => setLoading(false));
  }, [courseId]);

  useEffect(() => {
    apiClient
      .get('/payment/cashfree/mode')
      .then((res) => {
        setCashfreeTestMode(!!res.data?.testMode);
        setCashfreeMockMode(!!res.data?.mock);
        setCashfreeProductionMode(!!res.data?.productionMode);
      })
      .catch(() => {
        setCashfreeTestMode(false);
        setCashfreeMockMode(false);
        setCashfreeProductionMode(false);
      });
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get('payment');
    const orderId = params.get('orderId');
    if (paymentStatus !== 'success' || !orderId) return;

    const pendingOrder = localStorage.getItem('cashfreePendingOrder');
    if (!pendingOrder) {
      setError('Payment return is missing local order details. Please check My Courses or contact support.');
      return;
    }

    let parsed;
    try {
      parsed = JSON.parse(pendingOrder);
    } catch {
      localStorage.removeItem('cashfreePendingOrder');
      setError('Saved payment details were invalid. Please check My Courses or try again.');
      return;
    }

    if (!parsed.paymentSessionId || !parsed.orderId) {
      localStorage.removeItem('cashfreePendingOrder');
      setError('Saved payment details were incomplete. Please check My Courses or try again.');
      return;
    }

    if (String(parsed.orderId) !== String(orderId)) {
      localStorage.removeItem('cashfreePendingOrder');
      setError('Payment order mismatch. Please check My Courses or start checkout again.');
      return;
    }

    apiClient.post('/payment/cashfree/verify', {
      orderId,
      paymentSessionId: parsed.paymentSessionId,
      courseId,
      displayCurrency: userCurrency,
      displayAmount: parsed.displayAmount,
    })
      .then((verifyRes) => {
        if (verifyRes.data.success) {
          setPaid(true);
          notifyEnrollmentChanged();
          toast?.success('Payment successful! You are now enrolled.');
          localStorage.removeItem('cashfreePendingOrder');
        }
      })
      .catch(() => {
        setError('Payment completed, but verification did not finish. Please check My Courses or try again.');
      });
  }, [courseId, toast, userCurrency]);

  const openPhonePopup = useCallback(() => {
    const existing = user?.phoneNumber || user?.phone || user?.mobile || '';
    setPhoneInput(digitsOnlyPhone(existing));
    setPhoneError(null);
    setShowPhonePopup(true);
  }, [user]);

  const startCheckout = useCallback(async ({ fromPhoneModal = false } = {}) => {
    if (!course || paying) return;

    const onLocalhostProduction =
      isLocalDevHost() && cashfreeProductionMode && !cashfreeMockMode && !cashfreeTestMode;
    if (onLocalhostProduction) {
      const message = localProductionCheckoutError();
      setPaying(false);
      if (fromPhoneModal) {
        setPhoneError(message);
        setShowPhonePopup(true);
        setError(null);
      } else {
        setError(message);
      }
      return;
    }

    setPaying(true);
    setError(null);
    if (!fromPhoneModal) setShowPhonePopup(false);

    try {
      const displayAmt = convertFromINR(course.price);
      const { data } = await apiClient.post('/payment/cashfree/create-order', {
        courseId,
        displayCurrency: userCurrency,
        displayAmount: displayAmt,
        returnOrigin: window.location.origin,
      });

      if (!data.success) throw new Error(data.message || 'Failed to create order');

      const { paymentSessionId, orderId, displayAmount, mock } = data;
      if (!paymentSessionId) throw new Error('Cashfree payment session was not returned.');

      localStorage.setItem('cashfreePendingOrder', JSON.stringify({ orderId, paymentSessionId, displayAmount }));
      setShowPhonePopup(false);

      // Local mock: skip Cashfree checkout UI and verify immediately.
      if (mock || cashfreeMockMode || String(paymentSessionId).startsWith('mock_session_')) {
        const verifyRes = await apiClient.post('/payment/cashfree/verify', {
          orderId,
          paymentSessionId,
          courseId,
          displayCurrency: userCurrency,
          displayAmount,
        });
        if (!verifyRes.data?.success) {
          throw new Error(verifyRes.data?.message || 'Mock payment verification failed');
        }
        localStorage.removeItem('cashfreePendingOrder');
        setPaid(true);
        notifyEnrollmentChanged();
        toast?.success('Payment successful! You are now enrolled.');
        setPaying(false);
        return;
      }

      const cashfreeSdk = await loadCashfree({ mode: cashfreeTestMode ? 'sandbox' : 'production' });
      await cashfreeSdk.checkout({ paymentSessionId, redirectTarget: '_self' });
    } catch (err) {
      const message = err?.response?.data?.message || err.message || 'Something went wrong';
      const isPhoneIssue = /phone|mobile/i.test(message);
      setPaying(false);

      if (fromPhoneModal || isPhoneIssue) {
        setPhoneError(
          isPhoneIssue
            ? 'Enter a valid 10-digit Indian mobile number starting with 6–9.'
            : message,
        );
        setShowPhonePopup(true);
        setError(null);
      } else {
        setError(message);
      }
    }
  }, [course, courseId, paying, userCurrency, convertFromINR, cashfreeTestMode, cashfreeMockMode, cashfreeProductionMode, toast]);

  const handlePayment = useCallback(() => {
    if (!course || paying || savingPhone) return;
    const existing = user?.phoneNumber || user?.phone || user?.mobile || '';
    if (!normalizeIndianPhone(existing)) {
      openPhonePopup();
      return;
    }
    startCheckout();
  }, [course, paying, savingPhone, user, openPhonePopup, startCheckout]);

  const handlePhoneSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!user?._id || savingPhone || paying) return;

    const normalized = normalizeIndianPhone(phoneInput);
    if (!normalized) {
      setPhoneError('Enter a valid 10-digit Indian mobile number starting with 6–9.');
      return;
    }

    setSavingPhone(true);
    setPhoneError(null);
    setError(null);

    try {
      await dispatch(updateProfile({
        userId: user._id,
        payload: { phoneNumber: normalized },
      })).unwrap();
      await startCheckout({ fromPhoneModal: true });
    } catch (err) {
      setPhoneError(typeof err === 'string' ? err : 'Could not save phone number. Please try again.');
      setShowPhonePopup(true);
    } finally {
      setSavingPhone(false);
    }
  }, [user, savingPhone, paying, phoneInput, dispatch, startCheckout]);

  // ─── Paid success screen ─────────────────────────────────────────────────
  if (paid) {
    return (
      <div className="min-h-screen bg-[#0c091a] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Payment Successful!</h1>
          <p className="text-white/60 mb-8">
            You are now enrolled in <span className="text-white font-medium">{course?.title}</span>.
          </p>
          <button
            onClick={() => navigate(`${ROUTES.VIEW_COURSE}/${courseId}/watch`)}
            className="w-full py-3.5 rounded-xl btn-gradient font-semibold mb-3"
          >
            Start Learning
          </button>
          <button
            onClick={() => navigate(ROUTES.DASHBOARD)}
            className="w-full py-3 rounded-xl border border-white/20 text-white/70 hover:text-white hover:bg-white/5 transition-all text-sm"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ─── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0c091a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary-pink animate-spin" />
      </div>
    );
  }

  // ─── Error ────────────────────────────────────────────────────────────────
  if (!course && error) {
    return (
      <div className="min-h-screen bg-[#0c091a] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-white/70 mb-6">{error}</p>
          <button onClick={() => navigate(-1)} className="text-primary-pink hover:underline text-sm">
            ← Go back
          </button>
        </div>
      </div>
    );
  }

  const priceINR = Number(course?.price) || 0;
  const showLocalPrice = userCurrency !== 'INR';
  const localPrice = showLocalPrice ? convertFromINR(priceINR) : null;

  return (
    <div className="min-h-screen bg-[#0c091a] text-white">
      {/* Header */}
      <div className="border-b border-white/10 px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-3 sm:gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5 text-white/70" />
        </button>
        <span className="text-white/50 text-sm">Secure Checkout</span>
        <Lock className="w-4 h-4 text-white/40 ml-auto" />
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Course info */}
        <div className="flex gap-4 mb-8 p-4 bg-white/5 rounded-2xl border border-white/10">
          {course?.thumbnail && (
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-20 h-14 object-cover rounded-xl flex-shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-white text-base leading-snug truncate">{course?.title}</h2>
            <p className="text-white/50 text-xs mt-1 line-clamp-2">
              {courseDescriptionPreviewText(course?.description) || 'No description.'}
            </p>
          </div>
        </div>

        {/* Price breakdown */}
        <div className="mb-8 p-5 bg-white/5 rounded-2xl border border-white/10 space-y-3">
          <h3 className="font-bold text-white text-sm uppercase tracking-widest opacity-60 mb-4">Order Summary</h3>
          <div className="flex items-center justify-between">
            <span className="text-white/70 text-sm">Course price</span>
            <span className="text-white font-bold">{formatINR(priceINR)}</span>
          </div>
          {showLocalPrice && (
            <div className="flex items-center justify-between">
              <span className="text-white/50 text-xs">Approx. in {userCurrency}</span>
              <span className="text-white/70 text-sm font-medium">{formatPrice(priceINR)}</span>
            </div>
          )}
          <div className="border-t border-white/10 pt-3 flex items-center justify-between">
            <span className="text-white font-bold">Total charged</span>
            <span className="text-white font-black text-lg">{formatINR(priceINR)}</span>
          </div>
          <p className="text-white/40 text-[11px]">Payment is processed in INR via Cashfree. Your card may show a conversion fee if your bank account is in another currency.</p>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-6 flex gap-3 items-start p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {(cashfreeMockMode || cashfreeTestMode || (isLocalDevHost() && cashfreeProductionMode)) && (
          <div className="mb-6 flex gap-3 items-start p-4 bg-amber-500/10 border border-amber-500/35 rounded-xl text-amber-100/95 text-sm">
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-400" />
            <div className="space-y-3 min-w-0">
              <p className="font-semibold text-amber-200">
                {cashfreeMockMode
                  ? 'Local mock payments'
                  : cashfreeTestMode
                    ? 'Cashfree test mode'
                    : 'Localhost checkout blocked'}
              </p>
              <p className="text-white/80 text-xs leading-relaxed">
                {cashfreeMockMode
                  ? 'Cashfree API keys are not configured. Pay will enroll you locally without opening Cashfree. Add real sandbox keys and set CASHFREE_MOCK=false for real checkout.'
                  : cashfreeTestMode
                    ? "Checkout will open Cashfree's sandbox. Use their test payment methods, then return here to continue."
                    : localProductionCheckoutError()}
              </p>
            </div>
          </div>
        )}

        {/* Pay button */}
        <button
          onClick={handlePayment}
          disabled={paying || savingPhone}
          className="w-full py-4 rounded-xl btn-gradient font-bold text-base disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {paying ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing…
            </>
          ) : (
            <>
              <Lock className="w-4 h-4" />
              Pay {formatINR(priceINR)} securely
            </>
          )}
        </button>

        {/* Trust badges */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-2 text-white/30 text-xs text-center px-2">
          <ShieldCheck className="w-4 h-4 flex-shrink-0" />
          <span>Secured by Cashfree · 30-day money-back guarantee</span>
        </div>
      </div>

      {/* Phone number modal */}
      {showPhonePopup && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => {
            if (savingPhone || paying) return;
            setShowPhonePopup(false);
            setPhoneError(null);
          }}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-white/15 bg-[#161225] p-6 shadow-2xl shadow-black/50"
            role="dialog"
            aria-modal="true"
            aria-labelledby="checkout-phone-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-pink/15 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-primary-pink" />
                </div>
                <div>
                  <h3 id="checkout-phone-title" className="text-lg font-bold text-white">
                    Enter mobile number
                  </h3>
                  <p className="text-white/50 text-sm mt-0.5">
                    10 digits starting with 6–9
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (savingPhone || paying) return;
                  setShowPhonePopup(false);
                  setPhoneError(null);
                }}
                className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div className="flex rounded-xl border border-white/15 bg-white/5 overflow-hidden focus-within:ring-2 focus-within:ring-primary-pink/50 focus-within:border-primary-pink/40">
                <span className="px-4 py-3.5 text-sm font-semibold text-white/60 border-r border-white/10 select-none">
                  +91
                </span>
                <input
                  type="tel"
                  inputMode="numeric"
                  autoFocus
                  maxLength={10}
                  value={phoneInput}
                  onChange={(e) => {
                    setPhoneInput(e.target.value.replace(/\D/g, '').slice(0, 10));
                    setPhoneError(null);
                  }}
                  placeholder="10-digit mobile number"
                  className="flex-1 min-w-0 px-4 py-3.5 bg-transparent text-white text-base placeholder:text-white/30 focus:outline-none"
                  disabled={savingPhone || paying}
                />
              </div>

              {(phoneError || (error && /phone|mobile/i.test(error))) && (
                <p className="text-red-300 text-sm flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {phoneError || 'Enter a valid 10-digit Indian mobile number starting with 6–9.'}
                </p>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    if (savingPhone || paying) return;
                    setShowPhonePopup(false);
                    setPhoneError(null);
                  }}
                  className="flex-1 py-3 rounded-xl border border-white/15 text-white/70 font-semibold text-sm hover:bg-white/5 transition-colors disabled:opacity-50"
                  disabled={savingPhone || paying}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingPhone || paying || !normalizeIndianPhone(phoneInput)}
                  className="flex-[1.4] py-3 rounded-xl btn-gradient font-bold text-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {savingPhone || paying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {savingPhone ? 'Saving…' : 'Processing…'}
                    </>
                  ) : (
                    'Continue to payment'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
