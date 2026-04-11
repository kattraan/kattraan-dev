import React, { useState, useEffect, useRef } from 'react';
import { 
    X, Plus, Trash2, GripVertical, ArrowLeft, CircleDot, CheckSquare, 
    FileText, Info, Image as ImageIcon, Upload, Bold, Italic, 
    Underline, List, ListOrdered, Link2, Eraser, Smile, ChevronDown, 
    Loader2, MoreVertical, Check, Save, ExternalLink, Hash, Copy, Pencil,
    GripHorizontal
} from 'lucide-react';
import QuizLearnerPreview from './QuizLearnerPreview';
import { logger } from '@/utils/logger';
import { useToast } from '@/components/ui/Toast';

/**
 * Advanced Glassmorphic Quiz/Assignment Editor.
 * Includes the Tagmango-style Inline "Add New Question" Form.
 */

const CustomSwitch = ({ checked, onChange }) => (
    <button
        onClick={(e) => { e.stopPropagation(); onChange(!checked); }}
        className={`relative w-8 h-4 rounded-full transition-all duration-300 ${checked ? 'bg-primary-pink shadow-[0_0_12px_rgba(255,46,155,0.4)]' : 'bg-white/10'}`}
    >
        <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all duration-300 ${checked ? 'left-4.5' : 'left-0.5'}`} />
    </button>
);

const QuestionCard = ({ question, index, onRemove, onEdit, onClone, onDragStart, onDragOver, onDragEnd }) => {
    return (
        <div 
            draggable 
            onDragStart={(e) => onDragStart(e, index)}
            onDragOver={(e) => onDragOver(e, index)}
            onDragEnd={onDragEnd}
            className="bg-[#2A2A2A] border border-white/10 rounded-3xl p-8 mb-6 relative hover:border-primary-pink/30 transition-all duration-500 group shadow-[0_15px_35px_rgba(0,0,0,0.4)] cursor-default"
        >
            <div className="flex items-start justify-between gap-6 relative z-10">
                <div className="flex-1">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="bg-black border border-white/10 text-white px-3.5 py-1.5 rounded-full text-[9px] font-black tracking-widest uppercase flex-shrink-0 shadow-lg select-none">
                            QUESTION {index + 1}
                        </div>
                        <h3 className="flex-1 text-[16px] font-bold text-white/90 leading-snug">{question.question || 'Untitled Question'}</h3>
                    </div>

                    {question.type !== 'subjective' && (
                        <div className="grid grid-cols-2 gap-3">
                            {(question.options || []).map((option, optIdx) => (
                                <div 
                                    key={optIdx} 
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                                        ((question.type === 'single' && question.correctAnswer === optIdx) || 
                                         (question.type === 'multiple' && (question.correctAnswers || []).includes(optIdx)))
                                        ? 'border-primary-pink/40 bg-primary-pink/[0.08]' 
                                        : 'border-white/5 bg-white/[0.03]'
                                    }`}
                                >
                                    <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                                        ((question.type === 'single' && question.correctAnswer === optIdx) || 
                                         (question.type === 'multiple' && (question.correctAnswers || []).includes(optIdx)))
                                        ? 'border-primary-pink bg-primary-pink' 
                                        : 'border-white/20'
                                    }`}>
                                        {((question.type === 'single' && question.correctAnswer === optIdx) || 
                                         (question.type === 'multiple' && (question.correctAnswers || []).includes(optIdx))) && (
                                            <div className="w-1 h-1 rounded-full bg-white" />
                                        )}
                                    </div>
                                    <span className="text-[13px] text-white/60 font-medium truncate">{option.content || `Option ${optIdx + 1}`}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex flex-col items-end gap-8 -mt-2 -mr-2">
                    <div className="flex items-center gap-1.5">
                        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0">
                            <button onClick={() => onClone(index)} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 text-white/40 hover:text-white transition-all shadow-xl" title="Clone Question">
                                <Copy size={16} />
                            </button>
                            <button onClick={() => onEdit(index)} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 text-white/40 hover:text-white transition-all shadow-xl" title="Edit Question">
                                <Pencil size={16} />
                            </button>
                            <button onClick={() => onRemove(index)} className="p-2.5 bg-red-500/5 hover:bg-red-500/10 rounded-xl border border-red-500/10 text-red-500/40 hover:text-red-500 transition-all shadow-xl" title="Delete Question">
                                <Trash2 size={16} />
                            </button>
                            <div className="w-px h-6 bg-white/5 mx-1" />
                        </div>
                        <div className="p-2.5 text-white/20 cursor-grab active:cursor-grabbing hover:text-white/50 transition-all">
                            <GripVertical size={20} />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 bg-white/[0.03] px-3.5 py-2 rounded-xl border border-white/5 shadow-inner">
                        <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest leading-none">Marks:</span>
                        <span className="text-[15px] font-black text-primary-pink leading-none">{question.marks || 1}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AddQuestionForm = ({ onCancel, onSave, initialData = null, onStateChange }) => {
    const [qData, setQData] = useState(initialData ? {
        ...initialData,
        hasImage: initialData.hasImage || false
    } : {
        question: '',
        type: 'single',
        marks: 1,
        options: [
            { id: Date.now() + 1, content: '', type: 'Text' },
            { id: Date.now() + 2, content: '', type: 'Text' },
            { id: Date.now() + 3, content: '', type: 'Text' },
            { id: Date.now() + 4, content: '', type: 'Text' }
        ],
        correctAnswer: 0,
        correctAnswers: [],
        hasImage: false
    });

    useEffect(() => {
        if (onStateChange) onStateChange(qData);
    }, [qData, onStateChange]);

    const [focusedInput, setFocusedInput] = useState(null); // 'question' or 'opt-{idx}'
    const [openDropdownIdx, setOpenDropdownIdx] = useState(null);
    const [draggedOptionIdx, setDraggedOptionIdx] = useState(null);

    const handleOptionDragStart = (e, idx) => {
        setDraggedOptionIdx(idx);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleOptionDragOver = (e, idx) => {
        e.preventDefault();
        if (draggedOptionIdx === null || draggedOptionIdx === idx) return;

        const newOpts = [...qData.options];
        const itemToMove = newOpts.splice(draggedOptionIdx, 1)[0];
        newOpts.splice(idx, 0, itemToMove);
        
        // Also update correct answers mapping if reordered
        if (qData.type === 'single') {
            let newCorrect = qData.correctAnswer;
            if (qData.correctAnswer === draggedOptionIdx) newCorrect = idx;
            else if (draggedOptionIdx < qData.correctAnswer && idx >= qData.correctAnswer) newCorrect = qData.correctAnswer - 1;
            else if (draggedOptionIdx > qData.correctAnswer && idx <= qData.correctAnswer) newCorrect = qData.correctAnswer + 1;
            
            setQData(prev => ({ ...prev, options: newOpts, correctAnswer: newCorrect }));
        } else if (qData.type === 'multiple') {
            const currentCorrects = qData.correctAnswers || [];
            const newCorrects = currentCorrects.map(cIdx => {
                if (cIdx === draggedOptionIdx) return idx;
                if (draggedOptionIdx < cIdx && idx >= cIdx) return cIdx - 1;
                if (draggedOptionIdx > cIdx && idx <= cIdx) return cIdx + 1;
                return cIdx;
            });
            setQData(prev => ({ ...prev, options: newOpts, correctAnswers: newCorrects }));
        } else {
            setQData(prev => ({ ...prev, options: newOpts }));
        }
        
        setDraggedOptionIdx(idx);
    };

    const handleOptionDragEnd = () => {
        setDraggedOptionIdx(null);
    };

    const TypeDropdown = ({ currentType, onSelect, onClose }) => (
        <div className="absolute right-0 top-full mt-2 w-32 bg-[#1e1e1e] border border-white/10 rounded-xl py-2 shadow-2xl z-[200] animate-in fade-in zoom-in-95 duration-200">
            {[
                { id: 'Text', icon: <Bold size={14} /> },
                { id: 'Image', icon: <ImageIcon size={14} /> }
            ].map(type => (
                <button 
                    key={type.id}
                    onClick={() => { onSelect(type.id); onClose(); }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-[12px] font-bold transition-all hover:bg-white/5 ${currentType === type.id ? 'text-primary-pink' : 'text-white/60 hover:text-white'}`}
                >
                    {type.icon}
                    {type.id}
                </button>
            ))}
        </div>
    );

    const FormattingToolbar = ({ className = "" }) => (
        <div className={`flex items-center gap-1 p-1 bg-white/[0.05] border-b border-white/5 rounded-t-2xl px-3 animate-in fade-in slide-in-from-top-1 duration-200 ${className}`}>
            {[
                { icon: <Bold size={14} />, label: 'Bold' },
                { icon: <Underline size={14} />, label: 'Underline' },
                { icon: <Italic size={14} />, label: 'Italic' },
                { icon: <List size={14} />, label: 'List' },
                { icon: <ListOrdered size={14} />, label: 'Ordered List' },
                { icon: <Link2 size={14} />, label: 'Link' },
                { icon: <Eraser size={14} />, label: 'Clear' },
                { icon: <Smile size={14} />, label: 'Emoji' },
            ].map((tool, i) => (
                <button key={i} className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-all" title={tool.label}>
                    {tool.icon}
                </button>
            ))}
        </div>
    );

    const updateOption = (idx, val) => {
        const newOpts = [...qData.options];
        newOpts[idx].content = val;
        setQData({ ...qData, options: newOpts });
    };

    const updateOptionType = (idx, type) => {
        const newOpts = [...qData.options];
        newOpts[idx].type = type;
        setQData({ ...qData, options: newOpts });
    };

    const removeOption = (idx) => {
        if (qData.options.length <= 2) return;
        setQData({ ...qData, options: qData.options.filter((_, i) => i !== idx) });
    };

    return (
        <div className="bg-white/[0.05] backdrop-blur-3xl border border-white/20 rounded-3xl p-8 mb-8 animate-in slide-in-from-bottom-5 duration-300 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-pink/[0.02] rounded-full blur-[80px] pointer-events-none" />
            
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-[18px] font-black text-white tracking-tight">Add new question</h3>
                <button onClick={onCancel} className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/20 hover:text-white">
                    <X size={20} />
                </button>
            </div>

            {/* Question Type Selection */}
            <div className="flex items-center gap-3 mb-10 overflow-x-auto pb-2 scrollbar-none">
                {[
                    { id: 'single', label: 'Single answer', icon: <CircleDot size={14} /> },
                    { id: 'multiple', label: 'Multiple answers', icon: <CheckSquare size={14} /> },
                    { id: 'subjective', label: 'Subjective answer', icon: <FileText size={14} /> }
                ].map(type => (
                    <button
                        key={type.id}
                        onClick={() => setQData({ ...qData, type: type.id })}
                        className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl border transition-all text-[12px] font-bold uppercase tracking-widest whitespace-nowrap ${
                            qData.type === type.id 
                            ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.1)]' 
                            : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10'
                        }`}
                    >
                        {type.icon}
                        {type.label}
                        <Info size={12} className={qData.type === type.id ? 'opacity-40' : 'opacity-20'} />
                    </button>
                ))}
            </div>

            {/* Image Toggle */}
            <div className="flex items-center gap-4 mb-10">
                <span className="text-[11px] font-black text-white/30 uppercase tracking-[0.2em]">Add image</span>
                <CustomSwitch checked={qData.hasImage} onChange={(v) => setQData({ ...qData, hasImage: v })} />
            </div>

            {/* Question Input */}
            <div className="space-y-4 mb-10">
                <label className="text-[11px] font-black text-white/30 uppercase tracking-[0.2em]">Question</label>
                <div className={`transition-all duration-300 rounded-2xl border ${focusedInput === 'question' ? 'border-primary-pink/40 bg-white/[0.08]' : 'border-white/5 bg-white/[0.03]'}`}>
                    {focusedInput === 'question' && <FormattingToolbar />}
                    <input
                        type="text"
                        value={qData.question}
                        onFocus={() => setFocusedInput('question')}
                        onChange={(e) => setQData({ ...qData, question: e.target.value })}
                        placeholder="Add question title here..."
                        className="w-full h-14 bg-transparent px-6 text-[15px] font-bold text-white focus:outline-none transition-all placeholder:text-white/30"
                    />
                </div>
            </div>

            {/* Options Section */}
            {qData.type !== 'subjective' && (
                <div className="space-y-4 mb-10">
                    <div className="flex items-center justify-between mb-4">
                        <label className="text-[11px] font-black text-white/30 uppercase tracking-[0.2em]">Options</label>
                        <div className="bg-primary-pink/5 px-3 py-1 rounded-lg border border-primary-pink/10">
                            <span className="text-[9px] text-primary-pink/60 font-medium italic">
                                Note: Please select the correct answer by clicking on the circle on the left.
                            </span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {qData.options.map((opt, idx) => (
                            <div 
                                key={opt.id} 
                                draggable
                                onDragStart={(e) => handleOptionDragStart(e, idx)}
                                onDragOver={(e) => handleOptionDragOver(e, idx)}
                                onDragEnd={handleOptionDragEnd}
                                className="flex items-center gap-3 animate-in fade-in duration-300 group cursor-default"
                            >
                                <div className="p-2 text-white/30 cursor-grab active:cursor-grabbing hover:text-white/60 transition-all">
                                    <GripVertical size={20} strokeWidth={2.5} />
                                </div>
                                <button
                                    onClick={() => {
                                        if (qData.type === 'single') setQData({ ...qData, correctAnswer: idx });
                                        else {
                                            const current = qData.correctAnswers || [];
                                            setQData({ ...qData, correctAnswers: current.includes(idx) ? current.filter(i => i !== idx) : [...current, idx] });
                                        }
                                    }}
                                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                        (qData.type === 'single' ? qData.correctAnswer === idx : qData.correctAnswers.includes(idx))
                                        ? 'border-primary-pink bg-primary-pink shadow-[0_0_10px_rgba(255,46,155,0.4)]' 
                                        : 'border-white/10'
                                    }`}
                                >
                                    {(qData.type === 'single' ? qData.correctAnswer === idx : qData.correctAnswers.includes(idx)) && (
                                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                    )}
                                </button>
                                <div className="flex-1">
                                    <div className={`transition-all duration-300 rounded-xl border relative ${openDropdownIdx === idx ? 'z-[50]' : 'z-10'} ${focusedInput === `opt-${idx}` ? 'border-primary-pink/30 bg-white/[0.08]' : 'border-white/5 bg-white/[0.03]'}`}>
                                        {focusedInput === `opt-${idx}` && opt.type === 'Text' && <FormattingToolbar />}
                                        <div className="relative">
                                            {opt.type === 'Text' ? (
                                                <input
                                                    type="text"
                                                    value={opt.content}
                                                    onFocus={() => setFocusedInput(`opt-${idx}`)}
                                                    onChange={(e) => updateOption(idx, e.target.value)}
                                                    placeholder={`Add option ${idx + 1}...`}
                                                    className="w-full h-12 bg-transparent px-5 text-[14px] font-medium text-white/80 focus:outline-none transition-all placeholder:text-white/30 pr-24"
                                                />
                                            ) : (
                                                <div className="p-6">
                                                    <div className="w-full h-40 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-4 bg-white/[0.01] group/img hover:border-primary-pink/20 transition-all">
                                                        <div className="text-center space-y-2">
                                                            <p className="text-[12px] font-medium text-white/40">Works with any .JPG, .PNG, or .GIF file</p>
                                                            <p className="text-[10px] font-medium text-white/20">Recommended dimension 1728 x 1080 px | Max size 50 MB</p>
                                                        </div>
                                                        <button className="flex items-center gap-2 px-6 py-2.5 bg-white/[0.05] border border-white/10 rounded-xl text-[11px] font-black text-white hover:bg-white/[0.08] transition-all uppercase tracking-widest leading-none">
                                                            <Upload size={14} /> Upload Image
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="absolute right-2 top-2 flex items-center z-[110]">
                                                <div className="relative">
                                                    <button 
                                                        type="button"
                                                        onClick={(e) => { 
                                                            e.preventDefault();
                                                            e.stopPropagation(); 
                                                            setOpenDropdownIdx(openDropdownIdx === idx ? null : idx); 
                                                        }}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1a1a1a] hover:bg-white/[0.1] rounded-lg border border-white/10 transition-all cursor-pointer relative z-[111]"
                                                    >
                                                        <span className="text-[10px] font-bold text-white/40 uppercase select-none pointer-events-none">{opt.type || 'Text'}</span>
                                                        <ChevronDown size={12} className={`text-white/20 transition-transform duration-300 pointer-events-none ${openDropdownIdx === idx ? 'rotate-180' : ''}`} />
                                                    </button>
                                                    {openDropdownIdx === idx && (
                                                        <TypeDropdown 
                                                            currentType={opt.type || 'Text'} 
                                                            onSelect={(type) => updateOptionType(idx, type)} 
                                                            onClose={() => setOpenDropdownIdx(null)} 
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => removeOption(idx)}
                                    className="p-3 bg-red-500/5 text-red-500/20 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <button 
                        onClick={() => setQData({ ...qData, options: [...qData.options, { id: Date.now(), content: '', type: 'Text' }] })}
                        className="flex items-center gap-2.5 px-6 py-3 bg-white/[0.02] border border-white/5 rounded-xl text-[11px] font-black text-white/30 hover:text-white hover:border-white/20 transition-all uppercase tracking-widest mt-6"
                    >
                        <Plus size={14} /> Add option <ChevronDown size={12} />
                    </button>
                </div>
            )}

            {/* Bottom Bar */}
            <div className="flex items-center justify-between pt-10 border-t border-white/5">
                <div className="flex items-center gap-4 bg-white/[0.02] px-5 py-3 rounded-2xl border border-white/5">
                    <span className="text-[11px] font-black text-white/30 uppercase tracking-[0.2em]">Assign marks:</span>
                    <input
                        type="number"
                        value={qData.marks}
                        onChange={(e) => setQData({ ...qData, marks: parseInt(e.target.value) || 0 })}
                        placeholder="Set question marks"
                        className="w-20 text-center text-[15px] font-black text-primary-pink focus:outline-none bg-transparent placeholder:text-white/5"
                    />
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={onCancel} className="px-8 py-3 rounded-xl border border-white/5 text-white/40 font-bold text-[12px] hover:text-white transition-all uppercase tracking-widest leading-none">
                        Cancel
                    </button>
                    <button 
                        onClick={() => onSave(qData)}
                        className="px-12 py-3 rounded-xl bg-white text-black font-black text-[12px] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all active:scale-95 flex items-center gap-2 uppercase tracking-widest leading-none"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

const QuizModal = ({ isOpen, onClose, onSave, chapterId, initialData = null, sectionName = '', chapterName = '' }) => {
    const toast = useToast();
    const [isImporting, setIsImporting] = useState(false);
    const [quizData, setQuizData] = useState({
        title: '',
        description: '',
        passingPercentage: 75,
        enforcePassingGrade: false,
        enableCountdown: false,
        allowRetake: false,
        questions: []
    });
    const [isSaving, setIsSaving] = useState(false);
    const [isAddingQuestion, setIsAddingQuestion] = useState(false);
    const [editingQuestionId, setEditingQuestionId] = useState(null);
    const [showPreview, setShowPreview] = useState(false);
    const [isDescriptionFocused, setIsDescriptionFocused] = useState(false);
    const [tempDescription, setTempDescription] = useState('');
    const initializedRef = useRef(false);
    const descRef = useRef(null);

    useEffect(() => {
        if (isOpen && !initializedRef.current) {
            if (initialData) {
                // Ensure questions and their options are in the correct format for the editor
                const formattedQuestions = (initialData.questions || []).map(q => ({
                    ...q,
                    marks: q.marks || 1, // Ensure marks is always present
                    id: q._id || q.id || `q-${Date.now()}-${Math.random()}`,
                    options: (q.options || []).map((opt, oIdx) => {
                        // Backend might send strings or missing pieces
                        if (typeof opt === 'string') {
                            return { id: `opt-${Date.now()}-${oIdx}`, content: opt, type: 'Text' };
                        }
                        const contentStr = typeof opt.content === 'string' ? opt.content : (typeof opt === 'string' ? opt : '');
                        return { 
                            id: opt.id || `opt-${Date.now()}-${oIdx}`, 
                            content: contentStr, 
                            type: opt.type || 'Text' 
                        };
                    })
                }));

                setQuizData({
                    title: initialData.title || chapterName || '',
                    description: initialData.description || '',
                    passingPercentage: initialData.metadata?.passingPercentage || 75,
                    enforcePassingGrade: initialData.metadata?.enforcePassingGrade || false,
                    enableCountdown: initialData.metadata?.enableCountdown || false,
                    allowRetake: initialData.metadata?.allowRetake || false,
                    questions: formattedQuestions
                });
            } else {
                setQuizData({ 
                    title: chapterName || '', 
                    description: '', 
                    passingPercentage: 75, 
                    enforcePassingGrade: false, 
                    enableCountdown: false, 
                    allowRetake: false, 
                    questions: [] 
                });
            }
            initializedRef.current = true;
        }
        
        if (!isOpen) {
            initializedRef.current = false;
        }
    }, [isOpen, initialData, chapterName]);
    
    const [draggedItemIndex, setDraggedItemIndex] = useState(null);

    const handleDragStart = (e, index) => {
        setDraggedItemIndex(index);
        e.dataTransfer.effectAllowed = 'move';
        // Set a drag image or styling if needed
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        if (draggedItemIndex === null || draggedItemIndex === index) return;

        const newQuestions = [...quizData.questions];
        const itemToMove = newQuestions.splice(draggedItemIndex, 1)[0];
        newQuestions.splice(index, 0, itemToMove);
        
        setQuizData(prev => ({ ...prev, questions: newQuestions }));
        setDraggedItemIndex(index);
    };

    const handleDragEnd = () => {
        setDraggedItemIndex(null);
    };

    const handleCloneQuestion = (index) => {
        const questionToClone = quizData.questions[index];
        const clonedQuestion = {
            ...questionToClone,
            id: `q-${Date.now()}-${Math.random()}`,
            _id: undefined // Remove MongoDB ID if present
        };
        const newQuestions = [...quizData.questions];
        newQuestions.splice(index + 1, 0, clonedQuestion);
        setQuizData(prev => ({ ...prev, questions: newQuestions }));
    };

    const handleEditQuestion = (id) => {
        setEditingQuestionId(id);
        setIsAddingQuestion(false);
    };

    // Use a ref to capture the latest question data from the open form
    const pendingQuestionRef = useRef(null);

    const persistQuiz = async (updatedQuizData, shouldClose = false) => {
        if (isSaving) return;
        
        // Final Validation for persistence
        if (!updatedQuizData.title.trim()) { toast.error('Validation', 'Please enter an assignment title.'); return; }
        if (updatedQuizData.questions.length === 0) { toast.error('Validation', 'Please add at least one question.'); return; }
        setIsSaving(true);
        try {
            // Ensure numeric marks before sending
            const cleanQuizData = {
                ...updatedQuizData,
                questions: updatedQuizData.questions.map(q => ({
                    ...q,
                    marks: Number(q.marks) || 1
                }))
            };
            
            await onSave(chapterId, cleanQuizData); 
            
            // If the parent handleSaveQuiz returns new data (like _id), it's handled in CourseEditor's state
            // and passed back via initialData/currentEditingQuiz next time.
            
            pendingQuestionRef.current = null; // Clear pending ref after successful save
            
            if (shouldClose) onClose(); 
        } catch (err) { 
            logger.error("❌ Persistence Failed:", err);
            toast.error('Save Failed', 'Failed to save to database. Please check your connection.');
        } finally { 
            setIsSaving(false); 
        }
    };

    const handleSaveNewQuestion = async (newQ) => {
        // Validation: Don't allow saving empty questions
        if (!newQ.question.trim()) { toast.error('Validation', 'Please enter a question title.'); return; }
        
        let newQuestions;
        if (editingQuestionId) {
            newQuestions = quizData.questions.map(q => 
                q.id === editingQuestionId ? { ...newQ, id: editingQuestionId } : q
            );
            setEditingQuestionId(null);
        } else if (isAddingQuestion) {
            const questionToSave = {
                ...newQ,
                id: `q-${Date.now()}-${Math.random()}`
            };
            newQuestions = [...quizData.questions, questionToSave];
            setIsAddingQuestion(false);
        }

        const updatedData = { ...quizData, questions: newQuestions };
        setQuizData(updatedData);
        
        // User requested: "click save the quiz need to be store"
        // So we trigger the DB persistence immediately
        await persistQuiz(updatedData, false);
    };

    const startAdding = () => {
        setEditingQuestionId(null); // Clear any edit state
        setIsAddingQuestion(true);
    };

    const startEditing = (id) => {
        setIsAddingQuestion(false); // Clear any add state
        setEditingQuestionId(id);
    };

    const removeQuestion = async (id) => {
        const updatedData = { 
            ...quizData, 
            questions: quizData.questions.filter(q => q.id !== id) 
        };
        setQuizData(updatedData);
        // Also sync deletion to DB
        await persistQuiz(updatedData, false);
    };

    const handleMainSave = async () => {
        let finalQuestions = [...quizData.questions];
        
        // If there's a question form currently open, auto-save its contents into our final payload
        if (pendingQuestionRef.current && pendingQuestionRef.current.question.trim()) {
            if (editingQuestionId) {
                finalQuestions = finalQuestions.map(q => 
                    q.id === editingQuestionId ? { ...pendingQuestionRef.current, id: editingQuestionId } : q
                );
            } else if (isAddingQuestion) {
                const alreadyPresent = finalQuestions.some(q => 
                    q.question === pendingQuestionRef.current.question && 
                    JSON.stringify(q.options) === JSON.stringify(pendingQuestionRef.current.options)
                );
                
                if (!alreadyPresent) {
                    finalQuestions.push({
                        ...pendingQuestionRef.current,
                        id: `q-auto-${Date.now()}`
                    });
                }
            }
        }

        const finalQuizData = { ...quizData, questions: finalQuestions };
        await persistQuiz(finalQuizData, true);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] bg-[#050505] text-white flex flex-col font-satoshi animate-in fade-in duration-300 overflow-hidden">
            <header className="h-[72px] border-b border-white/5 flex items-center justify-between px-8 bg-black/40 backdrop-blur-3xl fixed top-0 left-0 right-0 z-50">
                <div className="flex items-center gap-7">
                    <button onClick={onClose} className="flex items-center gap-2.5 text-white/40 hover:text-white transition-all font-bold text-[11px] uppercase tracking-[0.2em] group">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Course
                    </button>
                    <div className="h-4 w-[1px] bg-white/5" />
                    <div className="flex flex-col">
                        <span className="text-[9px] text-white/20 font-black uppercase tracking-[0.4em] mb-0.5">{sectionName || 'Curriculum'}</span>
                        <h2 className="text-[15px] font-bold text-white tracking-tight leading-none truncate max-w-[240px]">{quizData.title || 'Draft Assessment'}</h2>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setShowPreview(true)}
                        className="px-5 py-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-white/60 font-bold text-[11px] hover:bg-white/5 transition-all uppercase tracking-widest flex items-center gap-2"
                    >
                        <ExternalLink size={14} /> Preview as learner
                    </button>
                    <button onClick={handleMainSave} disabled={isSaving} className="px-6 py-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-white/50 font-bold text-[11px] hover:bg-white/5 transition-all uppercase tracking-widest leading-none">
                        Save as draft
                    </button>
                    <button onClick={handleMainSave} disabled={isSaving} className="px-10 py-2.5 rounded-xl bg-primary-pink text-white font-black text-[12px] hover:shadow-[0_0_25px_rgba(255,46,155,0.3)] transition-all active:scale-95 flex items-center gap-2.5 uppercase tracking-widest shadow-xl">
                        {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Publish
                    </button>
                </div>
            </header>

            <div className="flex flex-1 mt-[72px] h-[calc(100vh-72px)] overflow-hidden">
                <aside className="w-[320px] border-r border-white/5 bg-[#2a2a2a] overflow-y-auto px-8 py-10 flex-shrink-0 custom-scrollbar relative z-10 shadow-2xl">
                    <div className="space-y-10">
                        <div className="space-y-4">
                            <label className="text-[14px] font-bold text-white flex items-center gap-1.5">
                                <span className="text-red-500">*</span> Assignment title
                            </label>
                            <div className="relative group">
                                <input 
                                    value={quizData.title} 
                                    onChange={(e) => setQuizData(p => ({ ...p, title: e.target.value.slice(0, 100) }))} 
                                    className="w-full h-12 bg-[#1a1a1a] border border-white/10 rounded-xl px-4 text-[13px] font-bold text-white focus:border-primary-pink/40 focus:bg-[#222222] focus:outline-none transition-all placeholder:text-white/10 pr-20" 
                                    placeholder="Assignment name..." 
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-white/20 font-bold group-focus-within:text-primary-pink transition-colors">
                                    {quizData.title.length} / 100
                                </span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[14px] font-bold text-white flex items-center gap-1.5">
                                <span className="text-red-500">*</span> Description
                            </label>
                            <div className={`transition-all duration-300 rounded-2xl border ${isDescriptionFocused ? 'border-primary-pink/30 bg-[#222222]' : 'border-white/10 bg-[#1a1a1a]'} overflow-hidden`}>
                                {isDescriptionFocused && (
                                    <div className="flex flex-wrap gap-1 p-2 bg-white/[0.03] border-b border-white/5">
                                        {[
                                            { icon: <Bold size={14} />, type: 'bold' },
                                            { icon: <Underline size={14} />, type: 'underline' },
                                            { icon: <Italic size={14} />, type: 'italic' },
                                            { icon: <List size={14} />, type: 'list' },
                                            { icon: <ListOrdered size={14} />, type: 'ordered' },
                                            { icon: <Link2 size={14} />, type: 'link' },
                                            { icon: <Eraser size={14} />, disabled: true },
                                            { icon: <Smile size={14} />, disabled: true },
                                        ].map((tool, i) => (
                                            <button 
                                                key={i} 
                                                onClick={() => !tool.disabled && handleFormat(tool.type)}
                                                className={`w-8 h-8 flex items-center justify-center rounded-lg border border-white/5 bg-white/[0.02] text-white/40 hover:text-white hover:bg-white/10 transition-all ${tool.disabled ? 'opacity-20 cursor-not-allowed' : ''}`}
                                            >
                                                {tool.icon}
                                            </button>
                                        ))}
                                    </div>
                                )}
                                <textarea 
                                    ref={descRef}
                                    value={isDescriptionFocused ? tempDescription : quizData.description} 
                                    onFocus={() => {
                                        setTempDescription(quizData.description);
                                        setIsDescriptionFocused(true);
                                    }}
                                    onChange={(e) => setTempDescription(e.target.value)} 
                                    rows={isDescriptionFocused ? 6 : 4} 
                                    className="w-full bg-transparent p-4 text-[13px] font-medium text-white/60 focus:outline-none transition-all resize-none placeholder:text-white/5 leading-relaxed" 
                                    placeholder="Describe what this assignment is about..." 
                                />
                                {isDescriptionFocused && (
                                    <div className="flex items-center justify-end gap-2 p-3 bg-white/[0.02]">
                                        <button 
                                            onClick={() => {
                                                setTempDescription(quizData.description);
                                                setIsDescriptionFocused(false);
                                            }}
                                            className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/[0.05] border border-white/10 text-white/40 hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/20 transition-all"
                                            title="Cancel Changes"
                                        >
                                            <X size={18} />
                                        </button>
                                        <button 
                                            onClick={() => {
                                                setQuizData(p => ({ ...p, description: tempDescription }));
                                                setIsDescriptionFocused(false);
                                            }}
                                            className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/[0.05] border border-white/10 text-white/40 hover:text-green-500 hover:bg-green-500/10 hover:border-green-500/20 transition-all"
                                            title="Save Description"
                                        >
                                            <Check size={18} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[14px] font-bold text-white flex items-center gap-1.5">
                                <span className="text-red-500">*</span> Passing percentage
                            </label>
                            <div className="flex items-center">
                                <input type="number" value={quizData.passingPercentage} onChange={(e) => setQuizData(p => ({ ...p, passingPercentage: parseInt(e.target.value) || 0 }))} className="w-full h-12 bg-[#1a1a1a] border border-white/5 rounded-l-xl px-4 text-[16px] font-black text-primary-pink focus:outline-none focus:border-primary-pink/40 focus:bg-[#222222] transition-all" />
                                <div className="h-12 px-4 bg-white/[0.05] border border-white/5 border-l-0 rounded-r-xl flex items-center justify-center">
                                    <span className="text-[12px] text-white/20 font-black">%</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6 pt-10 border-t border-white/5">
                            {[{ label: 'Enforce passing grade to proceed', key: 'enforcePassingGrade' }, { label: 'Enable countdown', key: 'enableCountdown' }, { label: 'Retake assignment', key: 'allowRetake' }].map(item => (
                                <div key={item.key} className="flex items-center justify-between group cursor-pointer bg-[#1a1a1a] border border-white/10 p-5 rounded-2xl hover:bg-[#222222] hover:border-white/20 transition-all duration-300 shadow-md" onClick={() => setQuizData(p => ({ ...p, [item.key]: !p[item.key] }))}>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[13px] font-bold text-white/50 group-hover:text-white transition-colors">{item.label}</span>
                                        <Info size={12} className="text-white/20" />
                                    </div>
                                    <CustomSwitch checked={quizData[item.key]} onChange={(v) => setQuizData(p => ({ ...p, [item.key]: v }))} />
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>

                <main className="flex-1 overflow-y-auto px-10 py-12 scroll-smooth custom-scrollbar bg-black/30 relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
                    <div className="max-w-5xl mx-auto bg-[#2A2A2A] backdrop-blur-[40px] border border-white/10 rounded-[48px] p-12 shadow-[0_40px_100px_rgba(0,0,0,0.5)] relative">
                        <>
                            <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary-pink/5 rounded-full blur-[100px] pointer-events-none" />
                            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
                            <div className="flex items-start justify-between mb-16">
                                <div className="space-y-3">
                                    <span className="text-[10px] font-black text-primary-pink uppercase tracking-[0.5em] select-none">Assignment Overview</span>
                                    <h1 className="text-[42px] font-black text-white leading-none tracking-tighter">{quizData.title || 'Untitled'}</h1>
                                    <div className="flex items-center gap-6 pt-3">
                                        <div className="flex items-center bg-white/[0.03] px-3 py-1.5 rounded-xl border border-white/5">
                                            <span className="text-[9px] text-white/20 font-black uppercase tracking-widest mr-2.5">Question(s):</span>
                                            <span className="text-[18px] font-black text-white leading-none">{quizData.questions.length + (isAddingQuestion ? 1 : 0)}</span>
                                        </div>
                                        <div className="flex items-center bg-white/[0.03] px-3 py-1.5 rounded-xl border border-white/5">
                                            <span className="text-[9px] text-white/20 font-black uppercase tracking-widest mr-2.5">Total marks:</span>
                                            <span className="text-[18px] font-black text-primary-pink leading-none">
                                                {quizData.questions.reduce((s, q) => s + (q.marks || 1), 0) + (isAddingQuestion ? (pendingQuestionRef.current?.marks || 1) : 0)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setIsImporting(true)}
                                    className="flex items-center gap-2.5 px-6 py-3 bg-white/[0.02] border border-white/5 rounded-2xl text-[11px] font-black text-white/40 hover:text-white hover:border-white/20 transition-all uppercase tracking-widest leading-none shadow-2xl backdrop-blur-3xl mt-2"
                                >
                                    <Upload size={16} /> Import questions
                                </button>
                            </div>

                            {isImporting ? (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/5 rounded-[40px] p-16 flex flex-col items-center text-center relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-pink/[0.03] rounded-full blur-[100px] pointer-events-none" />
                                        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/[0.02] rounded-full blur-[100px] pointer-events-none" />
                                        
                                        <div className="w-24 h-24 bg-white/[0.03] border border-white/10 rounded-3xl flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-700 shadow-2xl">
                                            <div className="relative">
                                                <FileText size={40} className="text-white/20" />
                                                <div className="absolute -bottom-1 -right-1 bg-primary-pink text-[10px] font-black px-1.5 py-0.5 rounded shadow-lg">CSV</div>
                                            </div>
                                        </div>

                                        <h2 className="text-[28px] font-black text-white mb-3 tracking-tight">Import questions</h2>
                                        <p className="text-white/40 text-[15px] font-medium mb-12 max-w-md leading-relaxed">Bulk upload MCQ/Subjective questions for this assignment using our template.</p>
                                        
                                        <div className="w-full max-w-2xl aspect-[2/1] border-2 border-dashed border-white/10 rounded-[32px] flex flex-col items-center justify-center gap-6 group/drop hover:border-primary-pink/30 hover:bg-primary-pink/[0.01] transition-all duration-500 bg-white/[0.01]">
                                            <div className="text-white/20 group-hover/drop:text-primary-pink/40 transition-colors">
                                                <Upload size={32} />
                                            </div>
                                            <div className="space-y-2">
                                                <p className="text-[15px] font-bold text-white/60">Drag and drop your CSV here, or</p>
                                                <button className="px-10 py-3 rounded-xl bg-white text-black font-black text-[12px] uppercase tracking-widest hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all active:scale-95 shadow-xl">
                                                    Upload CSV
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-6 pt-4">
                                                <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Max questions: 100</span>
                                                <div className="w-1 h-1 rounded-full bg-white/5" />
                                                <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Max size: 50 MB</span>
                                            </div>
                                        </div>

                                        <div className="mt-12 flex flex-col items-center gap-6">
                                            <button className="flex items-center gap-2.5 text-primary-pink hover:text-white transition-all font-bold text-[12px] uppercase tracking-widest border-b border-primary-pink/20 pb-1">
                                                <Upload size={14} className="rotate-180" /> Download sample CSV template
                                            </button>
                                            <p className="text-[11px] font-bold text-white/20 flex items-center gap-2">
                                                <Info size={14} className="opacity-40" /> Need help? <span className="text-white/40 hover:text-white cursor-pointer transition-colors underline decoration-white/10 underline-offset-4">How to use the template</span>
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-4 mt-12 pt-10 border-t border-white/5 w-full justify-end">
                                            <button 
                                                onClick={() => setIsImporting(false)}
                                                className="px-10 py-3 rounded-xl border border-white/10 text-white font-bold text-[12px] hover:bg-white/5 transition-all uppercase tracking-widest"
                                            >
                                                Cancel
                                            </button>
                                            <button 
                                                className="px-12 py-3 rounded-xl bg-white/20 text-white/50 cursor-not-allowed font-black text-[12px] transition-all uppercase tracking-widest"
                                                disabled
                                            >
                                                Import
                                            </button>
                                        </div>

                                        <button 
                                            onClick={() => setIsImporting(false)}
                                            className="absolute top-8 right-8 w-12 h-12 rounded-full bg-white/[0.03] border border-white/5 flex items-center justify-center text-white/20 hover:text-white hover:bg-white/10 transition-all"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                {quizData.questions.map((q, idx) => (
                                    editingQuestionId === q.id ? (
                                        <AddQuestionForm 
                                            key={q.id}
                                            initialData={q}
                                            onCancel={() => { setEditingQuestionId(null); pendingQuestionRef.current = null; }} 
                                            onSave={handleSaveNewQuestion} 
                                            onStateChange={(state) => pendingQuestionRef.current = state}
                                        />
                                    ) : (
                                        <QuestionCard 
                                            key={q.id} 
                                            question={q} 
                                            index={idx} 
                                            onRemove={() => removeQuestion(q.id)} 
                                            onClone={() => handleCloneQuestion(idx)}
                                            onEdit={() => handleEditQuestion(q.id)}
                                            onDragStart={handleDragStart}
                                            onDragOver={handleDragOver}
                                            onDragEnd={handleDragEnd}
                                        />
                                    )
                                ))}

                                {isAddingQuestion ? (
                                    <AddQuestionForm 
                                        onCancel={() => { setIsAddingQuestion(false); pendingQuestionRef.current = null; }} 
                                        onSave={handleSaveNewQuestion} 
                                        onStateChange={(state) => pendingQuestionRef.current = state}
                                    />
                                ) : (
                                    <div className="pt-10 pb-32">
                                        <button onClick={startAdding} className="w-full py-8 border-2 border-dashed border-white/[0.03] rounded-3xl flex flex-col items-center justify-center gap-4 text-white/10 hover:border-primary-pink/20 hover:text-primary-pink/50 hover:bg-primary-pink/[0.02] transition-all group active:scale-[0.99] bg-white/[0.005]">
                                            <div className="w-11 h-11 rounded-full border border-dashed border-white/10 group-hover:border-primary-pink/30 flex items-center justify-center transition-all bg-white/[0.01]">
                                                <Plus size={22} className="group-hover:rotate-90 transition-transform duration-500" />
                                            </div>
                                            <span className="text-[11px] font-black uppercase tracking-[0.4em]">Add new question</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                        </>
                    </div>
                </main>
            </div>

            {showPreview && (
                <QuizLearnerPreview 
                    quizData={quizData} 
                    onClose={() => setShowPreview(false)} 
                />
            )}
        </div>
    );
};

export default QuizModal;
