import React, { useState } from 'react';
import { Modal, Input, Button } from '@/components/ui';

/**
 * @param {{ isOpen: boolean, onClose: () => void, courses: Array<{_id: string, title: string}>, onCreate: (payload: {course: string, name: string, description: string}) => void, loading?: boolean }} props
 */
const CreateCommunityModal = ({ isOpen, onClose, courses, onCreate, loading = false }) => {
    const [courseId, setCourseId] = useState('');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const trimmedName = name.trim();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!courseId || !trimmedName) return;
        onCreate({ course: courseId, name: trimmedName, description });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create Community">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <label className="text-gray-700 dark:text-white text-[15px] font-normal ml-1 block">Course</label>
                    <select
                        value={courseId}
                        onChange={(e) => setCourseId(e.target.value)}
                        required
                        className="w-full bg-gray-50 dark:bg-white/[0.05] border border-gray-200 dark:border-white/10 rounded-xl py-2.5 px-6 text-gray-900 dark:text-white text-[14px] focus:outline-none focus:border-gray-400 dark:focus:border-white/70"
                    >
                        <option value="" disabled className="bg-white dark:bg-[#1a1625] text-gray-900 dark:text-white">
                            Select a course…
                        </option>
                        {courses.map((c) => (
                            <option key={c._id} value={c._id} className="bg-white dark:bg-[#1a1625] text-gray-900 dark:text-white">
                                {c.title}
                            </option>
                        ))}
                    </select>
                </div>

                <Input
                    label="Community name"
                    placeholder="e.g. React Mastery Discussions"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />

                <Input
                    label="Description (optional)"
                    placeholder="What's this community for?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />

                <Button type="submit" className="w-full" isLoading={loading} disabled={!courseId || !trimmedName}>
                    Create Community
                </Button>
            </form>
        </Modal>
    );
};

export default CreateCommunityModal;
