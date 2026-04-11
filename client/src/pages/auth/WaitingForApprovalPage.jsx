import React from 'react';
import { Clock, CheckCircle2, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '@/features/auth/store/authSlice';
import BrandLogo from '@/components/common/BrandLogo';
import heroBackground from "@/assets/hero-background.png";
import { ROUTES } from '@/config/routes';

/**
 * Page displayed after instructor submission, while waiting for admin approval.
 */
const WaitingForApprovalPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate(ROUTES.LOGIN);
  };

  return (
    <div className="min-h-screen bg-[#0c091a] relative overflow-hidden flex flex-col font-satoshi selection:bg-primary-pink/30">
        <img src={heroBackground} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0c091a]/80 to-[#0c091a]" />

        {/* Header with Logo */}
        <div className="relative z-20 pt-6 lg:pt-8 w-full">
            <div className="max-w-[1440px] mx-auto px-6 lg:px-12 flex justify-between items-center">
                <BrandLogo />
                <div className="flex items-center gap-6">
                    <button 
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-white/50 hover:text-white text-sm font-medium transition-colors group"
                    >
                        <LogOut size={16} className="group-hover:rotate-12 transition-transform" />
                        Log out
                    </button>
                </div>
            </div>
        </div>

      <main className="flex-grow flex items-center justify-center pt-24 pb-16 px-4 relative z-10">
        <div className="w-full max-w-[600px] bg-white/[0.03] border border-white/5 backdrop-blur-xl rounded-[40px] p-10 md:p-14 text-center shadow-[0_32px_120px_rgba(0,0,0,0.5)]">
            <div className="w-20 h-20 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 mx-auto mb-8 relative">
                <Clock size={32} />
                <div className="absolute inset-0 rounded-full border-2 border-orange-500/20 border-t-orange-500 animate-spin" />
            </div>

            <h1 className="text-3xl font-bold text-white mb-4">Under Review</h1>
            <p className="text-white/60 text-sm leading-relaxed mb-10 max-w-sm mx-auto">
                Thank you for submitting your profile! Our admin team is currently reviewing your application. You'll receive an email once your account is activated.
            </p>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 text-left space-y-4 mb-10">
                <h3 className="text-white font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-primary-pink" /> What's Next?
                </h3>
                <ul className="space-y-3">
                    {["Verification of your professional credentials", "Review of your ID proof documents", "Email notification of approval or feedback"].map((t, i) => (
                        <li key={i} className="text-white/50 text-[11px] flex items-start gap-3">
                            <span className="text-primary-pink font-bold">{i+1}.</span> {t}
                        </li>
                    ))}
                </ul>
            </div>
{/* 
            <Link to={ROUTES.DASHBOARD}>
                <Button variant="secondary" className="w-full gap-2 group">
                    Go to Learner Dashboard <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Button>
            </Link> */}
        </div>
      </main>
    </div>
  );
};

export default WaitingForApprovalPage;
