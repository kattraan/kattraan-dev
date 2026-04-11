import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { UserPlus, Sparkles, ShieldCheck, GraduationCap } from 'lucide-react';
import { becomeLearner } from '@/features/auth/store/authSlice';
import Button from '@/components/ui/Button';
import { toast } from 'react-hot-toast';
import DashboardLayout from '@/components/layout/DashboardLayout';

const JoinAsLearnerView = () => {
    const dispatch = useDispatch();
    const { loading } = useSelector((state) => state.auth);

    const handleJoin = async () => {
        try {
            const result = await dispatch(becomeLearner()).unwrap();
            if (result.success) {
                toast.success('Welcome to the Learner Panel!');
            }
        } catch (error) {
            toast.error(error || 'Failed to join as learner');
        }
    };

    return (
        <DashboardLayout
            title="Dashboard"
            subtitle="Explore as a learner to see courses, track progress, and earn certificates."
        >
        <div className="min-h-[60vh] flex items-center justify-center p-4">
            <div className="max-w-[600px] w-full bg-white/[0.03] border border-white/10 rounded-[40px] p-8 md:p-12 backdrop-blur-3xl relative overflow-hidden text-center group">
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-pink/10 blur-[60px] rounded-full -mr-16 -mt-16" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary-purple/10 blur-[60px] rounded-full -ml-16 -mb-16" />

                <div className="relative z-10 space-y-8">
                    {/* Icon Header */}
                    <div className="relative w-24 h-24 mx-auto">
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary-pink to-primary-purple rounded-3xl rotate-6 opacity-20 blur-xl group-hover:rotate-12 transition-transform duration-500" />
                        <div className="relative w-full h-full bg-white/5 border border-white/10 rounded-[24px] flex items-center justify-center text-primary-pink shadow-2xl">
                            <GraduationCap size={44} className="group-hover:scale-110 transition-transform duration-500" />
                        </div>
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#FF8C42] rounded-full flex items-center justify-center text-white border-4 border-[#0c091a]">
                            <Sparkles size={14} />
                        </div>
                    </div>

                    {/* Text Content */}
                    <div className="space-y-4">
                        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                            Explore as a <span className="bg-gradient-to-r from-[#FF8C42] to-[#FF3FB4] bg-clip-text text-transparent">Learner</span>
                        </h1>
                        <p className="text-white/60 text-base md:text-lg leading-relaxed font-medium">
                            You're currently viewing Kattraan as an Instructor. Join as a learner to explore courses, track your progress, and earn certificates.
                        </p>
                    </div>

                    {/* Feature Highlights */}
                    <div className="grid grid-cols-2 gap-4 text-left">
                        <div className="flex items-center gap-3 p-4 bg-white/5 border border-white/5 rounded-2xl">
                            <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500">
                                <ShieldCheck size={18} />
                            </div>
                            <span className="text-[13px] font-bold text-white/80">Full Access</span>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-white/5 border border-white/5 rounded-2xl">
                            <div className="w-8 h-8 rounded-lg bg-primary-pink/10 flex items-center justify-center text-primary-pink">
                                <UserPlus size={18} />
                            </div>
                            <span className="text-[13px] font-bold text-white/80">Track Learning</span>
                        </div>
                    </div>

                    {/* Action Button */}
                    <div className="pt-4">
                        <Button 
                            onClick={handleJoin}
                            isLoading={loading}
                            className="w-full h-[64px] text-lg font-black rounded-2xl bg-gradient-to-r from-[#FF8C42] to-[#FF3FB4] hover:opacity-90 shadow-[0_20px_40px_rgba(255,63,180,0.3)] transition-all active:scale-95"
                        >
                            Become a Learner
                        </Button>
                        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/20 mt-6">
                            No separate account needed • switch anytime
                        </p>
                    </div>
                </div>
            </div>
        </div>
        </DashboardLayout>
    );
};

export default JoinAsLearnerView;
