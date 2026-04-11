import React, { useState, useEffect } from 'react';
import { X, Link as LinkIcon, Loader2, Save } from 'lucide-react';

const LinkModal = ({ isOpen, onClose, onSave, isSaving, existingContent }) => {
    const [title, setTitle] = useState('');
    const [url, setUrl] = useState('');

    useEffect(() => {
        if (isOpen && existingContent) {
            setTitle(existingContent.title || '');
            setUrl(existingContent.fileUrl || '');
        } else if (isOpen) {
            setTitle('');
            setUrl('');
        }
    }, [isOpen, existingContent]);

    if (!isOpen) return null;

    const handleSave = () => {
        if (!title.trim() || !url.trim()) return;
        onSave({ title, url });
    };

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-md bg-[#1E1E1E] border border-white/10 rounded-[28px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-5 border-b border-white/5 bg-white/[0.01]">
                    <h2 className="text-[17px] font-bold text-white tracking-tight mx-auto">
                        {existingContent ? 'Edit Link' : 'Add Link'}
                    </h2>
                    <button onClick={onClose} className="p-1.5 hover:bg-white/5 rounded-full transition-colors text-white/40 hover:text-white">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 ml-1">Link Title</label>
                        <input 
                            type="text" 
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Helpful Resources"
                            className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-[13px] font-bold text-white focus:outline-none focus:border-primary-pink/30 transition-all placeholder:text-white/10"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 ml-1">URL</label>
                        <input 
                            type="text" 
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://example.com"
                            className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-[13px] font-bold text-white focus:outline-none focus:border-primary-pink/30 transition-all placeholder:text-white/10"
                        />
                    </div>

                    <button 
                        disabled={!title.trim() || !url.trim() || isSaving}
                        onClick={handleSave}
                        className={`w-full py-3.5 rounded-xl font-black text-[12px] uppercase tracking-widest shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2.5
                            ${(!title.trim() || !url.trim() || isSaving) 
                                ? 'bg-white/5 text-white/20 cursor-not-allowed' 
                                : 'bg-gradient-to-r from-[#FF8C42] to-[#FF3FB4] text-white shadow-[#FF3FB4]/10 hover:shadow-[#FF3FB4]/20 hover:brightness-105'}`}
                    >
                        {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        {isSaving ? 'Saving...' : existingContent ? 'Update Link' : 'Add Link'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LinkModal;
