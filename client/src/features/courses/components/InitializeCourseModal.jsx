import React, { useState } from 'react';
import { BookOpen, Sparkles } from 'lucide-react';
import { Modal, Button, Input } from '@/components/ui';

/**
 * InitializeCourseModal
 * Captures the initial title before heading to the full editor.
 */
const InitializeCourseModal = ({ isOpen, onClose, onContinue, isCreating }) => {
    const [title, setTitle] = useState('');
    const maxTitleLength = 100;
  
    const handleContinue = () => {
        if (title.trim()) {
            onContinue({ title });
        }
    };

    return (
      <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        title="Create New Course"
        maxWidth="380px"
      >
        <div className="flex flex-col items-center">
            <div className="relative group mb-5">
                <div className="absolute inset-0 bg-[#FF8C42]/10 dark:bg-[#FF8C42]/20 blur-xl rounded-full scale-125 animate-pulse" />
                <div className="relative w-14 h-14 bg-gray-100 dark:bg-white/5 rounded-xl flex items-center justify-center border border-gray-200 dark:border-white/10 shadow-sm overflow-hidden group-hover:scale-105 transition-transform duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#FF8C42]/10 to-transparent dark:from-[#FF8C42]/20" />
                    <Sparkles className="text-[#FF8C42] relative z-10" size={28} strokeWidth={1.5} />
                </div>
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 text-center tracking-tight leading-tight">
                What's the title of your{' '}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FF8C42] to-[#FF3FB4]">
                    next course?
                </span>
            </h3>
            <p className="text-gray-500 dark:text-white/50 text-center text-sm leading-relaxed mb-6 max-w-[300px]">
                Start with a working title. You can always refine this as you develop your content.
            </p>
            
            <div className="w-full relative group/input">
                <input 
                  type="text"
                  placeholder="e.g. Introduction to Modern Arts"
                  maxLength={maxTitleLength}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full h-12 bg-gray-50 dark:bg-white/[0.05] border border-gray-200 dark:border-white/10 rounded-xl px-4 pr-16 text-gray-900 dark:text-white focus:outline-none focus:border-[#FF8C42]/40 focus:ring-2 focus:ring-[#FF8C42]/20 transition-all placeholder:text-gray-400 dark:placeholder:text-white/30 font-satoshi text-sm"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                    <span className="text-[10px] font-bold text-gray-400 dark:text-white/30 bg-gray-200/50 dark:bg-white/5 px-2 py-0.5 rounded-md uppercase tracking-wider">
                      {title.length}/{maxTitleLength}
                    </span>
                </div>
            </div>

            <Button 
              disabled={!title.trim() || isCreating}
              onClick={handleContinue}
              isLoading={isCreating}
              className={`w-full h-12 rounded-xl mt-6 font-bold text-white transition-all border relative overflow-hidden ${
                title.trim() && !isCreating 
                  ? 'bg-gradient-to-r from-[#FF8C42] to-[#FF3FB4] border-[#FF8C42]/30 hover:opacity-90 shadow-lg shadow-[#FF8C42]/20' 
                  : 'bg-gray-300 dark:bg-white/10 text-gray-500 dark:text-white/30 cursor-not-allowed border-gray-200 dark:border-white/10'
              }`}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Continue to Creation
              </span>
            </Button>
        </div>
      </Modal>
    );
};

export default InitializeCourseModal;
