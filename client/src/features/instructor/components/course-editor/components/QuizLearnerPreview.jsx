import React, { useState } from 'react';
import { 
    X, Check, ChevronLeft, ChevronRight, RotateCcw, Award
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

            {/* Header */}
            <header className="h-14 border-b border-white/[0.05] flex items-center justify-between px-6 sm:px-8 bg-black/40 backdrop-blur-xl relative z-20">
                <div className="flex items-center gap-4">
                    <span className="text-[9px] font-bold text-primary-pink uppercase tracking-widest opacity-90">Assessment Session</span>
                    <span className="text-white/40">·</span>
                    <h2 className="text-sm font-bold text-white tracking-tight">
                        {isFinished ? 'Submitting...' : `Question ${currentIdx + 1}/${questions.length}`}
                    </h2>
                    {!isFinished && (
                        <span className="px-2 py-0.5 rounded-md bg-white/[0.06] border border-white/10 text-[10px] font-bold text-white/50 uppercase">
                            {currentQuestion?.type}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    {!isFinished && (
                        <div className="flex items-center gap-3 bg-white/[0.03] border border-white/5 py-1.5 px-4 rounded-xl">
                            <div className="w-24 h-1 bg-white/5 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-gradient-to-r from-primary-pink to-[#FF8C42] transition-all duration-500" 
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <span className="text-[10px] font-bold text-white/40">{Math.round(progress)}%</span>
                        </div>
                    )}
                    <button 
                        onClick={onClose}
                        className="w-9 h-9 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
                    >
                        <X size={18} />
                    </button>
                </div>
            </header>

            {/* Main Content Area - centered */}
            <main className="flex-1 overflow-y-auto relative z-10 flex flex-col items-center justify-center custom-scrollbar">
                <div className="w-full max-w-3xl px-4 sm:px-6 py-8 sm:py-10 mx-auto">
                    {!isFinished ? (
                        <div className="animate-in fade-in duration-300">
                            {/* Question Card */}
                            <div className="bg-[#1E1E1E] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
                                {/* Toolbar */}
                                <div className="flex items-center justify-between mb-5 pb-4 border-b border-white/5">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Marks</span>
                                        <span className="text-base font-bold text-primary-pink">{currentQuestion?.marks || 1}</span>
                                    </div>
                                    <button 
                                        onClick={clearAnswer}
                                        className="flex items-center gap-2 text-[10px] font-bold text-white/40 hover:text-white transition-colors uppercase tracking-wide px-3 py-2 hover:bg-white/5 rounded-lg"
                                    >
                                        <RotateCcw size={12} /> Clear
                                    </button>
                                </div>

                                {/* Question */}
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="w-10 h-10 rounded-xl bg-primary-pink/15 border border-primary-pink/30 flex items-center justify-center text-primary-pink font-bold text-base shrink-0">
                                        {currentIdx + 1}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h1 className="text-xl sm:text-2xl font-bold text-white leading-snug">
                                            {currentQuestion?.question}
                                        </h1>
                                        {currentQuestion?.description && (
                                            <p className="text-white/50 text-sm sm:text-base mt-1.5 leading-relaxed">
                                                {currentQuestion.description}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Options */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                    {currentQuestion?.options?.map((opt, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleSelectOption(idx)}
                                            className={`group relative flex items-center gap-4 p-4 sm:p-5 rounded-xl border transition-all text-left overflow-hidden ${
                                                isSelected(idx) 
                                                    ? 'bg-primary-pink/10 border-primary-pink/50' 
                                                    : 'bg-white/[0.03] border-white/10 hover:border-white/20 hover:bg-white/[0.06]'
                                            }`}
                                        >
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                                isSelected(idx)
                                                    ? 'bg-primary-pink border-primary-pink'
                                                    : 'border-white/20 group-hover:border-white/40'
                                            }`}>
                                                {isSelected(idx) && (
                                                    <Check size={14} className="text-white" strokeWidth={3} />
                                                )}
                                            </div>
                                            
                                            <div className="flex-1 z-10 min-w-0">
                                                {opt.type === 'Image' ? (
                                                    <div className="space-y-2">
                                                        {opt.image && (
                                                            <div className="relative rounded-lg overflow-hidden border border-white/5">
                                                                <img 
                                                                    src={opt.image} 
                                                                    alt={`Option ${idx + 1}`} 
                                                                    className="w-full h-28 object-cover"
                                                                    loading="lazy"
                                                                />
                                                            </div>
                                                        )}
                                                        <span className={`text-base font-medium block ${isSelected(idx) ? 'text-white' : 'text-white/70'}`}>
                                                            {opt.content}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className={`text-base font-medium ${isSelected(idx) ? 'text-white' : 'text-white/70 group-hover:text-white'}`}>
                                                        {typeof opt === 'string' ? opt : (opt.content || '')}
                                                    </span>
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="max-w-md mx-auto text-center space-y-6 animate-in zoom-in-95 fade-in duration-300 bg-[#1E1E1E] border border-white/10 rounded-2xl p-10 shadow-xl mt-6">
                            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary-pink to-[#FF8C42] rounded-2xl flex items-center justify-center text-white">
                                <Award size={40} strokeWidth={1.5} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-white">Victory!</h1>
                                <p className="text-white/50 text-base mt-1.5">You've completed all questions. Ready to submit?</p>
                            </div>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                                <button 
                                    onClick={() => { setCurrentIdx(0); setAnswers({}); }}
                                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-xs font-bold uppercase tracking-wide hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                                >
                                    <RotateCcw size={14} /> Retake
                                </button>
                                <button 
                                    onClick={onClose}
                                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-primary-pink text-white text-xs font-bold uppercase tracking-wide hover:opacity-90 transition-all"
                                >
                                    Finish Preview
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Footer */}
            {!isFinished && (
                <footer className="h-16 border-t border-white/[0.05] bg-black/40 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between relative z-20">
                    <button 
                        onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
                        disabled={currentIdx === 0}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold uppercase tracking-wide transition-all ${
                            currentIdx === 0 
                                ? 'border-white/5 text-white/20 cursor-not-allowed' 
                                : 'border-white/10 text-white/50 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        <ChevronLeft size={16} /> Prev
                    </button>

                    <div className="flex items-center gap-2 sm:gap-3">
                        <button 
                            onClick={() => setCurrentIdx(currentIdx + 1)}
                            className="px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white/50 hover:text-white hover:bg-white/5 text-xs font-bold uppercase tracking-wide transition-all"
                        >
                            Skip
                        </button>
                        <button 
                            onClick={() => setCurrentIdx(currentIdx + 1)}
                            disabled={answers[currentIdx] === undefined}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide transition-all ${
                                answers[currentIdx] === undefined
                                    ? 'bg-white/[0.03] text-white/20 border border-white/5 cursor-not-allowed'
                                    : 'bg-primary-pink text-white hover:opacity-90 active:scale-[0.98]'
                            }`}
                        >
                            {currentIdx === questions.length - 1 ? 'Finish' : 'Next'}
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </footer>
            )}
        </div>
    );
};

export default QuizLearnerPreview;
