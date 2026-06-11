import React, { useState, useEffect } from 'react';
import { Mail, RefreshCw } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

const RESEND_COOLDOWN_SEC = 60;

/**
 * OTP verification step shown after email/password registration.
 */
const EmailVerificationStep = ({
  email,
  onVerify,
  onResend,
  loading = false,
  error = null,
  onClearError,
}) => {
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(RESEND_COOLDOWN_SEC);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
    setOtpError('');
    setResendMessage('');
    onClearError?.();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setOtpError('Please enter the 6-digit code');
      return;
    }
    onVerify(otp);
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || resendLoading) return;
    setResendLoading(true);
    setResendMessage('');
    onClearError?.();
    try {
      await onResend();
      setResendMessage('A new code has been sent to your email.');
      setResendCooldown(RESEND_COOLDOWN_SEC);
      setOtp('');
    } catch {
      // Parent handles error display
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary-pink/10 border border-primary-pink/20 mb-3">
          <Mail className="text-primary-pink" size={24} />
        </div>
        <h2 className="text-[22px] font-bold text-white tracking-tight">Verify your email</h2>
        <p className="text-white/50 text-sm mt-2 px-2">
          We sent a 6-digit code to
          <span className="block sm:inline sm:ml-1 text-white/80 font-medium break-all">{email}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {(error || otpError) && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-xl text-xs text-center">
            {otpError || error}
          </div>
        )}
        {resendMessage && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-3 rounded-xl text-xs text-center">
            {resendMessage}
          </div>
        )}

        <Input
          autoFocus
          label="Verification code"
          name="otp"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="000000"
          value={otp}
          onChange={handleOtpChange}
          required
          className="h-[46px] text-center text-base sm:text-lg tracking-[0.2em] sm:tracking-[0.4em] font-bold"
          icon={Mail}
        />

        <Button type="submit" isLoading={loading} className="w-full h-[46px] text-[14px] font-bold rounded-xl">
          Verify &amp; Continue
        </Button>
      </form>

      <div className="text-center pt-2">
        <p className="text-white/40 text-sm mb-2">Didn&apos;t receive the code?</p>
        <button
          type="button"
          onClick={handleResend}
          disabled={resendCooldown > 0 || resendLoading}
          className="inline-flex items-center gap-2 text-primary-pink hover:text-primary-pink/80 text-sm font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <RefreshCw size={14} className={resendLoading ? 'animate-spin' : ''} />
          {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
        </button>
      </div>
    </div>
  );
};

export default EmailVerificationStep;
