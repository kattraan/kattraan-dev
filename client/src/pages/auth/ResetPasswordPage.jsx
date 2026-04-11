import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, ArrowLeft, CheckCircle } from 'lucide-react';
import authService from '@/features/auth/services/authService';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import BrandLogo from '@/components/common/BrandLogo';
import { validatePasswordStrength } from '@/utils/passwordValidation';
import { Check } from 'lucide-react';
import heroBackground from "@/assets/hero-background.png";
import logo from '@/assets/logo.png';
import { ROUTES } from '@/config/routes';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  
  const [passwordMetadata, setPasswordMetadata] = useState({
    hasMinLength: false,
    hasUpper: false,
    hasLower: false,
    hasNumber: false,
    hasSpecial: false
  });
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === 'password') {
        const result = validatePasswordStrength(value);
        setPasswordMetadata(result.meta);
        setPasswordError(result.isValid ? "" : result.error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const result = validatePasswordStrength(formData.password);
    if (!result.isValid) {
        setError(result.error);
        return;
    }

    if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        return;
    }

    if (!token) {
        setError("Invalid or missing reset token.");
        return;
    }

    setLoading(true);
    try {
      await authService.resetPassword(token, formData.password);
      setSuccess(true);
      // Optional: redirect after a few seconds
      setTimeout(() => navigate(ROUTES.LOGIN), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Link may be expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen h-screen bg-[#0c091a] relative overflow-hidden flex flex-col font-satoshi selection:bg-primary-pink/30">
      <img
        src={heroBackground}
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover opacity-60 pointer-events-none"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0c091a]/40 to-[#0c091a] pointer-events-none" />

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 pt-6 lg:pt-8">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 flex items-center justify-between">
          <BrandLogo />
        </div>
      </div>

      <main className="flex-grow flex items-center justify-center px-4 relative z-10 py-4">
        <div className="w-full max-w-[480px] border border-white/10 rounded-[32px] p-8 shadow-[0_32px_120px_rgba(0,0,0,0.7)] bg-white/[0.02] backdrop-blur-3xl flex flex-col justify-center">
          
          <div className="mb-6">
             <h1 className="text-[26px] font-bold text-white tracking-tight mb-2">Set new password</h1>
             <p className="text-white/60 text-sm">Your new password must be different to previously used passwords.</p>
          </div>

          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-xl text-xs text-center font-bold">
                  {error}
                </div>
              )}
              
              <div className="space-y-4">
                 <div className="relative">
                     <Input 
                        label="Password" 
                        name="password"
                        type="password" 
                        placeholder="New password" 
                        value={formData.password} 
                        onChange={handleChange} 
                        onFocus={() => setIsPasswordFocused(true)}
                        onBlur={() => setIsPasswordFocused(false)}
                        error={passwordError}
                        required 
                        className="h-[48px]" 
                        icon={Lock} 
                     />
                     
                     {/* Strength Meter */}
                     {(formData.password.length > 0 || isPasswordFocused) && (
                         <div className="pt-2 px-1">
                             <div className="flex justify-between items-center text-[12px] mb-1.5">
                                 <span className="text-white/50 font-medium">Password strength</span>
                                 <span className={`font-bold transition-colors ${
                                     (() => {
                                         const result = validatePasswordStrength(formData.password);
                                         if (result.score <= 2) return 'text-red-400';
                                         if (result.score <= 4) return 'text-yellow-400';
                                         return 'text-green-400';
                                     })()
                                 }`}>
                                     {validatePasswordStrength(formData.password).strength}
                                 </span>
                             </div>
                             
                             <div className="grid grid-cols-4 gap-2 h-1.5">
                                 {[1, 2, 3, 4].map((bar) => {
                                     const score = validatePasswordStrength(formData.password).score;
                                     let isActive = false;
                                     let colorClass = 'bg-white/10';
                                     if (bar === 1 && score >= 1) isActive = true;
                                     if (bar === 2 && score >= 3) isActive = true;
                                     if (bar === 3 && score >= 4) isActive = true;
                                     if (bar === 4 && score >= 5) isActive = true;
                                     if (isActive) {
                                         if (score >= 5) colorClass = 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]';
                                         else if (score >= 3) colorClass = 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]';
                                         else colorClass = 'bg-primary-pink shadow-[0_0_10px_rgba(255,63,180,0.5)]';
                                     }
                                     return <div key={bar} className={`rounded-full transition-all duration-500 ${colorClass}`} />;
                                 })}
                             </div>
                         </div>
                     )}

                     {/* Floating Requirements List */}
                     <div className={`absolute left-0 right-0 top-full mt-2 z-50 transition-all duration-300 ease-out origin-top transform ${isPasswordFocused ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
                         <div className="bg-[#1a1625]/95 backdrop-blur-xl border border-white/10 p-4 rounded-xl shadow-2xl"> 
                            <div className="space-y-1.5">
                                 {[
                                     { label: 'At least 8 characters', met: passwordMetadata.hasMinLength },
                                     { label: 'Contains uppercase letter', met: passwordMetadata.hasUpper },
                                     { label: 'Contains lowercase letter', met: passwordMetadata.hasLower },
                                     { label: 'Contains a number', met: passwordMetadata.hasNumber },
                                     { label: 'Contains special character', met: passwordMetadata.hasSpecial }
                                 ].map((rule, idx) => (
                                     <div key={idx} className="flex items-center gap-2.5">
                                         <div className={`flex items-center justify-center w-4 h-4 rounded-full border transition-all duration-300 ${rule.met ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-white/5 border-white/10 text-transparent'}`}>
                                             <Check size={10} strokeWidth={4} />
                                         </div>
                                         <span className={`text-[12px] transition-colors duration-300 ${rule.met ? 'text-white/90' : 'text-white/40'}`}>
                                             {rule.label}
                                         </span>
                                     </div>
                                 ))}
                            </div>
                            <div className="absolute -top-1.5 left-8 w-3 h-3 bg-[#1a1625]/95 border-l border-t border-white/10 rotate-45"></div>
                         </div>
                     </div>
                 </div>

                 <Input 
                    label="Confirm Password" 
                    name="confirmPassword"
                    type="password" 
                    placeholder="Confirm new password" 
                    value={formData.confirmPassword} 
                    onChange={handleChange} 
                    required 
                    className="h-[48px]" 
                    icon={Lock} 
                 />
              </div>
              
              <Button type="submit" isLoading={loading} className="w-full h-[48px] text-[14px] font-bold rounded-xl">
                Reset Password
              </Button>
            </form>
          ) : (
            <div className="text-center py-4">
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/20">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Password reset successful</h3>
                <p className="text-white/60 text-sm mb-6">
                    Your password has been successfully reset. You can now log in with your new password.
                </p>
                <Button onClick={() => navigate(ROUTES.LOGIN)} className="w-full h-[48px] text-[14px] font-bold rounded-xl">
                    Back to Login
                </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ResetPasswordPage;
