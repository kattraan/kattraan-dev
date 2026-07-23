import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  ShieldCheck,
  Lock,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Info,
} from 'lucide-react';
import { load as loadCashfree } from '@cashfreepayments/cashfree-js';
import apiClient from '@/api/apiClient';
import { useCurrency } from '@/context/CurrencyContext';
import { ROUTES } from '@/config/routes';
import { useToast } from '@/components/ui/Toast';
import { courseDescriptionPreviewText } from '@/utils/courseDescriptionHtml';

/**
 * CheckoutPage — handles Cashfree payment for a paid course.
 * Route: /checkout/:courseId
 */
export default function CheckoutPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const user = useSelector((state) => state.auth?.user);
  const { formatPrice, formatINR, userCurrency, convertFromINR } = useCurrency();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState(null);
  const [paid, setPaid] = useState(false);
  const [cashfreeTestMode, setCashfreeTestMode] = useState(false);

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
      .then((res) => setCashfreeTestMode(!!res.data?.testMode))
      .catch(() => setCashfreeTestMode(false));
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
          toast?.success('Payment successful! You are now enrolled.');
          localStorage.removeItem('cashfreePendingOrder');
        }
      })
      .catch(() => {
        setError('Payment completed, but verification did not finish. Please check My Courses or try again.');
      });
  }, [courseId, toast, userCurrency]);

  const handlePayment = useCallback(async () => {
    if (!course || paying) return;
    setPaying(true);
    setError(null);

    try {
      const displayAmt = convertFromINR(course.price);
      const { data } = await apiClient.post('/payment/cashfree/create-order', {
        courseId,
        displayCurrency: userCurrency,
        displayAmount: displayAmt,
      });

      if (!data.success) throw new Error(data.message || 'Failed to create order');

      const { paymentSessionId, orderId, displayAmount } = data;
      if (!paymentSessionId) throw new Error('Cashfree payment session was not returned.');

      localStorage.setItem('cashfreePendingOrder', JSON.stringify({ orderId, paymentSessionId, displayAmount }));

      const cashfree = await loadCashfree({ mode: cashfreeTestMode ? 'sandbox' : 'production' });
      await cashfree.checkout({ paymentSessionId, redirectTarget: '_self' });
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Something went wrong');
      setPaying(false);
    }
  }, [course, courseId, paying, userCurrency, convertFromINR, user, toast, cashfreeTestMode]);

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
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#ed85b4] to-[#c1269d] text-white font-semibold hover:opacity-90 transition-opacity mb-3"
          >
            Start Learning
          </button>
          <button
            onClick={() => navigate(ROUTES.DASHBOARD_MY_COURSES)}
            className="w-full py-3 rounded-xl border border-white/20 text-white/70 hover:text-white hover:bg-white/5 transition-all text-sm"
          >
            Go to My Courses
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
      <div className="border-b border-white/10 px-6 py-4 flex items-center gap-4">
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

      <div className="max-w-2xl mx-auto px-6 py-10">
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

        {cashfreeTestMode && (
          <div className="mb-6 flex gap-3 items-start p-4 bg-amber-500/10 border border-amber-500/35 rounded-xl text-amber-100/95 text-sm">
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-400" />
            <div className="space-y-3 min-w-0">
              <p className="font-semibold text-amber-200">Cashfree test mode</p>
              <p className="text-white/80 text-xs leading-relaxed">
                Checkout will open in a new tab. Use Cashfree&apos;s sandbox test payment methods to complete the flow and then return here to continue.
              </p>
            </div>
          </div>
        )}

        {/* Pay button */}
        <button
          onClick={handlePayment}
          disabled={paying}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-[#ed85b4] to-[#c1269d] text-white font-bold text-base hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-pink-900/30"
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
        <div className="mt-6 flex items-center justify-center gap-2 text-white/30 text-xs">
          <ShieldCheck className="w-4 h-4" />
          <span>Secured by Cashfree · 30-day money-back guarantee</span>
        </div>
      </div>
    </div>
  );
}
