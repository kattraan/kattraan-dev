import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { submitEnrollment } from '@/features/auth/store/authSlice';
import { logger } from '@/utils/logger';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { 
    User, Briefcase, ShieldCheck, Camera, 
    Globe, Linkedin, Github, ExternalLink, 
    Upload, Plus, X, Info, Clock, CheckCircle2,
    ArrowRight, ArrowLeft, Loader2, TrendingUp
} from 'lucide-react';
import { ROUTES } from '@/config/routes';

const EnrollmentFormFeature = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading } = useSelector((state) => state.auth);
    
    const [step, setStep] = useState(1);
    const [languageInput, setLanguageInput] = useState('');
    const [formData, setFormData] = useState({
        profilePhoto: null,
        profilePhotoPreview: null,
        bio: '',
        languages: [],
        expertise: '',
        experienceYears: '',
        experienceMonths: '',
        linkedin: '',
        github: '',
        website: '',
        resume: null,
        idProof: null
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e, field) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                [field]: file,
                [`${field}Preview`]: field === 'profilePhoto' ? URL.createObjectURL(file) : null
            }));
        }
    };

    const addLanguage = () => {
        if (languageInput.trim() && !formData.languages.includes(languageInput.trim())) {
            setFormData(prev => ({
                ...prev,
                languages: [...prev.languages, languageInput.trim()]
            }));
            setLanguageInput('');
        }
    };

    const removeLanguage = (lang) => {
        setFormData(prev => ({
            ...prev,
            languages: prev.languages.filter(l => l !== lang)
        }));
    };

    const nextStep = () => setStep(prev => Math.min(prev + 1, 3));
    const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = {
            ...formData,
            experience: `${formData.experienceYears}y ${formData.experienceMonths}m`,
        };
        
        dispatch(submitEnrollment(payload))
            .unwrap()
            .then(() => {
                navigate(ROUTES.WAITING_APPROVAL);
            })
            .catch((err) => {
                logger.error("Enrollment failed", err);
            });
    };

    const InternalTrendingUp = ({ size, className }) => (
        <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
    );

    const Stepper = () => (
        <div className="flex items-center justify-between w-full max-w-2xl mx-auto mb-16 relative">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/10 -translate-y-1/2 z-0" />
            <div 
                className="absolute top-1/2 left-0 h-0.5 bg-primary-pink transition-all duration-500 -translate-y-1/2 z-0" 
                style={{ width: `${((step - 1) / 2) * 100}%` }}
            />
            
            {[
                { n: 1, label: 'Basic Info', icon: User },
                { n: 2, label: 'Professional Info', icon: Briefcase },
                { n: 3, label: 'Verification', icon: ShieldCheck }
            ].map((s) => (
                <div key={s.n} className="relative z-10 flex flex-col items-center gap-3">
                    <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                        ${step >= s.n ? 'bg-primary-pink text-white shadow-[0_0_20px_rgba(255,51,102,0.4)] border-transparent' : 'bg-white/5 border border-white/10 text-white/70 backdrop-blur-md'}
                    `}>
                        {step > s.n ? <CheckCircle2 size={20} /> : <s.icon size={20} />}
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${step >= s.n ? 'text-white' : 'text-white/40'}`}>
                        {s.label}
                    </span>
                </div>
            ))}
        </div>
    );

    return (
        <div className="max-w-3xl mx-auto">
            <Stepper />
            <div 
                className="relative backdrop-blur-2xl rounded-[40px] p-8 md:p-12 shadow-[0_32px_120px_rgba(0,0,0,0.8)] border border-white/10 overflow-hidden"
                style={{ background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)' }}
            >
                {/* Internal Glow */}
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary-pink/5 blur-[100px] -z-10 rounded-full pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#FF8C42]/5 blur-[100px] -z-10 rounded-full pointer-events-none" />
                {step === 1 && (
                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-6">Basic Information</h2>
                            <div className="flex flex-col md:flex-row items-center gap-8 mb-10 p-6 rounded-[32px] bg-white/[0.04] border border-white/10 backdrop-blur-md shadow-inner">
                                <div className="relative group">
                                    <div className="w-24 h-24 rounded-full bg-white/5 border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:border-primary-pink/50">
                                        {formData.profilePhotoPreview ? (
                                            <img src={formData.profilePhotoPreview} alt="Preview" className="w-full h-full object-cover" loading="lazy" />
                                        ) : (
                                            <Camera className="text-white/40" size={32} />
                                        ) }
                                    </div>
                                    <label className="absolute bottom-0 right-0 p-2 bg-primary-pink text-white rounded-full cursor-pointer shadow-lg hover:scale-110 transition-transform">
                                        <Plus size={16} />
                                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'profilePhoto')} />
                                    </label>
                                </div>
                                <div className="text-center md:text-left flex-grow">
                                    <Button variant="secondary" className="mb-2" onClick={() => document.querySelector('input[type="file"]').click()}>
                                        Upload Photo
                                    </Button>
                                    <p className="text-white/40 text-xs">JPG, PNG or GIF. Max 5MB</p>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-white text-sm font-bold flex items-center gap-2 mb-2">
                                        <User size={16} className="text-primary-pink" /> Bio
                                    </label>
                                    <textarea 
                                        name="bio"
                                        value={formData.bio}
                                        onChange={handleChange}
                                        rows={5}
                                        placeholder="Tell us about yourself..."
                                        className="w-full bg-white/[0.05] border border-white/10 rounded-[28px] py-4 px-6 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-primary-pink/30 transition-all resize-none"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-white text-sm font-bold flex items-center gap-2">
                                        <Globe size={16} className="text-primary-pink" /> Languages
                                    </label>
                                    <div className="flex gap-3">
                                        <Input 
                                            placeholder="Enter a language" 
                                            value={languageInput}
                                            onChange={(e) => setLanguageInput(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && addLanguage()}
                                            className="mb-0"
                                        />
                                        <Button onClick={addLanguage} className="rounded-full px-6">Add</Button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {formData.languages.map(lang => (
                                            <span key={lang} className="bg-primary-pink/10 border border-primary-pink/20 text-primary-pink px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2">
                                                {lang} <button onClick={() => removeLanguage(lang)}><X size={12} /></button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="pt-8 border-t border-white/5 flex justify-end">
                            <Button onClick={nextStep} className="group gap-2 px-8">
                                Next Step <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </div>
                    </div>
                )}
                {step === 2 && (
                    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="space-y-8">
                            <h2 className="text-2xl font-bold text-white mb-6">Professional Info</h2>
                            <Input label="Primary Skill" name="expertise" value={formData.expertise} onChange={handleChange} icon={Briefcase} />
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="Years" name="experienceYears" type="number" value={formData.experienceYears} onChange={handleChange} />
                                <Input label="Months" name="experienceMonths" type="number" value={formData.experienceMonths} onChange={handleChange} />
                            </div>
                            <div className="space-y-4">
                                <Input label="LinkedIn" name="linkedin" value={formData.linkedin} onChange={handleChange} />
                                <Input label="GitHub" name="github" value={formData.github} onChange={handleChange} />
                            </div>
                            <div className="space-y-4">
                                <p className="text-white text-sm font-bold">Resume</p>
                                <div className="border-2 border-dashed border-white/10 rounded-[32px] p-10 flex flex-col items-center justify-center cursor-pointer relative">
                                    <Upload className="text-white/40 mb-3" size={32} />
                                    <p className="text-white text-sm">{formData.resume ? formData.resume.name : 'Click to upload resume'}</p>
                                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileChange(e, 'resume')} />
                                </div>
                            </div>
                        </div>
                        <div className="pt-8 border-t border-white/5 flex justify-between">
                            <button onClick={prevStep} className="text-white/60 hover:text-white flex items-center gap-2 font-bold uppercase tracking-widest text-[10px]">
                                <ArrowLeft size={16} /> Back
                            </button>
                            <Button onClick={nextStep} className="group gap-2 px-8">
                                Next Step <ArrowRight size={18} />
                            </Button>
                        </div>
                    </div>
                )}
                {step === 3 && (
                    <form onSubmit={handleSubmit} className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                        <h2 className="text-2xl font-bold text-white mb-6">Verification</h2>
                        <div className="bg-white/[0.02] border border-white/5 rounded-[32px] p-6">
                            <div className="border-2 border-dashed border-white/10 rounded-[24px] p-10 flex flex-col items-center justify-center cursor-pointer relative">
                                <ShieldCheck size={32} className="text-white/40 mb-3" />
                                <p className="text-white text-sm">{formData.idProof ? formData.idProof.name : 'Upload ID Proof'}</p>
                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileChange(e, 'idProof')} />
                            </div>
                        </div>
                        <div className="bg-white/[0.03] border border-white/5 p-6 rounded-[32px]">
                            <div className="flex items-center gap-6 mb-4">
                                <div className="w-14 h-14 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 relative">
                                    <Clock size={24} />
                                    <div className="absolute inset-0 rounded-full border-2 border-orange-500/20 border-t-orange-500 animate-spin" />
                                </div>
                                <div>
                                    <p className="text-primary-pink font-bold text-lg leading-none">Pending Approval</p>
                                    <p className="text-white/50 text-xs">Profile will be reviewed by admin</p>
                                </div>
                            </div>
                        </div>
                        <div className="pt-8 border-t border-white/5 flex justify-between items-center">
                            <button onClick={prevStep} className="text-white/60 hover:text-white flex items-center gap-2 font-bold uppercase tracking-widest text-[10px]">
                                <ArrowLeft size={16} /> Back
                            </button>
                            <Button type="submit" isLoading={loading} className="px-10">
                                {loading ? <Loader2 className="animate-spin" size={20} /> : "Submit for Review"}
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default EnrollmentFormFeature;
