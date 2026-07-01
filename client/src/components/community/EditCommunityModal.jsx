import React, { useEffect, useState } from 'react';
import { Modal, Input, Button } from '@/components/ui';

/**
 * @param {{ isOpen: boolean, onClose: () => void, community: {name: string, description?: string} | null, onSave: (payload: {name: string, description: string}) => void, loading?: boolean }} props
 */
const EditCommunityModal = ({ isOpen, onClose, community, onSave, loading = false }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        if (community) {
            setName(community.name || '');
            setDescription(community.description || '');
        }
    }, [community]);

    const trimmedName = name.trim();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!trimmedName) return;
        onSave({ name: trimmedName, description });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Community">
            <form onSubmit={handleSubmit} className="space-y-4">
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

                <Button type="submit" className="w-full" isLoading={loading} disabled={!trimmedName}>
                    Save Changes
                </Button>
            </form>
        </Modal>
    );
};

export default EditCommunityModal;
