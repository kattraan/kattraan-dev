import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerInstructor, becomeInstructor, clearError } from '@/features/auth/store/authSlice';
import { hasRole } from '@/features/auth/utils/roleUtils';
import { logger } from '@/utils/logger';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import BrandLogo from '@/components/common/BrandLogo';
import { Briefcase, ArrowRight, Lock, Check } from 'lucide-react';
import heroBackground from "@/assets/hero-background.png";
import { validatePasswordStrength } from '@/utils/passwordValidation';
import { ROUTES } from '@/config/routes';

/**
 * Page for users who want to join as Instructors.
 * Handles both new account creation and upgrading existing accounts.
 */
const InstructorSignUpPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated, user } = useSelector((state) => state.auth);
  const [emailError, setEmailError] = useState('');

  const isInstructor = hasRole(user, 'instructor');

  useEffect(() => {
      if (isInstructor && user?.status === 'approved') {
          navigate(ROUTES.INSTRUCTOR_DASHBOARD);
      }
  }, [isInstructor, user, navigate]);

  const [passwordError, setPasswordError] = useState('');
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

    logger.debug("Submitting instructor registration...", formData);
    dispatch(registerInstructor(formData))
         .unwrap()
         .then((res) => { 
           logger.debug("Registration successful:", res);
           navigate(ROUTES.LOGIN, { state: { instructorSignupSuccess: true } }); 
         })
         .catch((err) => {
           logger.error("Registration failed:", err);
         });
  };

  const handleUpgrade = () => {
      const email = user?.email || user?.userEmail;
      if (email) {
          dispatch(becomeInstructor(email))
            .unwrap()
            .then(() => { navigate(ROUTES.INSTRUCTOR_ENROLLMENT); });
      }
  };

  return (
    <div className="min-h-screen bg-[#0c091a] relative overflow-hidden flex flex-col font-satoshi selection:bg-primary-pink/30">
        <img src={heroBackground} alt="" className="absolute inset-0 w-full h-full object-cover opacity-60" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-[#0c091a]/40 to-[#0c091a]" />

      {/* Top Header with Logo */}
      <div className="absolute top-0 left-0 right-0 z-30 pt-6 lg:pt-8">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 flex justify-between items-center">
          <BrandLogo showThemeToggle={false} />
          <Link to="/" className="text-white/50 hover:text-white text-sm font-medium transition-colors hidden sm:block">Back to Website</Link>
        </div>
      </div>

      <main className="flex-grow flex items-center justify-center pt-24 pb-16 px-4 relative z-10">
        <div className="w-full max-w-[950px] border border-white/10 rounded-[40px] overflow-hidden shadow-[0_32px_120px_rgba(0,0,0,0.8)] bg-gradient-to-br from-white/[0.05] to-white/[0.01] backdrop-blur-3xl flex flex-col md:flex-row">
          
          {/* Left panel: Info & Branding */}
          <div className="bg-gradient-to-br from-[#FF8C42]/20 to-[#FF3FB4]/20 p-10 md:p-14 flex flex-col justify-between md:w-[42%] relative overflow-hidden border-r border-white/5">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF3FB4]/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
                
                <div className="relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white mb-8 shadow-xl"> 
                      <Briefcase size={28} /> 
                    </div>
                    <h2 className="text-4xl font-bold text-white mb-6 leading-tight">Teach on <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF8C42] to-[#FF3FB4]">Kattraan</span></h2>
                    <p className="text-white/60 text-base leading-relaxed max-w-[280px]">Join our community of expert instructors and share your knowledge with the world.</p>
                </div>

                <div className="relative z-10 mt-12 space-y-5">
                    {[
                      'Reach Global Audience',
                      'Easy Course Builder',
                      'Secure Payments'
                    ].map((feature, i) => (
                      <div key={i} className="flex items-center gap-3 text-white/80 font-medium">
                        <div className="w-5 h-5 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-[10px] text-green-400">
                          <Check size={12} strokeWidth={3} />
                        </div>
                        {feature}
                      </div>
                    ))}
                </div>
          </div>

          {/* Right panel: Form */}
          <div className="p-8 md:p-14 md:w-[58%] flex flex-col justify-center">
            <div className="mb-10">
              <h1 className="text-3xl font-bold text-white mb-2">{isAuthenticated ? "Become an Instructor" : "Instructor Sign Up"}</h1>
              <p className="text-white/40 text-[15px]">{isAuthenticated ? "Upgrade your account to start teaching." : "Create your account to start the enrollment process."}</p>
            </div>

            {error && <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl text-sm text-center mb-6 font-medium">{error}</div>}

            {isAuthenticated ? (
                <div className="space-y-6">
                    <div className="bg-white/5 p-5 rounded-2xl border border-white/10 text-white backdrop-blur-sm">
                        <p className="text-white/40 text-xs uppercase tracking-widest font-bold mb-1">Authenticated as</p>
                        <p className="text-white font-semibold text-lg">{user?.userName || user?.name}</p>
                        <p className="text-white/50 text-sm">{user?.email || user?.userEmail}</p>
                    </div>
                    {!isInstructor ? (
                        <Button onClick={handleUpgrade} isLoading={loading} className="w-full h-14 rounded-2xl text-[16px]">Activate Instructor Account</Button>
                    ) : (
                        <Link to={ROUTES.INSTRUCTOR_DASHBOARD}> 
                          <Button className="w-full h-14 rounded-2xl text-[16px]">Go to Instructor Dashboard</Button> 
                        </Link>
                    )}
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6 text-white">
                  <Input label="Full Name" name="name" placeholder="John Doe" value={formData.name} onChange={handleChange} required className="h-12 bg-white/5 border-white/10 focus:border-primary-pink/50 rounded-xl" />
                  <Input label="Email" name="email" type="email" placeholder="name@gmail.com" value={formData.email} onChange={handleChange} error={emailError} required className="h-12 bg-white/5 border-white/10 focus:border-primary-pink/50 rounded-xl" />
                  <div className="relative">
                      <Input 
                          label="Password" 
                          name="password" 
                          type="password" 
                          placeholder="••••••••"
                          value={formData.password} 
                          onChange={handleChange} 
                          onFocus={() => setIsPasswordFocused(true)}
                          onBlur={() => setIsPasswordFocused(false)}
                          error={passwordError}
                          required 
                          icon={Lock}
                          className="h-12 bg-white/5 border-white/10 focus:border-primary-pink/50 rounded-xl"
                      />
                      
                      {/* Strength Indicator */}
                      {(formData.password.length > 0 || isPasswordFocused) && (
                          <div className="pt-3 px-1">
                              <div className="flex justify-between items-center text-[12px] mb-2">
                                  <span className="text-white/50 font-medium tracking-wide">Security Strength</span>
                                  <span className={`font-bold uppercase tracking-wider transition-colors ${
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
                              
                              <div className="grid grid-cols-4 gap-2.5 h-1.5">
                                  {[1, 2, 3, 4].map((bar) => {
                                      const score = validatePasswordStrength(formData.password).score;
                                      let isActive = false;
                                      let colorClass = 'bg-white/10';
                                      if (bar === 1 && score >= 1) isActive = true;
                                      if (bar === 2 && score >= 3) isActive = true;
                                      if (bar === 3 && score >= 4) isActive = true;
                                      if (bar === 4 && score >= 5) isActive = true;
                                      if (isActive) {
                                          if (score >= 5) colorClass = 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.4)]';
                                          else if (score >= 3) colorClass = 'bg-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.4)]';
                                          else colorClass = 'bg-primary-pink shadow-[0_0_15px_rgba(255,63,180,0.4)]';
                                      }
                                      return <div key={bar} className={`rounded-full transition-all duration-500 ${colorClass}`} />;
                                  })}
                              </div>
                          </div>
                      )}

                      {/* Floating Requirements List */}
                      <div className={`absolute left-0 right-0 top-full mt-4 z-50 transition-all duration-300 ease-out origin-top transform ${isPasswordFocused ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
                          <div className="bg-[#1a1625]/95 backdrop-blur-2xl border border-white/10 p-5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]"> 
                             <div className="space-y-2">
                                  {[
                                      { label: 'At least 8 characters', met: passwordMetadata.hasMinLength },
                                      { label: 'Contains uppercase letter', met: passwordMetadata.hasUpper },
                                      { label: 'Contains lowercase letter', met: passwordMetadata.hasLower },
                                      { label: 'Contains a number', met: passwordMetadata.hasNumber },
                                      { label: 'Contains special character', met: passwordMetadata.hasSpecial }
                                  ].map((rule, idx) => (
                                      <div key={idx} className="flex items-center gap-3">
                                          <div className={`flex items-center justify-center w-4 h-4 rounded-full border transition-all duration-300 ${rule.met ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-white/5 border-white/10 text-transparent'}`}>
                                              <Check size={10} strokeWidth={4} />
                                          </div>
                                          <span className={`text-[13px] transition-colors duration-300 ${rule.met ? 'text-white/90 font-medium' : 'text-white/40'}`}>
                                              {rule.label}
                                          </span>
                                      </div>
                                  ))}
                             </div>
                             <div className="absolute -top-1.5 left-8 w-3 h-3 bg-[#1a1625]/95 border-l border-t border-white/10 rotate-45"></div>
                          </div>
                      </div>
                  </div>
                  <Button type="submit" isLoading={loading} className="w-full h-14 rounded-2xl text-[16px] font-bold bg-gradient-to-r from-[#FF8C42] to-[#FF3FB4] shadow-[0_10px_30px_rgba(255,63,180,0.2)] hover:shadow-[0_15px_40px_rgba(255,63,180,0.3)] transition-all mt-6">
                    Start Enrollment <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </form>
            )}
            
            {!isAuthenticated && (
              <div className="mt-8 text-center pt-6 border-t border-white/5">
                <span className="text-white/40 text-sm">Already have an account? </span>
                <Link to={ROUTES.LOGIN} className="text-primary-pink hover:text-primary-pink/80 font-bold text-sm transition-colors ml-1">Login here</Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default InstructorSignUpPage;
