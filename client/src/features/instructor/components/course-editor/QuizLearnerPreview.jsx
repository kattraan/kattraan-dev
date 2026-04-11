import React, { useState } from 'react';
import { 
    X, ArrowLeft, ArrowRight, CheckCircle2, Circle, 
    ChevronLeft, ChevronRight, RotateCcw, Award, Info,
    Check
} from 'lucide-react';

const QuizLearnerPreview = ({ quizData, onClose }) => {
    const [currentIdx, setCurrentIdx] = useState(0);
    const [answers, setAnswers] = useState({}); // { [questionIdx]: selectedIdx or [selectedIndices] }
    const questions = quizData.questions || [];
    const currentQuestion = questions[currentIdx];
    const isFinished = currentIdx === questions.length;

    const handleSelectOption = (optIdx) => {
        const q = questions[currentIdx];
        if (q.type === 'multiple') {
            const currentAnswers = answers[currentIdx] || [];
            if (currentAnswers.includes(optIdx)) {
                setAnswers({ ...answers, [currentIdx]: currentAnswers.filter(i => i !== optIdx) });
            } else {
                setAnswers({ ...answers, [currentIdx]: [...currentAnswers, optIdx] });
            }
        } else {
            setAnswers({ ...answers, [currentIdx]: optIdx });
        }
    };

    const clearAnswer = () => {
        const newAnswers = { ...answers };
        delete newAnswers[currentIdx];
        setAnswers(newAnswers);
    };

    const isSelected = (optIdx) => {
        const ans = answers[currentIdx];
        if (Array.isArray(ans)) return ans.includes(optIdx);
        return ans === optIdx;
    };

    const progress = ((currentIdx) / questions.length) * 100;

    return (
        <div className="fixed inset-0 z-[300] bg-[#121212] text-white flex flex-col font-satoshi animate-in fade-in duration-500 overflow-hidden">
            {/* Immersive Background Accents */}
            <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-primary-pink/10 rounded-full blur-[150px] pointer-events-none opacity-40 animate-pulse" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[150px] pointer-events-none opacity-30" />

            {/* Premium Header */}
            <header className="h-[88px] border-b border-white/[0.05] flex items-center justify-between px-12 bg-black/40 backdrop-blur-2xl relative z-20">
                <div className="flex items-center gap-8">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-primary-pink uppercase tracking-[0.4em] mb-1.5 opacity-80">Assessment Session</span>
                        <div className="flex items-center gap-4">
                            <h2 className="text-[20px] font-black text-white tracking-tight">
                                {isFinished ? 'Submitting Results...' : `Question ${currentIdx + 1} / ${questions.length}`}
                            </h2>
                            {!isFinished && (
                                <div className="px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-[9px] font-black text-white/40 uppercase tracking-widest">
                                    {currentQuestion?.type}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-8">
                    {!isFinished && (
                        <div className="flex items-center gap-5 bg-white/[0.03] border border-white/5 py-2.5 px-6 rounded-2xl shadow-inner">
                            <div className="w-48 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-gradient-to-r from-primary-pink via-[#FF8C42] to-primary-pink bg-[length:200%_100%] transition-all duration-1000 ease-out animate-shimmer" 
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <span className="text-[11px] font-black text-white/30 whitespace-nowrap tracking-widest">{Math.round(progress)}% COMPLETE</span>
                        </div>
                    )}
                    
                    <button 
                        onClick={onClose}
                        className="w-11 h-11 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all group active:scale-90 shadow-xl"
                    >
                        <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                    </button>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto relative z-10 flex flex-col items-center custom-scrollbar">
                <div className="w-full max-w-5xl px-12 py-16">
                    {!isFinished ? (
                        <div className="animate-in fade-in slide-in-from-bottom-12 duration-1000">
                            {/* Question Workspace Card */}
                            <div className="bg-[#2A2A2A]/80 backdrop-blur-3xl border border-white/10 rounded-[40px] p-12 shadow-[0_40px_100px_rgba(0,0,0,0.6)] relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-pink/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                
                                {/* Utility Toolbar Above Question */}
                                <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center gap-3">
                                            <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">Marks Allocation</span>
                                            <span className="text-[15px] font-black text-primary-pink leading-none">{currentQuestion?.marks || 1}</span>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={clearAnswer}
                                        className="flex items-center gap-2 text-[10px] font-black text-white/30 hover:text-white transition-all uppercase tracking-widest px-4 py-2 hover:bg-white/5 rounded-xl border border-white/5"
                                    >
                                        <RotateCcw size={12} /> Clear answer choice
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-start gap-5">
                                        <div className="w-12 h-12 rounded-[18px] bg-primary-pink/10 border border-primary-pink/20 flex items-center justify-center text-primary-pink font-black text-[18px] shrink-0 mt-1">
                                            {currentIdx + 1}
                                        </div>
                                        <div className="space-y-4">
                                            <h1 className="text-[36px] font-black text-white leading-[1.1] tracking-tighter">
                                                {currentQuestion?.question}
                                            </h1>
                                            {currentQuestion?.description && (
                                                <p className="text-white/40 text-[17px] leading-relaxed max-w-4xl">
                                                    {currentQuestion.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Options Grid within Content Card */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 px-4 pb-4">
                                    {currentQuestion?.options?.map((opt, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleSelectOption(idx)}
                                            className={`group relative flex items-center gap-6 p-6 rounded-[28px] border-2 transition-all duration-500 text-left overflow-hidden ${
                                                isSelected(idx) 
                                                    ? 'bg-primary-pink/[0.08] border-primary-pink shadow-[0_0_50px_rgba(255,46,155,0.15)] scale-[1.02]' 
                                                    : 'bg-black/20 border-white/5 hover:border-white/20 hover:bg-black/30'
                                            }`}
                                        >
                                            <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-500 shrink-0 ${
                                                isSelected(idx)
                                                    ? 'bg-primary-pink border-primary-pink shadow-[0_0_15px_rgba(255,46,155,0.6)]'
                                                    : 'border-white/10 group-hover:border-white/30'
                                            }`}>
                                                {isSelected(idx) && (
                                                    <Check size={16} className="text-white" strokeWidth={5} />
                                                )}
                                            </div>
                                            
                                            <div className="flex-1 z-10">
                                                {opt.type === 'Image' ? (
                                                    <div className="space-y-4">
                                                        {opt.image && (
                                                            <div className="relative rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
                                                                <img 
                                                                    src={opt.image} 
                                                                    alt={`Option ${idx + 1}`} 
                                                                    className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-1000"
                                                                    loading="lazy"
                                                                />
                                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                                            </div>
                                                        )}
                                                        <span className={`text-[17px] font-bold tracking-tight block ${isSelected(idx) ? 'text-white' : 'text-white/70 group-hover:text-white'} transition-colors`}>
                                                            {opt.content}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className={`text-[18px] font-bold tracking-tight ${isSelected(idx) ? 'text-white' : 'text-white/70 group-hover:text-white'} transition-colors`}>
                                                        {typeof opt === 'string' ? opt : (opt.content || '')}
                                                    </span>
                                                )}
                                            </div>

                                            {isSelected(idx) && (
                                                <div className="absolute -right-4 -top-4 w-32 h-32 bg-primary-pink/10 rounded-full blur-[40px] pointer-events-none" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="max-w-xl mx-auto text-center space-y-10 animate-in zoom-in-95 fade-in duration-1000 bg-[#2A2A2A]/80 backdrop-blur-3xl border border-white/10 rounded-[48px] p-20 shadow-[0_60px_130px_rgba(0,0,0,0.7)] mt-10">
                             <div className="relative inline-flex group/award">
                                <div className="absolute inset-0 bg-primary-pink/30 rounded-[40px] blur-[30px] group-hover:blur-[50px] transition-all duration-700" />
                                <div className="relative w-28 h-28 bg-gradient-to-br from-primary-pink to-[#FF8C42] rounded-[40px] flex items-center justify-center text-white shadow-2xl">
                                    <Award size={56} strokeWidth={1.5} />
                                </div>
                             </div>
                             <div className="space-y-4">
                                <h1 className="text-[54px] font-black text-white tracking-tighter leading-none">Victory!</h1>
                                <p className="text-white/40 text-[18px] leading-relaxed font-medium">You have navigated through all the questions. Ready to submit and see the impact?</p>
                             </div>
                             
                             <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
                                <button 
                                    onClick={() => {
                                        setCurrentIdx(0);
                                        setAnswers({});
                                    }}
                                    className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-white/[0.03] border border-white/10 text-[13px] font-black uppercase tracking-[0.2em] hover:bg-white/10 hover:border-white/30 transition-all flex items-center justify-center gap-3 active:scale-95 shadow-2xl"
                                >
                                    <RotateCcw size={18} /> Retake Test
                                </button>
                                <button 
                                    onClick={onClose}
                                    className="w-full sm:w-auto px-12 py-5 rounded-2xl bg-primary-pink text-white text-[13px] font-black uppercase tracking-[0.3em] hover:shadow-[0_0_50px_rgba(255,46,155,0.5)] transition-all active:scale-95 shadow-2xl"
                                >
                                    Finish Preview
                                </button>
                             </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Sticky Command Center (Footer) */}
            {!isFinished && (
                <footer className="h-[104px] border-t border-white/[0.05] bg-black/40 backdrop-blur-3xl px-12 flex items-center justify-between relative z-20 shadow-[0_-20px_50px_rgba(0,0,0,0.3)]">
                    <button 
                        onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
                        disabled={currentIdx === 0}
                        className={`flex items-center gap-4 px-8 py-4 rounded-2xl border transition-all text-[11px] font-black uppercase tracking-[0.3em] ${
                            currentIdx === 0 
                                ? 'border-white/5 text-white/[0.02] cursor-not-allowed' 
                                : 'border-white/10 text-white/40 hover:text-white hover:bg-white/5 hover:border-white/20'
                        }`}
                    >
                        <ChevronLeft size={18} /> BACK
                    </button>

                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setCurrentIdx(currentIdx + 1)}
                            className="px-10 py-4 rounded-2xl bg-white/[0.02] border border-white/5 text-white/30 hover:text-white hover:bg-white/5 transition-all text-[11px] font-black uppercase tracking-[0.2em] hover:border-white/20 shadow-xl"
                        >
                            Skip Phase
                        </button>
                        <button 
                            onClick={() => setCurrentIdx(currentIdx + 1)}
                            disabled={answers[currentIdx] === undefined}
                            className={`flex items-center gap-5 px-14 py-4 rounded-[20px] font-black text-[13px] uppercase tracking-[0.4em] transition-all shadow-3xl overflow-hidden relative group ${
                                answers[currentIdx] === undefined
                                    ? 'bg-white/[0.03] text-white/10 border border-white/5 cursor-not-allowed'
                                    : 'bg-primary-pink text-white hover:shadow-[0_0_50px_rgba(255,46,155,0.4)] active:scale-95'
                            }`}
                        >
                            <span className="relative z-10">{currentIdx === questions.length - 1 ? 'CONCLUDE TEST' : 'NEXT PHASE'}</span>
                            <ChevronRight size={20} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                            {answers[currentIdx] !== undefined && (
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                            )}
                        </button>
                    </div>
                </footer>
            )}
        </div>
    );
};

export default QuizLearnerPreview;
