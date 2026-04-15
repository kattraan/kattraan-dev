import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  BookOpen, 
  GripHorizontal, 
  ChevronDown,
  Eye,
  FileText,
  Copy,
  Trash2,
  Loader2,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { useConfirmDialog } from '@/components/ui/ConfirmDialog';
import InitializeCourseModal from '@/features/courses/components/InitializeCourseModal';
import { 
    fetchInstructorCourses, 
    deleteCourse, 
    cloneCourse, 
    createCourse 
} from '@/features/courses/store/courseSlice';
import DashboardLayout from '@/components/layout/DashboardLayout';

/**
 * Feature component for managing instructor courses.
 */
const MyCoursesFeature = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const toast = useToast();
    const { confirm } = useConfirmDialog();
    const { courses, loading } = useSelector((state) => state.courses);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeCourseId, setActiveCourseId] = useState(null);
    const [isCreating, setIsCreating] = useState(false);
    const [cloningId, setCloningId] = useState(null);
    const dropdownRef = useRef(null);

    useEffect(() => {
        dispatch(fetchInstructorCourses());
    }, [dispatch]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setActiveCourseId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleCreateCourse = async (data) => {
        setIsCreating(true);
        try {
            const response = await dispatch(createCourse({ 
                title: data.title,
                status: 'Draft',
                chapters: [],
                price: 0
            })).unwrap();
            setIsModalOpen(false);
            navigate(`/instructor-dashboard/edit-course/${response._id}`);
        } catch (err) {
            toast.error('Create Failed', err?.apiMessageForToast?.message || 'Failed to create course.');
        } finally {
            setIsCreating(false);
        }
    };

    const handleDelete = async (id) => {
        const confirmed = await confirm({ title: 'Delete this course?', message: 'This action cannot be undone.' });
        if (confirmed) {
            dispatch(deleteCourse(id));
            setActiveCourseId(null);
        }
    };

    const handleDuplicate = async (e, id) => {
        e.stopPropagation();
        setActiveCourseId(null);
        setCloningId(id);
        try {
            const result = await dispatch(cloneCourse(id)).unwrap();
            const newCourse = result?.data ?? result;
            const newId = newCourse?._id ?? newCourse?.id;
            if (newId) {
                toast.success('Duplicated', 'Course duplicated. You can edit the copy now.');
                navigate(`/instructor-dashboard/edit-course/${newId}`);
            } else {
                toast.success('Duplicated', 'Course duplicated successfully.');
                dispatch(fetchInstructorCourses());
            }
        } catch (err) {
            toast.error('Duplicate failed', err?.message || 'Failed to duplicate course.');
        } finally {
            setCloningId(null);
        }
    };

    const EmptyView = () => (
        <Card className="flex flex-col items-center justify-center py-20 text-center border-dashed mt-8 bg-gray-50 dark:bg-white/[0.02] border-gray-300 dark:border-white/5 shadow-sm dark:shadow-none transition-colors duration-300">
            <div className="w-20 h-20 bg-gray-200 dark:bg-white/5 rounded-full flex items-center justify-center mb-6 text-gray-400 dark:text-white/20 transition-colors duration-300">
                <BookOpen size={40} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">No courses yet</h3>
            <Button onClick={() => setIsModalOpen(true)} className="mt-4">
                <Plus size={20} /> Create Your First Course
            </Button>
        </Card>
    );

    return (
        <DashboardLayout
            title="My Courses"
            subtitle="Build, structure, and publish your courses with complete control."
            headerRight={
                <Button 
                    onClick={() => setIsModalOpen(true)} 
                    className="bg-gradient-to-r from-[#FF8C42] to-[#FF3FB4] hover:opacity-90 text-white rounded-xl px-6 shadow-lg transition-all"
                >
                    <Plus size={20} /> Create Course
                </Button>
            }
        >
        <div className="space-y-10 font-satoshi">
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="w-10 h-10 text-primary-pink animate-spin" />
                </div>
            ) : courses.length === 0 ? (
                <EmptyView />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-w-[1280px] mx-auto">
                    {courses.map((course) => (
                        <Card 
                            key={course._id} 
                            onClick={() => navigate(`/instructor-dashboard/edit-course/${course._id}`)}
                            className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 overflow-hidden flex flex-col cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-all duration-300 rounded-xl shadow-sm dark:shadow-none"
                        >
                            <div className="aspect-[16/10] bg-gray-100 dark:bg-gradient-to-br dark:from-primary-pink/10 dark:to-primary-pink/5 relative flex items-center justify-center overflow-hidden transition-colors duration-300">
                                {course.image || course.thumbnail ? 
                                    <img src={course.image || course.thumbnail} className="absolute inset-0 w-full h-full object-cover" alt={course.title} loading="lazy" /> 
                                    : <BookOpen className="text-gray-300 dark:text-white/10 transition-colors duration-300" size={32} />}
                            </div>
                            <div className="p-4 flex flex-col flex-grow">
                                <div className="flex items-center gap-2 mb-2">
                                    <Badge
                                        className="bg-primary-pink/10 dark:bg-primary-pink/15 border border-primary-pink/20 dark:border-primary-pink/25 text-[10px] px-2 py-0.5 font-semibold transition-colors duration-300 bg-gradient-to-r from-[#FF8C42] to-[#FF3FB4] bg-clip-text text-transparent"
                                    >
                                        {course.status || 'Draft'}
                                    </Badge>
                                </div>
                                <h3 className="text-gray-900 dark:text-white font-bold text-sm mb-auto line-clamp-2">
                                    {course.title}
                                </h3>
                                <div className="flex gap-1.5 mt-3 relative">
                                    <Button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/instructor-dashboard/edit-course/${course._id}`);
                                        }} 
                                        variant="outline"
                                        size="sm"
                                        className="flex-grow rounded-lg text-xs font-semibold border-primary-pink/35 text-transparent bg-clip-text [background-image:linear-gradient(to_right,#FF8C42,#FF3FB4)] bg-transparent hover:bg-transparent hover:text-transparent hover:bg-clip-text hover:[background-image:linear-gradient(to_right,#FF8C42,#FF3FB4)] shadow-none transition-all py-1.5 px-4 dark:border-0 dark:text-white dark:bg-clip-border dark:[background-image:none] dark:!bg-gradient-to-r dark:!from-[#FF8C42] dark:!to-[#FF3FB4] dark:hover:!bg-gradient-to-r dark:hover:!from-[#FF8C42] dark:hover:!to-[#FF3FB4] dark:hover:opacity-90 dark:shadow-sm"
                                    >
                                        Edit & Manage
                                    </Button>
                                    <div className="relative">
                                        <Button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveCourseId(activeCourseId === course._id ? null : course._id);
                                            }} 
                                            variant="outline"
                                            size="sm"
                                            className="p-2 rounded-lg border-gray-200 bg-transparent hover:bg-gray-50 hover:border-primary-pink/35 text-gray-600 shadow-none transition-all dark:bg-white/5 dark:border-white/10 dark:hover:bg-white/10 dark:hover:border-white/20 dark:text-white"
                                        >
                                            <MoreVertical size={16} />
                                        </Button>
                                        {activeCourseId === course._id && (
                                            <div ref={dropdownRef} className="absolute bottom-full right-0 mb-2 w-48 bg-white dark:bg-[#1a1625]/95 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden z-50 shadow-2xl transition-colors duration-300">
                                                <button 
                                                    onClick={(e) => handleDuplicate(e, course._id)}
                                                    disabled={cloningId === course._id}
                                                    className="w-full text-left px-4 py-3 text-gray-700 dark:text-white/90 hover:bg-gray-50 dark:hover:bg-white/10 flex items-center gap-3 text-sm font-medium transition-colors disabled:opacity-60"
                                                >
                                                    {cloningId === course._id ? (
                                                        <Loader2 size={16} className="animate-spin" /> 
                                                    ) : (
                                                        <Copy size={16} />
                                                    )}
                                                    {cloningId === course._id ? 'Duplicating…' : 'Duplicate'}
                                                </button>
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(course._id);
                                                    }} 
                                                    className="w-full text-left px-4 py-3 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-300 flex items-center gap-3 text-sm font-medium transition-colors"
                                                >
                                                    <Trash2 size={16} /> Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            <InitializeCourseModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onContinue={handleCreateCourse} isCreating={isCreating} />
        </div>
        </DashboardLayout>
    );
};

export default MyCoursesFeature;
