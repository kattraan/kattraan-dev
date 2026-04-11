import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { login } from '@/features/auth/store/authSlice';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { validatePasswordStrength } from '@/utils/passwordValidation';
import { ROUTES } from '@/config/routes';
import { useToast } from '@/components/ui/Toast';

export default function LoginForm({ instructorSignupSuccess }) {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [emailError, setEmailError] = useState('');
  const [passwordWarning, setPasswordWarning] = useState('');
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  const toast = useToast();
  const prevErrorRef = useRef(null);

  // Show toast whenever a new server error arrives
  useEffect(() => {
    if (error && error !== prevErrorRef.current) {
      toast.error(error);
      prevErrorRef.current = error;
    }
    if (!error) {
      prevErrorRef.current = null;
    }
  }, [error, toast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === 'email') setEmailError(value && !value.toLowerCase().endsWith('@gmail.com') ? 'Enter a valid @gmail.com address' : '');
    if (name === 'password') {
      const result = validatePasswordStrength(value);
      setPasswordWarning(value.length > 0 && !result.isValid ? 'Your password strength is ' + result.strength.toLowerCase() + '. Strong passwords are required for better security.' : '');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.email.toLowerCase().endsWith('@gmail.com')) { setEmailError('Enter a valid @gmail.com address'); return; }
    const result = validatePasswordStrength(formData.password);
    if (!result.isValid) { setPasswordWarning('Access denied. Your password is too weak. Please reset your password to a stronger one to continue.'); return; }
    dispatch(login(formData));
  };

  return (
    <>
      <div className="text-center mb-4"><h1 className="text-[26px] font-bold text-white tracking-tight">Sign In</h1></div>
      {instructorSignupSuccess && (
        <div className="mb-4 bg-green-500/10 border border-green-500/20 text-green-400 p-3 rounded-xl text-xs text-center font-medium" role="status">Account created successfully! Please log in.</div>
      )}
      <div className="space-y-4">
        <div id="google-login-btn" className="w-full flex justify-center !rounded-xl overflow-hidden" aria-label="Google sign in" />
        <div className="relative flex items-center py-1">
          <div className="flex-grow border-t border-white/10" />
          <span className="flex-shrink-0 mx-4 text-white/30 text-[10px] uppercase tracking-widest font-bold">or email</span>
          <div className="flex-grow border-t border-white/10" />
        </div>
        <form onSubmit={handleSubmit} className="space-y-4" aria-describedby={[error && 'login-error', passwordWarning && 'login-password-warning'].filter(Boolean).join(' ') || undefined}>
          {error && (
            <div
              id="login-error"
              role="alert"
              className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/30 text-red-400 p-3.5 rounded-xl text-sm font-medium animate-[fadeIn_0.2s_ease]"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          {passwordWarning && <div id="login-password-warning" className="bg-amber-500/10 border border-amber-500/20 text-amber-500 p-3 rounded-xl text-xs text-center font-medium" role="alert">{passwordWarning}</div>}
          <div className="space-y-3">
            <Input label="Email" name="email" type="email" placeholder="name@gmail.com" value={formData.email} onChange={handleChange} error={emailError} required className="h-[44px]" icon={Mail} />
            <div className="space-y-1">
              <Input label="Password" name="password" type="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required className="h-[44px]" icon={Lock} />
              <div className="flex justify-between items-center pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <div className="w-3.5 h-3.5 rounded border border-white/20 bg-white/5 flex items-center justify-center" />
                  <span className="text-[12px] text-white/50">Remember me</span>
                </label>
                <Link to={ROUTES.FORGOT_PASSWORD} className="text-[12px] text-white/50 hover:text-primary-pink transition-colors">Forgot password?</Link>
              </div>
            </div>
          </div>
          <Button type="submit" isLoading={loading} className="w-full h-[48px] text-[14px] font-bold rounded-xl">Sign In</Button>
        </form>
      </div>
      <div className="mt-4 pt-4 border-t border-white/5 text-center">
        <span className="text-white/40 text-[14px]">New here? </span>
        <Link to={ROUTES.SIGNUP} className="text-primary-pink hover:text-primary-pink/80 font-bold text-[14px] transition-colors ml-1">Create Account</Link>
      </div>
    </>
  );
}
