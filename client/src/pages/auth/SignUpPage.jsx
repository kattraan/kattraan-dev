import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Check, User, Mail, Lock } from 'lucide-react';
import { register, clearError } from '@/features/auth/store/authSlice';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import BrandLogo from '@/components/common/BrandLogo';
import heroBackground from "@/assets/hero-background.png";
import useGoogleOneTap from '@/hooks/useGoogleOneTap';
import { validatePasswordStrength } from '@/utils/passwordValidation';
import { hasRole } from '@/features/auth/utils/roleUtils';
import { ROUTES } from '@/config/routes';

/**
 * Standardized SignUpPage for authentication.
 * Relocated to auth module for cleaner page organization.
 */
const SignUpPage = () => {
  useGoogleOneTap('google-signup-btn');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated, user } = useSelector((state) => state.auth);

  // Role-aware redirect — same logic as LoginPage so the behaviour is consistent
  // whether the user arrives authenticated (old session) or just registered.
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    if (hasRole(user, 'admin')) {
      navigate(ROUTES.ADMIN_DASHBOARD, { replace: true });
      return;
    }

    if (hasRole(user, 'instructor')) {
      if (user.status === 'pending_enrollment') {
        navigate(ROUTES.INSTRUCTOR_ENROLLMENT, { replace: true });
        return;
      }
      if (user.status === 'pending_approval') {
        navigate(ROUTES.WAITING_APPROVAL, { replace: true });
        return;
      }
      navigate(ROUTES.INSTRUCTOR_DASHBOARD, { replace: true });
      return;
    }

    // Default: regular learner
    navigate(ROUTES.DASHBOARD, { replace: true });
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    return () => dispatch(clearError());
  }, [dispatch]);

  const [passwordError, setPasswordError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [passwordMetadata, setPasswordMetadata] = useState({
    hasMinLength: false,
    hasUpper: false,
    hasLower: false,
    hasNumber: false,
    hasSpecial: false
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (name === 'email') {
        if (value && !value.toLowerCase().endsWith('@gmail.com')) {
            setEmailError('Only @gmail.com addresses are allowed');
        } else {
            setEmailError('');
        }
    }

    if (name === 'password') {
        const result = validatePasswordStrength(value);
        setPasswordMetadata(result.meta);
        setPasswordError(result.isValid ? "" : result.error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.email.toLowerCase().endsWith('@gmail.com')) {
        setEmailError('Only @gmail.com addresses are allowed');
        return;
    }

    const result = validatePasswordStrength(formData.password);
    if (!result.isValid) {
        setPasswordError(result.error);
        return;
    }
    dispatch(register(formData));
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

      {/* Professional Top Header */}
      <div className="absolute top-0 left-0 right-0 z-20 pt-6 lg:pt-8">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 flex justify-between items-center">
          <BrandLogo showThemeToggle={false} />
          
          <div className="flex items-center gap-6">
              <Link to="/" className="text-white/50 hover:text-white text-sm font-medium transition-colors hidden sm:block">Back to Website</Link>
              <Link to="/help" className="px-5 py-2 rounded-full border border-white/10 bg-white/5 text-white/70 hover:text-white hover:bg-white/10 hover:border-white/20 text-sm font-medium transition-all">
                  Help
              </Link>
          </div>
        </div>
      </div>

      <main className="flex-grow flex items-center justify-center px-4 relative z-10 py-4">
        <div className="w-full max-w-[520px] border border-white/10 rounded-[32px] p-6 md:p-8 shadow-[0_32px_120px_rgba(0,0,0,0.7)] bg-gradient-to-b from-white/[0.08] to-white/[0.02] backdrop-blur-3xl flex flex-col justify-center relative">
          
          <div className="text-center mb-4">
             <h1 className="text-[26px] font-bold text-white tracking-tight">Create Account</h1>
          </div>

          <div className="space-y-4">
             {/* Google Button */}
             <div id="google-signup-btn" className="w-full flex justify-center !rounded-xl overflow-hidden"></div>

             <div className="relative flex items-center py-1">
                 <div className="flex-grow border-t border-white/10"></div>
                 <span className="flex-shrink-0 mx-4 text-white/30 text-[10px] uppercase tracking-widest font-bold">or email</span>
                 <div className="flex-grow border-t border-white/10"></div>
             </div>

             <form onSubmit={handleSubmit} className="space-y-3">
                {error && <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-xl text-xs text-center">{error}</div>}
                <div className="space-y-3">
                    <Input label="Full Name" name="name" placeholder="John Doe" value={formData.name} onChange={handleChange} required className="h-[42px]" icon={User} />
                    <Input label="Email" name="email" type="email" placeholder="name@gmail.com" value={formData.email} onChange={handleChange} error={emailError} required className="h-[42px]" icon={Mail} />
                    <div className="relative">
                        <Input 
                            label="Password" 
                            name="password" 
                            type="password" 
                            placeholder="Create a password" 
                            value={formData.password} 
                            onChange={handleChange} 
                            onFocus={() => setIsPasswordFocused(true)}
                            onBlur={() => setIsPasswordFocused(false)}
                            error={passwordError} 
                            required 
                            className="h-[42px]" 
                            icon={Lock} 
                        />
                        
                        {/* Static Strength Bar - Always visible or visible on typing */}
                        {/* Show only if there is a password typed or if focused */}
                        {(formData.password.length > 0 || isPasswordFocused) && (
                            <div className="pt-2 px-1">
                                <div className="flex justify-between items-center text-[12px] mb-1.5">
                                    <span className="text-white/50 font-medium">Password strength</span>
                                    <span className={`font-bold transition-colors ${
                                        (() => {
                                            const score = Object.values(passwordMetadata).filter(Boolean).length;
                                            if (score <= 2) return 'text-red-400';
                                            if (score <= 4) return 'text-yellow-400';
                                            return 'text-green-400';
                                        })()
                                    }`}>
                                        {(() => {
                                            const score = Object.values(passwordMetadata).filter(Boolean).length;
                                            if (score === 0) return 'None';
                                            if (score <= 2) return 'Weak';
                                            if (score <= 4) return 'Medium';
                                            return 'Strong';
                                        })()}
                                    </span>
                                </div>
                                
                                <div className="grid grid-cols-4 gap-2 h-1.5">
                                    {[1, 2, 3, 4].map((bar) => {
                                        const score = Object.values(passwordMetadata).filter(Boolean).length;
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

                                        return (
                                            <div key={bar} className={`rounded-full transition-all duration-500 ${colorClass}`} />
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                        
                        {/* Floating Requirements List Only */}
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
                               
                               {/* Little arrow pointing up */}
                               <div className="absolute -top-1.5 left-8 w-3 h-3 bg-[#1a1625]/95 border-l border-t border-white/10 rotate-45"></div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <Button type="submit" isLoading={loading} className="w-full h-[46px] text-[14px] font-bold rounded-xl mt-4 relative z-0">Create Account</Button>
             </form>
          </div>

          <div className="mt-4 pt-4 border-t border-white/5 text-center">
             <span className="text-white/40 text-[14px]">Already have an account? </span>
             <Link to={ROUTES.LOGIN} className="text-primary-pink hover:text-primary-pink/80 font-bold text-[14px] transition-colors ml-1">Log in</Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SignUpPage;
