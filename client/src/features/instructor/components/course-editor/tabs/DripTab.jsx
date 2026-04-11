import React, { useId } from 'react';
import { HelpCircle } from 'lucide-react';
import { Card, Button, ContentCard } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';
import { useConfirmDialog } from '@/components/ui/ConfirmDialog';
import courseService from '@/features/courses/services/courseService';
import { logger } from '@/utils/logger';

function HelpCircleGradient({ id, size = 12 }) {
    // Lucide HelpCircle (aliased to circle-question-mark) recreated with gradient stroke.
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            className="flex-shrink-0"
        >
            <defs>
                <linearGradient id={id} x1="4" y1="4" x2="20" y2="20" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#FF8C42" />
                    <stop offset="1" stopColor="#FF3FB4" />
                </linearGradient>
            </defs>
            <circle
                cx="12"
                cy="12"
                r="10"
                stroke={`url(#${id})`}
                strokeWidth="2"
            />
            <path
                d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"
                stroke={`url(#${id})`}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M12 17h.01"
                stroke={`url(#${id})`}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

/**
 * Drip scheduling tab for managing content unlock strategies
 */
const DripTab = ({ 
    courseDetails, 
    setCourseDetails,
    activeDripType, 
    setActiveDripType,
    handleSave,
    isSaving
}) => {
    const helpGradId = useId();
    const toast = useToast();
    const { confirm } = useConfirmDialog();
    const handleSectionDripChange = (idx, value) => {
        const updatedSections = [...courseDetails.sections];
        // Keep it empty string if value is empty, or parse to number
        const dripValue = value === '' ? '' : parseInt(value);
        updatedSections[idx] = {
            ...updatedSections[idx],
            dripDays: dripValue,
            drip_days: dripValue // Fallback for backend
        };
        setCourseDetails({
            ...courseDetails,
            sections: updatedSections
        });
    };

    const handleSectionUnlockDateChange = (idx, value) => {
        const updatedSections = [...courseDetails.sections];
        updatedSections[idx] = {
            ...updatedSections[idx],
            unlockDate: value
        };
        setCourseDetails({
            ...courseDetails,
            sections: updatedSections
        });
    };

    const handleSaveDrip = async () => {
        // Validation
        if (activeDripType === 'Learner enrollment date') {
            const hasEmptySection = courseDetails.sections?.some(section => 
                (section.dripDays === undefined || section.dripDays === null || section.dripDays === '') &&
                (section.drip_days === undefined || section.drip_days === null || section.drip_days === '')
            );
            if (hasEmptySection) {
                toast.error('Validation Error', 'Please enter drip days for all sections.');
                return;
            }
        }

        if (activeDripType === 'On a specific date') {
            const hasEmptySection = courseDetails.sections?.some(section => !section.unlockDate);
            if (hasEmptySection) {
                toast.error('Validation Error', 'Please select an unlock date for all sections.');
                return;
            }

            const confirmed = await confirm({
                title: 'Important!',
                message: "If the selected date is ahead of the expiry date of the course, your customers won't be able to access them beyond the expiry date.",
                confirmText: 'Proceed',
                variant: 'warning'
            });

            if (!confirmed) return;
        }

        try {
            // 1. Save all sections drip days
            // We'll do this sequentially to be safe and avoid concurrent DB lock issues
            for (let i = 0; i < courseDetails.sections.length; i++) {
                const section = courseDetails.sections[i];
                const sId = section._id || section.id;
                const dDays = section.dripDays || 0;
                const uDate = section.unlockDate || null;
                
                // If by completion, we assume 100% completion of previous section is required (except for first section)
                let cPercent = section.completionPercentage || 0;
                if (activeDripType === 'By completion') {
                    cPercent = i === 0 ? 0 : 100;
                }

                await courseService.updateSection(sId, { 
                    dripDays: dDays,
                    drip_days: dDays, // Fallback for backend
                    unlockDate: uDate,
                    completionPercentage: cPercent
                });
            }

            // 2. Save course-level drip type and skip immediate refresh in handleSave
            await handleSave(null, false, false);
        } catch (error) {
            logger.error("Failed to save drip settings", error);
            toast.error('Save Failed', 'Failed to save drip settings. Please try again.');
        }
    };

    return (
        <div className="flex-1 min-h-0 flex flex-col min-w-0 animate-in slide-in-from-right-4 duration-500 font-satoshi transition-colors duration-300">
            <ContentCard
                title="Content schedule"
                subtitle="Select when the content will be unlocked for learners."
                variant="flat"
                headerRight={
                    <Button
                        variant="primary"
                        onClick={handleSaveDrip}
                        isLoading={isSaving}
                        className="px-8 py-2 text-xs uppercase tracking-widest font-black h-auto bg-gradient-to-r from-[#FF8C42] to-[#FF3FB4] text-white hover:opacity-90 transition-all shadow-lg shadow-[0_0_18px_rgba(255,63,180,0.25)]"
                    >
                        Save
                    </Button>
                }
                className="flex-1 min-h-0 min-w-0"
            >
            <div className="space-y-6">
                <div className="space-y-1">
                    <h2 className="text-[17px] font-black text-gray-900 dark:text-white px-1 transition-colors duration-300">Drip type</h2>
                    <p className="text-[12px] text-gray-500 dark:text-white/40 font-medium px-1 transition-colors duration-300">Select when the content will be unlocked.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        'Learner enrollment date',
                        'On a specific date',
                        'By completion',
                        'No drip'
                    ].map((type) => (
                        <button 
                            key={type}
                            onClick={() => setActiveDripType(type)}
                            className={`flex flex-col gap-4 p-4 rounded-xl border transition-all duration-300 ${
                                activeDripType === type 
                                    ? 'bg-gradient-to-r from-[#FF8C42]/10 to-[#FF3FB4]/10 border-transparent text-gray-900 dark:text-white shadow-[0_0_0_1px_rgba(255,63,180,0.45)]'
                                    : 'bg-white dark:bg-white/5 border-gray-200 dark:border-white/5 text-gray-500 dark:text-white/40 hover:border-gray-300 dark:hover:border-white/10 shadow-sm dark:shadow-none'
                            }`}
                        >
                            <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`w-4 h-4 rounded-full p-[3px] flex items-center justify-center transition-colors duration-300 ${
                                            activeDripType === type
                                                ? 'bg-gradient-to-r from-[#FF8C42] to-[#FF3FB4]'
                                                : 'bg-gray-300 dark:bg-white/10'
                                        }`}
                                    >
                                        <div
                                            className={`w-full h-full rounded-full flex items-center justify-center ${
                                                activeDripType === type ? 'bg-white dark:bg-obsidian' : 'bg-white dark:bg-[#161616]'
                                            }`}
                                        >
                                            {activeDripType === type && (
                                                <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-[#FF8C42] to-[#FF3FB4]" />
                                            )}
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold leading-none">{type}</span>
                                </div>
                                <HelpCircle size={14} className="opacity-40" />
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                {activeDripType === 'No drip' ? (
                    <Card className="p-12 flex flex-col items-center justify-center text-center rounded-[24px] bg-gray-50 dark:bg-[#1E1E1E] border border-gray-200 dark:border-white/5 shadow-sm dark:shadow-xl min-h-[240px] transition-colors duration-300">
                        <div className="space-y-3">
                            <h2 className="text-xl font-black text-gray-900 dark:text-white transition-colors duration-300">No drip action</h2>
                            <p className="text-sm font-medium text-gray-500 dark:text-white/40 max-w-sm transition-colors duration-300">
                                Customers can access all the sections and chapters
                            </p>
                        </div>
                    </Card>
                ) : (
                    courseDetails.sections?.map((section, idx) => (
                        <Card key={section._id || idx} className="p-8 space-y-6 rounded-[24px] bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-white/5 group hover:border-gray-300 dark:hover:border-white/10 transition-all duration-300 shadow-sm dark:shadow-xl">
                            <div className="space-y-1">
                                <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wide transition-colors duration-300">Section {idx + 1}: {section.title}</h3>
                                <p className="text-[11px] font-black text-gray-500 dark:text-white/20 uppercase tracking-widest transition-colors duration-300">
                                    {section.chapters?.length || 0} Published Chapters
                                </p>
                            </div>

                            {activeDripType === 'Learner enrollment date' && (
                                <div className="flex items-center gap-4 py-4 px-6 bg-gray-50 dark:bg-[#2A2A2A] border border-gray-200 dark:border-white/5 rounded-2xl w-fit shadow-inner transition-colors duration-300">
                                    <span className="text-xs font-bold text-gray-500 dark:text-white/40 transition-colors duration-300">will be unlocked</span>
                                    <div className="flex items-center bg-white dark:bg-black/40 border border-gray-300 dark:border-white/10 rounded-xl overflow-hidden shadow-sm transition-colors duration-300">
                                        <input 
                                            type="number" 
                                            value={section.dripDays ?? section.drip_days ?? ''}
                                            onChange={(e) => handleSectionDripChange(idx, e.target.value)}
                                            placeholder="0"
                                            min="0"
                                            className="w-16 bg-transparent py-3 text-center text-sm font-black text-gray-900 dark:text-white focus:outline-none border-none focus:ring-0 placeholder:text-gray-400 dark:placeholder:text-white/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-colors duration-300"
                                        />
                                        <div className="bg-gray-100 dark:bg-white/5 px-4 py-3 border-l border-gray-200 dark:border-white/10 text-[10px] font-black text-gray-500 dark:text-white/40 uppercase tracking-widest pointer-events-none transition-colors duration-300">
                                            days
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-gray-500 dark:text-white/40 transition-colors duration-300">after enrollment</span>
                                </div>
                            )}

                            {activeDripType === 'On a specific date' && (
                                <div className="flex items-center gap-4 py-4 px-6 bg-gray-50 dark:bg-[#2A2A2A] border border-gray-200 dark:border-white/5 rounded-2xl w-fit shadow-inner transition-colors duration-300">
                                    <span className="text-xs font-bold text-gray-500 dark:text-white/40 transition-colors duration-300">will be unlocked on</span>
                                    <div className="flex items-center bg-white dark:bg-black/40 border border-gray-300 dark:border-white/10 rounded-xl overflow-hidden shadow-sm relative transition-colors duration-300">
                                        <input 
                                            type="date" 
                                            value={section.unlockDate ? new Date(section.unlockDate).toISOString().split('T')[0] : ''}
                                            onChange={(e) => handleSectionUnlockDateChange(idx, e.target.value)}
                                            className="bg-transparent py-3 px-4 text-sm font-black text-gray-900 dark:text-white focus:outline-none border-none focus:ring-0 placeholder:text-gray-400 dark:placeholder:text-white/20 min-w-[160px] cursor-pointer dark:[&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-50 hover:[&::-webkit-calendar-picker-indicator]:opacity-100 transition-colors duration-300"
                                        />
                                    </div>
                                </div>
                            )}

                            {activeDripType === 'By completion' && (
                                <div className="flex items-center gap-3 py-4 px-6 bg-gray-50 dark:bg-[#2A2A2A] border border-gray-200 dark:border-white/5 rounded-2xl w-fit shadow-inner transition-colors duration-300">
                                    {idx === 0 ? (
                                        <span className="text-xs font-bold text-gray-500 dark:text-white/40 transition-colors duration-300">
                                            This section is by default open for the customers
                                        </span>
                                    ) : (
                                        <>
                                            <div className="w-5 h-5 rounded-full bg-gradient-to-r from-[#FF8C42]/10 to-[#FF3FB4]/10 flex items-center justify-center transition-colors duration-300">
                                                <HelpCircleGradient id={`${helpGradId}-${idx}`} size={12} />
                                            </div>
                                            <span className="text-xs font-bold text-gray-500 dark:text-white/40 transition-colors duration-300">
                                                As soon as you complete all the chapters from the above sections, this section will open for you
                                            </span>
                                        </>
                                    )}
                                </div>
                            )}
                        </Card>
                    ))
                )}
            </div>
            </ContentCard>
        </div>
    );
};

export default DripTab;
