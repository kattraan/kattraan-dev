import React from 'react';
import { Upload, Globe, Lock, Save } from 'lucide-react';
import { Card, ContentCard } from '@/components/ui';
import CourseDescriptionRichEditor from '../components/CourseDescriptionRichEditor';
import { courseDescriptionPlainLength } from '@/utils/courseDescriptionHtml';

/**
 * Information tab for course metadata and settings
 */
const InformationTab = ({ 
    courseDetails, 
    setCourseDetails, 
    handleUpdateDetails,
    fileInputRef, 
    setActiveFileUploadType,
    handleSave,
    isSaving,
}) => {
    return (
        <div className="flex-1 min-h-0 flex flex-col min-w-0 animate-in slide-in-from-right-4 duration-500 font-satoshi">
            <ContentCard
                title="Course Information"
                subtitle="Details, pricing, and settings for your course"
                headerBorder={true}
                variant="flat"
                headerRight={
                    <button
                        type="button"
                        onClick={() => handleSave && handleSave()}
                        disabled={isSaving}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF8C42] to-[#FF3FB4] text-white font-semibold text-sm hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 shadow-sm"
                    >
                        <Save size={18} />
                        {isSaving ? 'Saving…' : 'Save'}
                    </button>
                }
                className="flex-1 min-h-0 min-w-0"
            >
                <div className="space-y-10">
                <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-600 dark:text-white/60 transition-colors duration-300">Course Title <span className="text-red-500">*</span></label>
                    <input 
                        className="w-full bg-gray-50 dark:bg-[#3A3A3A] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/20 outline-none focus:border-primary-pink transition-all duration-300" 
                        placeholder="Sample course titled text will be placed here or there"
                        value={courseDetails.title}
                        onChange={(e) => setCourseDetails({ ...courseDetails, title: e.target.value })}
                    />
                </div>

                {/* Cover Image Upload */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-600 dark:text-white/60 transition-colors duration-300">Cover Image <span className="text-red-500">*</span></label>
                    <Card 
                        onClick={() => { setActiveFileUploadType('course-cover'); fileInputRef.current.click(); }}
                        className="bg-gray-50 dark:bg-[#3A3A3A] border-2 border-dashed border-gray-300 dark:border-white/10 rounded-xl p-12 flex flex-col items-center justify-center cursor-pointer hover:border-primary-pink/50 dark:hover:border-white/20 transition-all duration-300"
                    >
                        {courseDetails.thumbnail ? (
                            <img src={courseDetails.thumbnail} alt="Cover" className="max-h-40 rounded-lg" loading="lazy" />
                        ) : (
                            <>
                                <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-white/5 flex items-center justify-center mb-3 transition-colors duration-300">
                                    <Upload size={24} className="text-gray-500 dark:text-white/40 transition-colors duration-300" />
                                </div>
                                <p className="text-sm font-bold text-gray-900 dark:text-white mb-1 transition-colors duration-300">Drop your image here, or <span className="bg-gradient-to-r from-[#FF8A80] to-[#C946C6] bg-clip-text text-transparent underline decoration-[#FF8A80]">browse</span></p>
                                <p className="text-xs text-gray-500 dark:text-white/40 transition-colors duration-300">Supports: JPG, JPEG, PNG (Max 500KB)</p>
                            </>
                        )}
                    </Card>
                    <p className="text-xs text-gray-400 dark:text-white/30 transition-colors duration-300">Image must be at least 500 px wide. Optimize your size for better performance.</p>
                </div>

                {/* Intro Video Upload */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-600 dark:text-white/60 transition-colors duration-300">Intro video (Optional)</label>
                    <Card 
                        onClick={() => { setActiveFileUploadType('course-thumbnail'); fileInputRef.current.click(); }}
                        className="bg-gray-50 dark:bg-[#3A3A3A] border-2 border-dashed border-gray-300 dark:border-white/10 rounded-xl p-12 flex flex-col items-center justify-center cursor-pointer hover:border-primary-pink/50 dark:hover:border-white/20 transition-all duration-300"
                    >
                        {courseDetails.image ? (
                            <video src={courseDetails.image} controls className="max-h-40 rounded-lg" preload="metadata" />
                        ) : (
                            <>
                                <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-white/5 flex items-center justify-center mb-3 transition-colors duration-300">
                                    <Upload size={24} className="text-gray-500 dark:text-white/40 transition-colors duration-300" />
                                </div>
                                <p className="text-sm font-bold text-gray-900 dark:text-white mb-1 transition-colors duration-300">Drop your video here, or <span className="bg-gradient-to-r from-[#FF8A80] to-[#C946C6] bg-clip-text text-transparent underline decoration-[#FF8A80]">browse</span></p>
                                <p className="text-xs text-gray-500 dark:text-white/40 transition-colors duration-300">Supports: MP4, WebM, MOV (recommended max 100MB)</p>
                            </>
                        )}
                    </Card>
                    <p className="text-xs text-gray-400 dark:text-white/30 transition-colors duration-300">Short intro video to showcase your course. Use a clear, engaging clip for best results.</p>
                </div>

                {/* Course Description */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-600 dark:text-white/60 transition-colors duration-300">Course Description <span className="text-red-500">*</span></label>
                    <CourseDescriptionRichEditor
                        value={courseDetails.description || ''}
                        onChange={(html) =>
                            setCourseDetails({ ...courseDetails, description: html })
                        }
                        placeholder="Describe what learners will learn in this course. Use the list buttons for bullet or numbered points."
                    />
                    <p className="text-xs text-gray-400 dark:text-white/30 transition-colors duration-300">
                        {courseDescriptionPlainLength(courseDetails.description)} characters (plain text) · at least 200 to proceed
                    </p>
                </div>

                {/* Category and Skill Level */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-600 dark:text-white/60 transition-colors duration-300">Category <span className="text-red-500">*</span></label>
                        <select
                            className="w-full bg-gray-50 dark:bg-[#3A3A3A] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white outline-none focus:border-primary-pink transition-all duration-300"
                            value={courseDetails.category ?? ''}
                            onChange={(e) => handleUpdateDetails && handleUpdateDetails({ category: e.target.value })}
                        >
                            <option value="">Select Category</option>
                            <option value="Development">Development</option>
                            <option value="Design">Design</option>
                            <option value="Marketing">Marketing</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-600 dark:text-white/60 transition-colors duration-300">Skill Level <span className="text-red-500">*</span></label>
                        <select
                            className="w-full bg-gray-50 dark:bg-[#3A3A3A] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white outline-none focus:border-primary-pink transition-all duration-300"
                            value={courseDetails.level ?? ''}
                            onChange={(e) => handleUpdateDetails && handleUpdateDetails({ level: e.target.value })}
                        >
                            <option value="">Select Level</option>
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                        </select>
                    </div>
                </div>

                {/* Language */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-600 dark:text-white/60 transition-colors duration-300">Language <span className="text-red-500">*</span></label>
                    <select className="w-full bg-gray-50 dark:bg-[#3A3A3A] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white outline-none focus:border-primary-pink transition-all duration-300">
                        <option>English</option>
                        <option>Spanish</option>
                        <option>French</option>
                        <option>German</option>
                    </select>
                </div>
                </div>

                {/* Pricing & Access */}
                <div className="pt-6 border-t border-gray-100 dark:border-white/5">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 transition-colors duration-300">Pricing & Access</h3>
                <p className="text-gray-500 dark:text-white/40 text-sm mb-6 transition-colors duration-300">Set your course pricing and visibility options</p>

                {/* Course Type */}
                <div className="mb-8">
                    <label className="block text-[11px] font-bold text-gray-500 dark:text-white/40 uppercase tracking-widest mb-4 transition-colors duration-300">Course Type *</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Free */}
                        <div 
                            onClick={() => handleUpdateDetails && handleUpdateDetails({ price: 0 })}
                            className={`cursor-pointer rounded-2xl border p-5 flex items-center gap-4 transition-all duration-300 ${!courseDetails?.price ? 'bg-gray-50 dark:bg-white/10 border-gray-300 dark:border-white/20 border-2 shadow-sm' : 'bg-transparent border-gray-200 dark:border-white/5 hover:border-2 hover:border-gray-300 dark:hover:border-white/20 hover:bg-gray-50 dark:hover:bg-white/[0.01]'}`}
                        >
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors duration-300 ${!courseDetails?.price ? 'border-primary-pink' : 'border-gray-300 dark:border-white/20'}`}>
                                {!courseDetails?.price && <div className="w-2.5 h-2.5 rounded-full bg-primary-pink" />}
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 dark:text-white text-sm transition-colors duration-300">Free</h4>
                                <p className="text-xs text-gray-500 dark:text-white/40 mt-0.5 transition-colors duration-300">Open to everyone</p>
                            </div>
                        </div>

                        {/* Paid */}
                        <div 
                            onClick={() => handleUpdateDetails && handleUpdateDetails({ price: courseDetails?.price > 0 ? courseDetails.price : 99 })}
                            className={`cursor-pointer rounded-2xl border p-5 flex items-center gap-4 transition-all duration-300 ${courseDetails?.price > 0 ? 'bg-gray-50 dark:bg-white/10 border-gray-300 dark:border-white/20 border-2 shadow-sm' : 'bg-transparent border-gray-200 dark:border-white/5 hover:border-2 hover:border-gray-300 dark:hover:border-white/20 hover:bg-gray-50 dark:hover:bg-white/[0.02]'}`}
                        >
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors duration-300 ${courseDetails?.price > 0 ? 'border-primary-pink' : 'border-gray-300 dark:border-white/20'}`}>
                                {courseDetails?.price > 0 && <div className="w-2.5 h-2.5 rounded-full bg-primary-pink" />}
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 dark:text-white text-sm transition-colors duration-300">Paid</h4>
                                <p className="text-xs text-gray-500 dark:text-white/40 mt-0.5 transition-colors duration-300">Charge for access</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Course Price & Discount - shown when Paid is selected */}
                {courseDetails?.price > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="space-y-2">
                            <label className="block text-[11px] font-bold text-gray-500 dark:text-white/40 uppercase tracking-widest transition-colors duration-300">Course Price (₹ INR) <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-white/50 font-semibold">₹</span>
                                <input
                                    type="number"
                                    min={0}
                                    step={1}
                                    value={courseDetails.price === 0 ? '' : courseDetails.price}
                                    onChange={(e) => {
                                        const v = parseFloat(e.target.value, 10);
                                        handleUpdateDetails && handleUpdateDetails({ price: Number.isFinite(v) ? v : 0 });
                                    }}
                                    placeholder="999"
                                    className="w-full bg-gray-50 dark:bg-[#3A3A3A] border border-gray-200 dark:border-white/10 rounded-xl pl-8 pr-4 py-3 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 outline-none focus:border-primary-pink transition-all duration-300"
                                />
                            </div>
                            <p className="text-xs text-gray-500 dark:text-white/40 transition-colors duration-300">Base currency: INR — learners see price in their local currency</p>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-[11px] font-bold text-gray-500 dark:text-white/40 uppercase tracking-widest transition-colors duration-300">Discount (Optional)</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    min={0}
                                    max={100}
                                    step={1}
                                    value={courseDetails.discount ?? 0}
                                    onChange={(e) => {
                                        const v = parseFloat(e.target.value, 10);
                                        handleUpdateDetails && handleUpdateDetails({ discount: Number.isFinite(v) ? Math.min(100, Math.max(0, v)) : 0 });
                                    }}
                                    placeholder="20"
                                    className="w-full bg-gray-50 dark:bg-[#3A3A3A] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 pr-8 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 outline-none focus:border-primary-pink transition-all duration-300"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-white/50 font-semibold">%</span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-white/40 transition-colors duration-300">Offer a discount percentage</p>
                        </div>
                    </div>
                )}

                {/* Course Visibility - only one option selected; explicit visibility wins over status. */}
                <div>
                    <label className="block text-[11px] font-bold text-gray-500 dark:text-white/40 uppercase tracking-widest mb-4 transition-colors duration-300">Course Visibility <span className="text-red-500">*</span></label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(() => {
                            const isPublicSelected = courseDetails?.visibility === 'public' || (courseDetails?.visibility !== 'private' && courseDetails?.status === 'published');
                            const isPrivateSelected = courseDetails?.visibility === 'private' || (courseDetails?.visibility !== 'public' && courseDetails?.status !== 'published');
                            const selectedStyle = 'bg-gradient-to-r from-[#FF8C42]/10 to-[#FF3FB4]/10 dark:from-[#FF8C42]/20 dark:to-[#FF3FB4]/20 border-2 border-primary-pink shadow-md';
                            const unselectedStyle = 'bg-gray-50/80 dark:bg-white/[0.02] border-2 border-gray-200 dark:border-white/10 opacity-80 hover:opacity-100';
                            return (
                                <>
                        <div
                            onClick={() => handleUpdateDetails && handleUpdateDetails({ visibility: 'public' })}
                            className={`cursor-pointer rounded-2xl p-5 flex items-center gap-4 transition-all duration-300 ${isPublicSelected ? selectedStyle : unselectedStyle}`}
                        >
                            <div className={`p-2 rounded-lg transition-colors duration-300 ${isPublicSelected ? 'bg-[#FF3FB4] shadow-[0_0_15px_rgba(255,63,180,0.5)]' : 'bg-gray-200 dark:bg-white/10'}`}>
                                <Globe size={20} className={isPublicSelected ? 'text-white' : 'text-gray-400 dark:text-white/40'} />
                            </div>
                            <div>
                                <h4 className={`font-bold text-sm transition-colors duration-300 ${isPublicSelected ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-white/50'}`}>Public</h4>
                                <p className={`text-xs mt-0.5 transition-colors duration-300 ${isPublicSelected ? 'text-gray-600 dark:text-white/70' : 'text-gray-400 dark:text-white/40'}`}>Anyone can find and enroll</p>
                            </div>
                        </div>
                        <div
                            onClick={() => handleUpdateDetails && handleUpdateDetails({ visibility: 'private' })}
                            className={`cursor-pointer rounded-2xl p-5 flex items-center gap-4 transition-all duration-300 ${isPrivateSelected ? selectedStyle : unselectedStyle}`}
                        >
                            <div className={`p-2 rounded-lg transition-colors duration-300 ${isPrivateSelected ? 'bg-[#FF3FB4] shadow-[0_0_15px_rgba(255,63,180,0.5)]' : 'bg-gray-200 dark:bg-white/10'}`}>
                                <Lock size={20} className={isPrivateSelected ? 'text-white' : 'text-gray-400 dark:text-white/40'} />
                            </div>
                            <div>
                                <h4 className={`font-bold text-sm transition-colors duration-300 ${isPrivateSelected ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-white/50'}`}>Private</h4>
                                <p className={`text-xs mt-0.5 transition-colors duration-300 ${isPrivateSelected ? 'text-gray-600 dark:text-white/70' : 'text-gray-400 dark:text-white/40'}`}>Only accessible by link</p>
                            </div>
                        </div>
                                </>
                            );
                        })()}
                    </div>
                </div>
                </div>

                {/* Settings */}
                <div className="pt-6 border-t border-gray-100 dark:border-white/5 space-y-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white transition-colors duration-300">Settings</h3>
                
                {/* Validity Toggle */}
                <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-white/10 transition-colors duration-300">
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white transition-colors duration-300">Validity</h3>
                        <p className="text-xs text-gray-500 dark:text-white/40 mt-0.5 transition-colors duration-300">Select how long your customers can view your course</p>
                    </div>
                    <div 
                        onClick={() => setCourseDetails({ ...courseDetails, validity: !courseDetails.validity })}
                        className={`relative w-12 h-6 rounded-full transition-all duration-300 cursor-pointer ${courseDetails.validity ? 'bg-primary-pink' : 'bg-gray-300 dark:bg-white/20'}`}
                    >
                        <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${courseDetails.validity ? 'translate-x-6' : ''}`} />
                    </div>
                </div>

                {/* Show as Locked Toggle */}
                <div className="flex items-center justify-between py-3">
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white transition-colors duration-300">Show as locked</h3>
                        <p className="text-xs text-gray-500 dark:text-white/40 mt-0.5 transition-colors duration-300">Show this course as locked to customers of other courses</p>
                    </div>
                    <div 
                        onClick={() => setCourseDetails({ ...courseDetails, showAsLocked: !courseDetails.showAsLocked })}
                        className={`relative w-12 h-6 rounded-full transition-all duration-300 cursor-pointer ${courseDetails.showAsLocked ? 'bg-primary-pink' : 'bg-gray-300 dark:bg-white/20'}`}
                    >
                        <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${courseDetails.showAsLocked ? 'translate-x-6' : ''}`} />
                    </div>
                </div>
                </div>

                {/* Engagement */}
                <div className="pt-6 border-t border-gray-100 dark:border-white/5 space-y-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white transition-colors duration-300">Engagement</h3>
                
                {/* Disable QnA Toggle */}
                <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-white/10 transition-colors duration-300">
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white transition-colors duration-300">Disable QnA</h3>
                        <p className="text-xs text-gray-500 dark:text-white/40 mt-0.5 transition-colors duration-300">Your customers won't be able to ask questions on your course</p>
                    </div>
                    <div 
                        onClick={() => setCourseDetails({ ...courseDetails, disableQnA: !courseDetails.disableQnA })}
                        className={`relative w-12 h-6 rounded-full transition-all duration-300 cursor-pointer ${courseDetails.disableQnA ? 'bg-primary-pink' : 'bg-gray-300 dark:bg-white/20'}`}
                    >
                        <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${courseDetails.disableQnA ? 'translate-x-6' : ''}`} />
                    </div>
                </div>

                {/* Disable Comments Toggle */}
                <div className="flex items-center justify-between py-3">
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white transition-colors duration-300">Disable comments</h3>
                        <p className="text-xs text-gray-500 dark:text-white/40 mt-0.5 transition-colors duration-300">Your customers won't be able to comment on your course</p>
                    </div>
                    <div 
                        onClick={() => setCourseDetails({ ...courseDetails, disableComments: !courseDetails.disableComments })}
                        className={`relative w-12 h-6 rounded-full transition-all duration-300 cursor-pointer ${courseDetails.disableComments ? 'bg-primary-pink' : 'bg-gray-300 dark:bg-white/20'}`}
                    >
                        <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${courseDetails.disableComments ? 'translate-x-6' : ''}`} />
                    </div>
                </div>
                </div>

                </div>
            </ContentCard>
        </div>
    );
};

export default InformationTab;
