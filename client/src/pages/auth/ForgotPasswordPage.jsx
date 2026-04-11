import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import authService from '@/features/auth/services/authService';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import BrandLogo from '@/components/common/BrandLogo';
import heroBackground from "@/assets/hero-background.png";
import logo from '@/assets/logo.png';
import { ROUTES } from '@/config/routes';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [emailError, setEmailError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.toLowerCase().endsWith('@gmail.com')) {
        setEmailError('Only @gmail.com addresses are supported');
        return;
    }

    setLoading(true);
    setError(null);
    try {
      await authService.forgotPassword(email);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
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
             <Link to={ROUTES.LOGIN} className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm mb-6 group">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back to Login
             </Link>
             <h1 className="text-[26px] font-bold text-white tracking-tight mb-2">Forgot Password?</h1>
             <p className="text-white/60 text-sm">Don't worry, we'll send you reset instructions.</p>
          </div>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-xl text-xs text-center font-bold">
                  {error}
                </div>
              )}
              
              <div className="space-y-4">
                 <Input 
                    label="Email" 
                    type="email" 
                     placeholder="Enter your email" 
                     value={email} 
                     onChange={(e) => {
                        setEmail(e.target.value);
                        if (e.target.value && !e.target.value.toLowerCase().endsWith('@gmail.com')) {
                            setEmailError('Only @gmail.com addresses are supported');
                        } else {
                            setEmailError('');
                        }
                     }} 
                     error={emailError}
                     required 
                     className="h-[48px]" 
                     icon={Mail} 
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
                <h3 className="text-xl font-bold text-white mb-2">Check your email</h3>
                <p className="text-white/60 text-sm mb-6">
                    We have sent a password reset link to <span className="text-white font-medium">{email}</span>
                </p>
                <div className="text-sm text-white/40">
                    Did not receive the email? Check your spam folder or <button onClick={() => setSubmitted(false)} className="text-primary-pink hover:underline font-bold">try another email address</button>
                </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ForgotPasswordPage;
