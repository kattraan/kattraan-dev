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
import apiClient from '@/api/apiClient';
import { useCurrency } from '@/context/CurrencyContext';
import { ROUTES } from '@/config/routes';
import { useToast } from '@/components/ui/Toast';

/**
 * CheckoutPage — handles Razorpay payment for a paid course.
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
  const [razorpayTestMode, setRazorpayTestMode] = useState(false);

  const RAZORPAY_TEST_DOCS =
    'https://razorpay.com/docs/payments/payments/test-card-upi-details/';

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
      .get('/payment/razorpay/mode')
      .then((res) => setRazorpayTestMode(!!res.data?.testMode))
      .catch(() => setRazorpayTestMode(false));
  }, []);

  // Preload Razorpay Checkout script (opened only after load succeeds in handlePayment)
  useEffect(() => {
    if (document.getElementById('razorpay-script')) return;
    const script = document.createElement('script');
    script.id = 'razorpay-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      const s = document.getElementById('razorpay-script');
      if (s) document.body.removeChild(s);
    };
  }, []);

  const handlePayment = useCallback(async () => {
    if (!course || paying) return;
    setPaying(true);
    setError(null);

    try {
      await new Promise((resolve, reject) => {
        if (typeof window !== 'undefined' && window.Razorpay) {
          resolve();
          return;
        }
        const existing = document.getElementById('razorpay-script');
        if (existing) {
          if (window.Razorpay) {
            resolve();
            return;
          }
          existing.addEventListener('load', () => {
            if (window.Razorpay) resolve();
            else reject(new Error('Payment widget failed to initialize. Refresh and try again.'));
          }, { once: true });
          existing.addEventListener(
            'error',
            () => reject(new Error('Could not load payment widget. Check your connection and try again.')),
            { once: true },
          );
          return;
        }
        reject(new Error('Payment widget is not ready. Refresh the page and try again.'));
      });

      // Step 1: Create Razorpay order on server
      const displayAmt = convertFromINR(course.price);
      const { data } = await apiClient.post('/payment/razorpay/create-order', {
        courseId,
        displayCurrency: userCurrency,
        displayAmount: displayAmt,
      });

      if (!data.success) throw new Error(data.message || 'Failed to create order');

      const { orderId, amount, currency, keyId } = data;

      // Step 2: Open Razorpay modal
      const options = {
        key: keyId,
        amount,
        currency,
        name: 'Kattraan',
        description: course.title,
        image: course.thumbnail || '/favicon.ico',
        order_id: orderId,
        prefill: {
          name: user?.userName || user?.name || '',
          email: user?.userEmail || user?.email || '',
        },
        // Test mode: web checkout often shows only UPI QR (no UPI ID field). Disable UPI so Card / Netbanking work for sandbox.
        ...(razorpayTestMode
          ? {
              method: {
                upi: false,
                card: true,
                netbanking: true,
                wallet: false,
                emi: false,
              },
            }
          : {}),
        notes: { courseId },
        theme: { color: '#c1269d' },
        handler: async (response) => {
          // Step 3: Verify on server
          try {
            const verifyRes = await apiClient.post('/payment/razorpay/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              courseId,
              displayCurrency: userCurrency,
              displayAmount: displayAmt,
            });
            if (verifyRes.data.success) {
              setPaid(true);
              toast?.success('Payment successful! You are now enrolled.');
            } else {
              throw new Error(verifyRes.data.message || 'Verification failed');
            }
          } catch (err) {
            const msg =
              err?.response?.data?.message ||
              err.message ||
              'Payment verification failed. If money was debited, your enrollment will update shortly — check My Courses.';
            setError(msg);
          } finally {
            setPaying(false);
          }
        },
        modal: {
          ondismiss: () => {
            setPaying(false);
            toast?.info('Payment cancelled');
          },
        },
      };

      // eslint-disable-next-line no-undef
      const rzp = new Razorpay(options);
      rzp.on('payment.failed', (response) => {
        setError(response.error?.description || 'Payment failed. Please try again.');
        setPaying(false);
      });
      rzp.open();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Something went wrong');
      setPaying(false);
    }
  }, [course, courseId, paying, userCurrency, convertFromINR, user, toast, razorpayTestMode]);

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
            <p className="text-white/50 text-xs mt-1 line-clamp-2">{course?.description}</p>
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
          <p className="text-white/40 text-[11px]">Payment is processed in INR via Razorpay. Your card may show a conversion fee if your bank account is in another currency.</p>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-6 flex gap-3 items-start p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {razorpayTestMode && (
          <div className="mb-6 flex gap-3 items-start p-4 bg-amber-500/10 border border-amber-500/35 rounded-xl text-amber-100/95 text-sm">
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-400" />
            <div className="space-y-3 min-w-0">
              <p className="font-semibold text-amber-200">Razorpay test mode</p>
              <p className="text-white/80 text-xs leading-relaxed">
                On <strong className="text-white">desktop web</strong>, Razorpay often shows only <strong className="text-white">UPI QR</strong> and may{' '}
                <strong className="text-white">not</strong> show an “enter UPI ID” field — that is normal. Scanning that QR with a real UPI app will fail.
              </p>
              <p className="text-white/80 text-xs leading-relaxed">
                This checkout opens with <strong className="text-white">Card</strong> and <strong className="text-white">Netbanking</strong> for sandbox. Use Razorpay&apos;s{' '}
                <strong className="text-white">test card</strong> numbers (or the mock bank flow for netbanking). See{' '}
                <a
                  href={RAZORPAY_TEST_DOCS}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#ff8ec4] hover:underline"
                >
                  test card &amp; UPI reference
                </a>
                .
              </p>
              <p className="text-white/55 text-[11px] leading-relaxed">
                Live mode still offers full UPI for real customers. For UPI collect on mobile, Razorpay is changing flows per NPCI; use test cards for reliable end-to-end tests.
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
          <span>Secured by Razorpay · 30-day money-back guarantee</span>
        </div>
      </div>
    </div>
  );
}
